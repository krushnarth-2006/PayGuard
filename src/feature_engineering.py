"""
Feature engineering utilities for PayGuard.

The trained PayGuard model was built using a fixed set of input features.
This module provides reusable utilities to prepare transaction data
without recreating or changing the fitted preprocessing pipeline.

The fitted preprocessing pipeline is stored in:
    models/preprocessor.pkl

The exact model input feature list is stored in:
    models/model_input_features.json
"""

import json
from pathlib import Path

import pandas as pd


# ---------------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

FEATURES_PATH = PROJECT_ROOT / "models" / "model_input_features.json"


# ---------------------------------------------------------------------------
# Feature list
# ---------------------------------------------------------------------------

def load_model_input_features() -> list[str]:
    """
    Load the exact feature list used by the trained model.

    Returns
    -------
    list[str]
        Ordered list of model input features.
    """

    if not FEATURES_PATH.exists():
        raise FileNotFoundError(
            f"Model input feature file not found: {FEATURES_PATH}"
        )

    with open(FEATURES_PATH, "r", encoding="utf-8") as file:
        features = json.load(file)

    if not isinstance(features, list):
        raise ValueError(
            "model_input_features.json must contain a JSON list."
        )

    if not features:
        raise ValueError(
            "model_input_features.json contains no features."
        )

    if len(features) != len(set(features)):
        raise ValueError(
            "Duplicate feature names found in model_input_features.json."
        )

    return features


# ---------------------------------------------------------------------------
# Feature validation
# ---------------------------------------------------------------------------

def validate_features(df: pd.DataFrame) -> None:
    """
    Validate that the input DataFrame contains all model-required features.

    Parameters
    ----------
    df : pandas.DataFrame
        Input transaction data.

    Raises
    ------
    ValueError
        If one or more required features are missing.
    """

    required_features = load_model_input_features()

    missing_features = [
        feature
        for feature in required_features
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Input data is missing required model features: "
            + ", ".join(missing_features)
        )


# ---------------------------------------------------------------------------
# Feature preparation
# ---------------------------------------------------------------------------

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare transaction data for the saved preprocessing pipeline.

    This function:
    1. Validates the required feature set.
    2. Selects only model input features.
    3. Preserves the exact feature order used during training.

    The function does NOT fit or modify any preprocessing step.

    Parameters
    ----------
    df : pandas.DataFrame
        Raw transaction DataFrame.

    Returns
    -------
    pandas.DataFrame
        DataFrame containing the exact model input features.
    """

    if not isinstance(df, pd.DataFrame):
        raise TypeError(
            "Input must be a pandas DataFrame."
        )

    if df.empty:
        raise ValueError(
            "Input DataFrame is empty."
        )

    validate_features(df)

    required_features = load_model_input_features()

    prepared_df = df.loc[:, required_features].copy()

    return prepared_df


# ---------------------------------------------------------------------------
# Single transaction helper
# ---------------------------------------------------------------------------

def prepare_transaction(transaction: dict) -> pd.DataFrame:
    """
    Convert a single transaction dictionary into a model-ready DataFrame.

    Parameters
    ----------
    transaction : dict
        Transaction feature dictionary.

    Returns
    -------
    pandas.DataFrame
        One-row DataFrame with the exact model feature order.
    """

    if not isinstance(transaction, dict):
        raise TypeError(
            "Transaction must be provided as a dictionary."
        )

    if not transaction:
        raise ValueError(
            "Transaction dictionary is empty."
        )

    df = pd.DataFrame([transaction])

    return prepare_features(df)


# ---------------------------------------------------------------------------
# Feature information
# ---------------------------------------------------------------------------

def get_feature_count() -> int:
    """
    Return the number of features expected by the trained model.
    """

    return len(load_model_input_features())


# ---------------------------------------------------------------------------
# Local verification
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    features = load_model_input_features()

    print("PayGuard feature engineering module")
    print("-" * 40)
    print(f"Feature file: {FEATURES_PATH}")
    print(f"Number of model input features: {len(features)}")

    print("\nFeature list validation successful.")

    print("\nFirst 10 features:")
    for feature in features[:10]:
        print(f"  - {feature}")

    print("\nLast 10 features:")
    for feature in features[-10:]:
        print(f"  - {feature}")