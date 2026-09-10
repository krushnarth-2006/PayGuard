"""
PayGuard model evaluation module.

Evaluates the trained fraud detection model using:
    - Precision
    - Recall
    - F1-score
    - PR-AUC
    - Confusion matrix

The final fraud decision threshold used by PayGuard is 0.85.

This module does NOT train or modify the model.
"""

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd

from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


# ---------------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "models" / "fraud_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.pkl"
FEATURES_PATH = PROJECT_ROOT / "models" / "model_input_features.json"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TARGET_COLUMN = "isFraud"

# Selected during validation/threshold tuning.
FRAUD_THRESHOLD = 0.85


# ---------------------------------------------------------------------------
# Artifact loading
# ---------------------------------------------------------------------------

def load_model():
    """Load the trained PayGuard model."""

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def load_preprocessor():
    """Load the exact preprocessing pipeline used during training."""

    if not PREPROCESSOR_PATH.exists():
        raise FileNotFoundError(
            f"Preprocessor file not found: {PREPROCESSOR_PATH}"
        )

    return joblib.load(PREPROCESSOR_PATH)


def load_model_features() -> list[str]:
    """Load the exact ordered feature list used by the model."""

    if not FEATURES_PATH.exists():
        raise FileNotFoundError(
            f"Feature file not found: {FEATURES_PATH}"
        )

    with open(FEATURES_PATH, "r", encoding="utf-8") as file:
        features = json.load(file)

    if not isinstance(features, list) or not features:
        raise ValueError(
            "model_input_features.json must contain a non-empty list."
        )

    return features


# ---------------------------------------------------------------------------
# Dataset preparation
# ---------------------------------------------------------------------------

def prepare_evaluation_data(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Separate features and target from an evaluation dataset.

    The dataset must contain:
        - isFraud
        - all 422 model input features
    """

    if not isinstance(df, pd.DataFrame):
        raise TypeError(
            "Evaluation data must be a pandas DataFrame."
        )

    if df.empty:
        raise ValueError(
            "Evaluation dataset is empty."
        )

    if TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"Target column '{TARGET_COLUMN}' is missing."
        )

    features = load_model_features()

    missing_features = [
        feature
        for feature in features
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Evaluation data is missing required model features: "
            + ", ".join(missing_features)
        )

    X = df[features].copy()
    y = df[TARGET_COLUMN].copy()

    return X, y


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def generate_probabilities(
    X: pd.DataFrame,
) -> tuple:
    """
    Generate fraud probabilities using the saved preprocessing
    pipeline and trained model.
    """

    preprocessor = load_preprocessor()
    model = load_model()

    X_transformed = preprocessor.transform(X)

    probabilities = model.predict_proba(X_transformed)[:, 1]

    return probabilities


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

def evaluate_predictions(
    y_true: pd.Series,
    fraud_probabilities,
    threshold: float = FRAUD_THRESHOLD,
) -> dict:
    """
    Calculate fraud detection metrics at a specified threshold.

    Returns
    -------
    dict
        Evaluation metrics and confusion matrix.
    """

    if not 0.0 <= threshold <= 1.0:
        raise ValueError(
            "Threshold must be between 0 and 1."
        )

    predictions = (
        fraud_probabilities >= threshold
    ).astype(int)

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0,
    )

    pr_auc = average_precision_score(
        y_true,
        fraud_probabilities,
    )

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    ).ravel()

    return {
        "threshold": threshold,
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "pr_auc": float(pr_auc),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
    }


# ---------------------------------------------------------------------------
# Threshold comparison
# ---------------------------------------------------------------------------

def evaluate_thresholds(
    y_true: pd.Series,
    fraud_probabilities,
    thresholds=None,
) -> pd.DataFrame:
    """
    Evaluate model performance across multiple probability thresholds.

    This is useful for understanding the trade-off between:
        - false positives
        - false negatives
        - precision
        - recall
        - F1

    The function does not change the selected production threshold.
    """

    if thresholds is None:
        thresholds = [
            0.10,
            0.20,
            0.30,
            0.40,
            0.50,
            0.60,
            0.70,
            0.80,
            0.85,
            0.90,
            0.95,
        ]

    results = []

    for threshold in thresholds:
        metrics = evaluate_predictions(
            y_true,
            fraud_probabilities,
            threshold,
        )

        results.append(metrics)

    return pd.DataFrame(results)


# ---------------------------------------------------------------------------
# Full evaluation
# ---------------------------------------------------------------------------

def evaluate_dataset(
    df: pd.DataFrame,
    threshold: float = FRAUD_THRESHOLD,
) -> dict:
    """
    Run the complete evaluation pipeline.
    """

    X, y = prepare_evaluation_data(df)

    probabilities = generate_probabilities(X)

    metrics = evaluate_predictions(
        y,
        probabilities,
        threshold,
    )

    return metrics


# ---------------------------------------------------------------------------
# Display
# ---------------------------------------------------------------------------

def print_evaluation_report(metrics: dict) -> None:
    """Print a readable evaluation report."""

    print("\n" + "=" * 55)
    print("PAYGUARD MODEL EVALUATION")
    print("=" * 55)

    print(f"\nDecision threshold : {metrics['threshold']:.2f}")

    print("\nPerformance Metrics")
    print("-" * 30)

    print(f"Precision          : {metrics['precision']:.4f}")
    print(f"Recall             : {metrics['recall']:.4f}")
    print(f"F1-score           : {metrics['f1_score']:.4f}")
    print(f"PR-AUC             : {metrics['pr_auc']:.4f}")

    print("\nConfusion Matrix")
    print("-" * 30)

    print(f"True Negatives     : {metrics['true_negatives']:,}")
    print(f"False Positives    : {metrics['false_positives']:,}")
    print(f"False Negatives    : {metrics['false_negatives']:,}")
    print(f"True Positives     : {metrics['true_positives']:,}")

    print("\n" + "=" * 55)


# ---------------------------------------------------------------------------
# Command-line interface
# ---------------------------------------------------------------------------

def main():
    """Run evaluation from the command line."""

    parser = argparse.ArgumentParser(
        description="Evaluate the PayGuard fraud detection model."
    )

    parser.add_argument(
        "--data",
        required=True,
        help="Path to the evaluation CSV file.",
    )

    parser.add_argument(
        "--threshold",
        type=float,
        default=FRAUD_THRESHOLD,
        help="Fraud decision threshold. Default: 0.85",
    )

    args = parser.parse_args()

    data_path = Path(args.data)

    if not data_path.exists():
        raise FileNotFoundError(
            f"Evaluation dataset not found: {data_path}"
        )

    print(f"Loading evaluation data: {data_path}")

    df = pd.read_csv(data_path)

    print(f"Rows loaded: {len(df):,}")

    metrics = evaluate_dataset(
        df,
        threshold=args.threshold,
    )

    print_evaluation_report(metrics)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    main()