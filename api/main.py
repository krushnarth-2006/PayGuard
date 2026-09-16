from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.schemas import Transaction, PredictionResponse
from api.auth import init_auth_db, create_admin_if_needed
from api.auth_routes import router as auth_router
from src.risk_engine import get_risk_level

from datetime import datetime
from pathlib import Path
import csv
import time
import uuid
import json

import joblib
import pandas as pd


app = FastAPI(
    title="PayGuard API",
    description="Real-Time Digital Payment Fraud Detection API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_auth_db()
create_admin_if_needed()
app.include_router(auth_router)


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_FILE = BASE_DIR / "models" / "fraud_model.pkl"
PREPROCESSOR_FILE = BASE_DIR / "models" / "preprocessor.pkl"
FEATURES_FILE = BASE_DIR / "models" / "model_input_features.json"

LOG_FILE = BASE_DIR / "monitoring" / "predictions.csv"


# ---------------------------------------------------------
# Load ML model and preprocessing pipeline
# ---------------------------------------------------------

model = joblib.load(MODEL_FILE)
preprocessor = joblib.load(PREPROCESSOR_FILE)

with open(FEATURES_FILE, "r", encoding="utf-8") as file:
    MODEL_FEATURES = json.load(file)


# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "PayGuard API is running"
    }


# ---------------------------------------------------------
# Prediction logging
# ---------------------------------------------------------

def log_prediction(
    transaction_id: str,
    fraud_probability: float,
    prediction: str,
    risk_level: str,
    latency: float
):
    """
    Save every prediction made by the API
    into monitoring/predictions.csv.
    """

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    file_exists = LOG_FILE.exists()

    with open(LOG_FILE, "a", newline="", encoding="utf-8") as file:

        writer = csv.writer(file)

        if not file_exists:
            writer.writerow([
                "timestamp",
                "transaction_id",
                "fraud_probability",
                "prediction",
                "risk_level",
                "latency"
            ])

        writer.writerow([
            datetime.now().isoformat(),
            transaction_id,
            fraud_probability,
            prediction,
            risk_level,
            latency
        ])


# ---------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------

@app.post("/predict", response_model=PredictionResponse)
def predict(transaction: Transaction):

    start_time = time.perf_counter()

    try:

        # Convert incoming transaction to dictionary
        transaction_data = transaction.model_dump()

        # Check that all model features are present
        missing_features = [
            feature
            for feature in MODEL_FEATURES
            if feature not in transaction_data
        ]

        if missing_features:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Missing required model features",
                    "missing_features": missing_features
                }
            )

        # Keep only the features expected by the ML model
        input_data = {
            feature: transaction_data[feature]
            for feature in MODEL_FEATURES
        }

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Apply the same preprocessing used during training
        processed_data = preprocessor.transform(input_df)

        # Get fraud probability
        fraud_probability = float(
            model.predict_proba(processed_data)[0][1]
        )

        # Convert probability into prediction
        if fraud_probability >= 0.50:
            prediction = "FRAUD"
        else:
            prediction = "LEGITIMATE"

        # Determine risk level
        risk_level = get_risk_level(fraud_probability)

        # Generate transaction ID
        transaction_id = str(uuid.uuid4())

        # Calculate latency in milliseconds
        latency = (time.perf_counter() - start_time) * 1000

        # Log prediction
        log_prediction(
            transaction_id=transaction_id,
            fraud_probability=fraud_probability,
            prediction=prediction,
            risk_level=risk_level,
            latency=latency
        )

        return {
            "fraud_probability": fraud_probability,
            "prediction": prediction,
            "risk_level": risk_level
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )