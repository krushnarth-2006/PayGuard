from fastapi import FastAPI
from api.schemas import Transaction, PredictionResponse
from src.risk_engine import get_risk_level

from datetime import datetime
from pathlib import Path
import csv
import time
import uuid


app = FastAPI(
    title="PayGuard API",
    description="Real-Time Digital Payment Fraud Detection API",
    version="1.0.0"
)


# Path to prediction log file
LOG_FILE = Path("monitoring/predictions.csv")


@app.get("/")
def root():
    return {
        "message": "PayGuard API is running"
    }


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

        # Create header if file does not exist
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


@app.post("/predict", response_model=PredictionResponse)
def predict(transaction: Transaction):

    # Start latency timer
    start_time = time.perf_counter()

    # Temporary dummy probability
    # This will later be replaced by Krushnarth's ML model.
    fraud_probability = 0.85

    # Temporary prediction threshold
    if fraud_probability >= 0.50:
        prediction = "FRAUD"
    else:
        prediction = "LEGITIMATE"

    # Get risk level from risk engine
    risk_level = get_risk_level(fraud_probability)

    # Generate unique transaction ID
    transaction_id = str(uuid.uuid4())

    # Calculate API processing latency
    latency = (time.perf_counter() - start_time) * 1000

    # Save prediction to CSV
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