"""
PayGuard model training module.

Trains an XGBoost fraud-classification model using the same feature
contract used by the deployed PayGuard model.

This script is intended for reproducible retraining.
"""

import json
from pathlib import Path

import joblib
import pandas as pd
from xgboost import XGBClassifier


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = PROJECT_ROOT / "data" / "processed" / "train.csv"
FEATURES_PATH = PROJECT_ROOT / "models" / "model_input_features.json"
MODEL_PATH = PROJECT_ROOT / "models" / "fraud_model.pkl"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TARGET_COLUMN = "isFraud"

RANDOM_STATE = 42

# Final deployment threshold selected during validation.
FRAUD_THRESHOLD = 0.85


# ---------------------------------------------------------------------------
# Feature loading
# ---------------------------------------------------------------------------

def load_model_features() -> list[str]:
    """Load the exact feature list expected by the PayGuard model."""

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
# Dataset loading
# ---------------------------------------------------------------------------

def load_training_data() -> tuple[pd.DataFrame, pd.Series]:
    """
    Load the processed training dataset.

    The processed dataset must contain:
        - all model input features
        - isFraud target column
    """

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Processed training data not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

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
            "Training data is missing required features: "
            + ", ".join(missing_features)
        )

    X = df[features].copy()
    y = df[TARGET_COLUMN].copy()

    return X, y


# ---------------------------------------------------------------------------
# Model creation
# ---------------------------------------------------------------------------

def create_model() -> XGBClassifier:
    """
    Create the PayGuard XGBoost classifier.

    NOTE:
    Replace the parameters in this function with the exact final
    parameters used in the original notebook if retraining is required.
    """

    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    return model


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_model() -> XGBClassifier:
    """Train and return the XGBoost fraud detection model."""

    X, y = load_training_data()

    print("Training PayGuard XGBoost model...")
    print(f"Training rows: {len(X):,}")
    print(f"Input features: {len(X.columns)}")
    print(f"Fraud cases: {int(y.sum()):,}")
    print(f"Fraud rate: {y.mean():.4%}")

    model = create_model()

    model.fit(X, y)

    print("\nTraining completed successfully.")

    return model


# ---------------------------------------------------------------------------
# Save model
# ---------------------------------------------------------------------------

def save_model(model: XGBClassifier) -> None:
    """Save the trained model to the models directory."""

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    print(f"Model saved to: {MODEL_PATH}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    print("=" * 50)
    print("PayGuard - Model Training")
    print("=" * 50)

    print(f"Fraud threshold: {FRAUD_THRESHOLD}")

    model = train_model()

    save_model(model)

    print("\nTraining pipeline completed.")