"""
Prepare IEEE-CIS data for PayGuard model training.

This script:
1. Loads IEEE-CIS transaction and identity data.
2. Merges them using TransactionID.
3. Creates TransactionHour and TransactionDay.
4. Selects the existing 422 PayGuard model features.
5. Performs a stratified train/test split.
6. Saves train.csv and test.csv.

It does NOT modify the existing model or API artifacts.
"""

from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

TRANSACTION_PATH = (
    PROJECT_ROOT / "data" / "raw" / "train_transaction.csv"
)

IDENTITY_PATH = (
    PROJECT_ROOT / "data" / "raw" / "train_identity.csv"
)

FEATURES_PATH = (
    PROJECT_ROOT / "models" / "model_input_features.json"
)

OUTPUT_DIR = PROJECT_ROOT / "data" / "processed"

TRAIN_PATH = OUTPUT_DIR / "train.csv"
TEST_PATH = OUTPUT_DIR / "test.csv"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TARGET_COLUMN = "isFraud"
RANDOM_STATE = 42
TEST_SIZE = 0.20


# ---------------------------------------------------------------------------
# Load model feature contract
# ---------------------------------------------------------------------------

def load_model_features() -> list[str]:
    import json

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
# Create time features
# ---------------------------------------------------------------------------

def create_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create TransactionHour and TransactionDay from TransactionDT.

    TransactionDT is measured in seconds from the dataset's
    reference timestamp.
    """

    if "TransactionDT" not in df.columns:
        raise ValueError(
            "TransactionDT is required to create time features."
        )

    seconds_per_day = 24 * 60 * 60

    df["TransactionHour"] = (
        (df["TransactionDT"] % seconds_per_day) // 3600
    ).astype("int16")

    df["TransactionDay"] = (
        df["TransactionDT"] // seconds_per_day
    ).astype("int16")

    return df


# ---------------------------------------------------------------------------
# Main preparation
# ---------------------------------------------------------------------------

def prepare_dataset() -> None:

    print("=" * 65)
    print("PAYGUARD - IEEE-CIS TRAINING DATA PREPARATION")
    print("=" * 65)

    # Validate input files
    if not TRANSACTION_PATH.exists():
        raise FileNotFoundError(
            f"Transaction dataset not found: {TRANSACTION_PATH}"
        )

    if not IDENTITY_PATH.exists():
        raise FileNotFoundError(
            f"Identity dataset not found: {IDENTITY_PATH}"
        )

    # Load model feature contract
    model_features = load_model_features()

    print(f"\nRequired PayGuard features : {len(model_features)}")

    # -----------------------------------------------------------------------
    # Load transaction data
    # -----------------------------------------------------------------------

    print("\nLoading transaction data...")

    transactions = pd.read_csv(
        TRANSACTION_PATH,
        low_memory=False,
    )

    print(f"Transaction rows : {len(transactions):,}")
    print(f"Transaction cols : {len(transactions.columns):,}")

    # -----------------------------------------------------------------------
    # Load identity data
    # -----------------------------------------------------------------------

    print("\nLoading identity data...")

    identity = pd.read_csv(
        IDENTITY_PATH,
        low_memory=False,
    )

    print(f"Identity rows : {len(identity):,}")
    print(f"Identity cols : {len(identity.columns):,}")

    # -----------------------------------------------------------------------
    # Merge
    # -----------------------------------------------------------------------

    print("\nMerging transaction + identity data...")

    df = transactions.merge(
        identity,
        on="TransactionID",
        how="left",
        suffixes=("", "_identity"),
    )

    print(f"Merged rows : {len(df):,}")
    print(f"Merged cols : {len(df.columns):,}")

    # -----------------------------------------------------------------------
    # Create engineered features
    # -----------------------------------------------------------------------

    print("\nCreating TransactionHour and TransactionDay...")

    df = create_time_features(df)

    # -----------------------------------------------------------------------
    # Validate target
    # -----------------------------------------------------------------------

    if TARGET_COLUMN not in df.columns:
        raise ValueError(
            f"Target column '{TARGET_COLUMN}' is missing."
        )

    # -----------------------------------------------------------------------
    # Validate model features
    # -----------------------------------------------------------------------

    missing_features = [
        feature
        for feature in model_features
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Required PayGuard features are missing:\n"
            + "\n".join(missing_features)
        )

    # -----------------------------------------------------------------------
    # Select exact feature contract
    # -----------------------------------------------------------------------

    print("\nSelecting exact PayGuard feature contract...")

    X = df[model_features].copy()
    y = df[TARGET_COLUMN].copy()

    print(f"Feature matrix : {X.shape}")
    print(f"Target rows    : {len(y):,}")

    # -----------------------------------------------------------------------
    # Train/test split
    # -----------------------------------------------------------------------

    print("\nCreating stratified train/test split...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    train_df = X_train.copy()
    train_df[TARGET_COLUMN] = y_train.values

    test_df = X_test.copy()
    test_df[TARGET_COLUMN] = y_test.values

    # -----------------------------------------------------------------------
    # Output directory
    # -----------------------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # -----------------------------------------------------------------------
    # Save datasets
    # -----------------------------------------------------------------------

    print("\nSaving training dataset...")

    train_df.to_csv(
        TRAIN_PATH,
        index=False,
    )

    print("Saving test dataset...")

    test_df.to_csv(
        TEST_PATH,
        index=False,
    )

    # -----------------------------------------------------------------------
    # Summary
    # -----------------------------------------------------------------------

    print("\n" + "=" * 65)
    print("DATA PREPARATION COMPLETED")
    print("=" * 65)

    print(f"\nTraining rows : {len(train_df):,}")
    print(f"Testing rows  : {len(test_df):,}")

    print("\nTraining fraud distribution:")
    print(train_df[TARGET_COLUMN].value_counts())

    print("\nTesting fraud distribution:")
    print(test_df[TARGET_COLUMN].value_counts())

    print(f"\nTraining file : {TRAIN_PATH}")
    print(f"Testing file  : {TEST_PATH}")

    print("\nNext step: train the PayGuard XGBoost model.")
    print("=" * 65)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    prepare_dataset()