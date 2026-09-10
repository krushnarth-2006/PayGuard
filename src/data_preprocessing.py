import joblib
import pandas as pd


PREPROCESSOR_PATH = "models/preprocessor.pkl"
FEATURES_PATH = "models/model_input_features.json"


def load_preprocessor():
    """Load the trained preprocessing pipeline."""
    return joblib.load(PREPROCESSOR_PATH)


def load_model_input_features():
    """Load the exact feature list expected by the model."""
    with open(FEATURES_PATH, "r") as f:
        import json
        return json.load(f)


def prepare_input(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare raw transaction data for the trained model.

    The input is aligned to the exact feature list used during training.
    """
    features = load_model_input_features()

    df = df.reindex(columns=features)

    return df


def transform_input(df: pd.DataFrame):
    """
    Apply the saved preprocessing pipeline to input data.
    """
    preprocessor = load_preprocessor()

    df = prepare_input(df)

    return preprocessor.transform(df)