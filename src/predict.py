"""
Prediction utilities for PayGuard fraud detection.

This module loads the trained model and preprocessing pipeline,
prepares incoming transaction data, and returns a fraud prediction.
"""

import json
from pathlib import Path

import joblib
import pandas as pd


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "models" / "fraud_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.pkl"
FEATURES_PATH = PROJECT_ROOT / "models" / "model_input_features.json"


# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------

FRAUD_THRESHOLD = 0.85


# ---------------------------------------------------------------------------
# Load artifacts
# ---------------------------------------------------------------------------

def load_model():
    """Load the trained fraud detection model."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def load_preprocessor():
    """Load the preprocessing pipeline used during model training."""
    if not PREPROCESSOR_PATH.exists():
        raise FileNotFoundError(
            f"Preprocessor file not found: {PREPROCESSOR_PATH}"
        )

    return joblib.load(PREPROCESSOR_PATH)


def load_model_input_features():
    """Load the exact input feature list expected by the model."""
    if not FEATURES_PATH.exists():
        raise FileNotFoundError(
            f"Feature file not found: {FEATURES_PATH}"
        )

    with open(FEATURES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict_transaction(transaction: dict) -> dict:
    """
    Predict whether a transaction is fraudulent.

    Parameters
    ----------
    transaction : dict
        Transaction data containing the features expected by the model.

    Returns
    -------
    dict
        Prediction result containing:
        - fraud_probability
        - prediction
        - risk_level
    """

    # Convert transaction dictionary into a DataFrame
    df = pd.DataFrame([transaction])

    # Load exact feature list used by the trained model
    model_features = load_model_input_features()

    # Validate required feature structure
    missing_features = [
        feature
        for feature in model_features
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    # Keep features in exactly the same order as training
    df = df[model_features]

    # Load trained preprocessing pipeline
    preprocessor = load_preprocessor()

    # Transform transaction using the SAME preprocessing pipeline
    transformed_data = preprocessor.transform(df)

    # Load trained model
    model = load_model()

    # Get fraud probability
    fraud_probability = float(
        model.predict_proba(transformed_data)[0][1]
    )

    # Apply the validated threshold selected during ML experimentation
    if fraud_probability >= FRAUD_THRESHOLD:
        prediction = "FRAUD"
    else:
        prediction = "NOT FRAUD"

    # Determine risk level
    if fraud_probability >= FRAUD_THRESHOLD:
        risk_level = "HIGH"
    elif fraud_probability >= 0.50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "fraud_probability": round(fraud_probability, 4),
        "prediction": prediction,
        "risk_level": risk_level,
    }


# ---------------------------------------------------------------------------
# Batch prediction
# ---------------------------------------------------------------------------

def predict_transactions(transactions: pd.DataFrame) -> pd.DataFrame:
    """
    Predict fraud for multiple transactions.

    Parameters
    ----------
    transactions : pandas.DataFrame
        DataFrame containing transaction features.

    Returns
    -------
    pandas.DataFrame
        Original transactions with prediction results appended.
    """

    model_features = load_model_input_features()

    missing_features = [
        feature
        for feature in model_features
        if feature not in transactions.columns
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    # Keep exact feature order
    X = transactions[model_features].copy()

    # Load artifacts
    preprocessor = load_preprocessor()
    model = load_model()

    # Transform data
    transformed_data = preprocessor.transform(X)

    # Get probabilities
    probabilities = model.predict_proba(transformed_data)[:, 1]

    # Apply threshold
    predictions = [
        "FRAUD" if probability >= FRAUD_THRESHOLD else "NOT FRAUD"
        for probability in probabilities
    ]

    # Risk levels
    risk_levels = [
        (
            "HIGH"
            if probability >= FRAUD_THRESHOLD
            else "MEDIUM"
            if probability >= 0.50
            else "LOW"
        )
        for probability in probabilities
    ]

    # Return results
    result = transactions.copy()

    result["fraud_probability"] = probabilities.round(4)
    result["prediction"] = predictions
    result["risk_level"] = risk_levels

    return result


# ---------------------------------------------------------------------------
# Simple local test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("PayGuard prediction module")
    print("-" * 40)

    print(f"Model:        {MODEL_PATH}")
    print(f"Preprocessor: {PREPROCESSOR_PATH}")
    print(f"Features:     {FEATURES_PATH}")
    print(f"Threshold:    {FRAUD_THRESHOLD}")

    # Verify that all artifacts exist
    model = load_model()
    preprocessor = load_preprocessor()
    features = load_model_input_features()

    print("\nArtifacts loaded successfully.")
    print(f"Model type: {type(model).__name__}")
    print(f"Preprocessor type: {type(preprocessor).__name__}")
    print(f"Number of input features: {len(features)}")