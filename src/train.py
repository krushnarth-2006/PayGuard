"""
PayGuard model training module.

Trains an XGBoost fraud-classification model using the exact
feature contract and preprocessing pipeline used by PayGuard.

Training flow:
    train.csv
        ↓
    422 model features
        ↓
    ColumnTransformer preprocessing
        ↓
    XGBoost
        ↓
    fraud_model.pkl
    preprocessor.pkl
"""

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = PROJECT_ROOT / "data" / "processed" / "train.csv"
FEATURES_PATH = PROJECT_ROOT / "models" / "model_input_features.json"

MODEL_PATH = PROJECT_ROOT / "models" / "fraud_model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.pkl"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TARGET_COLUMN = "isFraud"

RANDOM_STATE = 42

FRAUD_THRESHOLD = 0.85


# ---------------------------------------------------------------------------
# Feature loading
# ---------------------------------------------------------------------------

def load_model_features() -> list[str]:
    """Load the exact 422 features expected by PayGuard."""

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
    """Load the prepared IEEE-CIS training dataset."""

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training data not found: {DATA_PATH}"
        )

    print(f"\nLoading training data: {DATA_PATH}")

    df = pd.read_csv(
        DATA_PATH,
        low_memory=False,
    )

    print(f"Rows loaded: {len(df):,}")
    print(f"Columns loaded: {len(df.columns):,}")

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
            "Training data is missing required features:\n"
            + "\n".join(missing_features)
        )

    X = df[features].copy()
    y = df[TARGET_COLUMN].copy()

    return X, y


# ---------------------------------------------------------------------------
# Preprocessor
# ---------------------------------------------------------------------------

def create_preprocessor(
    X: pd.DataFrame,
) -> ColumnTransformer:
    """
    Create the PayGuard preprocessing pipeline.

    Numeric:
        Median imputation
        ↓
        StandardScaler

    Categorical:
        Most-frequent imputation
        ↓
        OneHotEncoder
    """

    numeric_features = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_features = X.select_dtypes(
        include=["object", "category", "string"]
    ).columns.tolist()

    print("\nPreprocessing configuration")
    print("-" * 40)
    print(f"Numeric features     : {len(numeric_features)}")
    print(f"Categorical features : {len(categorical_features)}")

    numeric_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median"),
            ),
            (
                "scaler",
                StandardScaler(),
            ),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent"),
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                numeric_pipeline,
                numeric_features,
            ),
            (
                "cat",
                categorical_pipeline,
                categorical_features,
            ),
        ],
        remainder="drop",
    )

    return preprocessor


# ---------------------------------------------------------------------------
# Model creation
# ---------------------------------------------------------------------------

def create_model(
    scale_pos_weight: float,
) -> XGBClassifier:
    """
    Create the PayGuard XGBoost classifier.

    scale_pos_weight is calculated from the actual
    training dataset to handle class imbalance.
    """

    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=RANDOM_STATE,

        n_jobs=-1,

        tree_method="hist",

        learning_rate=0.1,
        max_depth=6,
        n_estimators=150,

        subsample=0.8,
        colsample_bytree=0.8,

        scale_pos_weight=scale_pos_weight,

        enable_categorical=False,
    )

    return model


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_model():
    """Train the PayGuard preprocessing pipeline and XGBoost model."""

    X, y = load_training_data()

    print("\n" + "=" * 60)
    print("PAYGUARD MODEL TRAINING")
    print("=" * 60)

    print(f"\nTraining rows : {len(X):,}")
    print(f"Input features: {len(X.columns):,}")

    legitimate_count = int((y == 0).sum())
    fraud_count = int((y == 1).sum())

    print(f"Legitimate    : {legitimate_count:,}")
    print(f"Fraud         : {fraud_count:,}")
    print(f"Fraud rate    : {y.mean():.4%}")

    # ---------------------------------------------------------------
    # Calculate class weight
    # ---------------------------------------------------------------

    scale_pos_weight = legitimate_count / fraud_count

    print(
        f"\nCalculated scale_pos_weight: "
        f"{scale_pos_weight:.6f}"
    )

    # ---------------------------------------------------------------
    # Create preprocessing pipeline
    # ---------------------------------------------------------------

    print("\nCreating preprocessing pipeline...")

    preprocessor = create_preprocessor(X)

    # ---------------------------------------------------------------
    # Fit preprocessing ONLY on training data
    # ---------------------------------------------------------------

    print("\nFitting preprocessor...")

    X_transformed = preprocessor.fit_transform(X)

    print("Preprocessing completed.")

    print(
        f"Transformed feature matrix: "
        f"{X_transformed.shape}"
    )

    # ---------------------------------------------------------------
    # Create model
    # ---------------------------------------------------------------

    print("\nCreating XGBoost model...")

    model = create_model(
        scale_pos_weight=scale_pos_weight
    )

    # ---------------------------------------------------------------
    # Train
    # ---------------------------------------------------------------

    print("\nTraining XGBoost...")
    print("This may take some time.")

    model.fit(
        X_transformed,
        y,
    )

    print("\nModel training completed successfully.")

    return model, preprocessor


# ---------------------------------------------------------------------------
# Save artifacts
# ---------------------------------------------------------------------------

def save_artifacts(
    model: XGBClassifier,
    preprocessor: ColumnTransformer,
) -> None:
    """Save the trained model and preprocessing pipeline."""

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("\nSaving model...")

    joblib.dump(
        model,
        MODEL_PATH,
    )

    print(f"Model saved to:")
    print(MODEL_PATH)

    print("\nSaving preprocessor...")

    joblib.dump(
        preprocessor,
        PREPROCESSOR_PATH,
    )

    print("Preprocessor saved to:")
    print(PREPROCESSOR_PATH)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("PAYGUARD - MODEL TRAINING")
    print("=" * 60)

    print(f"\nFraud threshold: {FRAUD_THRESHOLD}")

    model, preprocessor = train_model()

    save_artifacts(
        model,
        preprocessor,
    )

    print("\n" + "=" * 60)
    print("TRAINING PIPELINE COMPLETED")
    print("=" * 60)

    print("\nGenerated artifacts:")

    print(f"Model:")
    print(MODEL_PATH)

    print(f"\nPreprocessor:")
    print(PREPROCESSOR_PATH)

    print("\nNext step:")
    print("Evaluate the model on data/processed/test.csv")