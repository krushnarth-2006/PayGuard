from fastapi import FastAPI
from api.schemas import Transaction, PredictionResponse
from src.risk_engine import get_risk_level


app = FastAPI(
    title="PayGuard API",
    description="Real-Time Digital Payment Fraud Detection API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "PayGuard API is running"
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(transaction: Transaction):

    # Temporary dummy probability
    # This will later be replaced by Krushnarth's ML model.
    fraud_probability = 0.85

    # Get risk level from the risk engine
    risk_level = get_risk_level(fraud_probability)

    # Determine prediction
    if fraud_probability >= 0.50:
        prediction = "FRAUD"
    else:
        prediction = "LEGITIMATE"

    return {
        "fraud_probability": fraud_probability,
        "prediction": prediction,
        "risk_level": risk_level
    }