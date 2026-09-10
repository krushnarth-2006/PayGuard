from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="PayGuard API",
    description="Real-Time Digital Payment Fraud Detection API",
    version="1.0.0"
)


# Transaction input format
class Transaction(BaseModel):
    amount: float
    transaction_type: str


# Home endpoint
@app.get("/")
def root():
    return {
        "message": "PayGuard API is running"
    }


# Fraud prediction endpoint
@app.post("/predict")
def predict(transaction: Transaction):

    # Temporary dummy probability
    # We will replace this with the real ML model later.
    fraud_probability = 0.85

    # Risk classification
    if fraud_probability >= 0.70:
        prediction = "FRAUD"
        risk_level = "HIGH"

    elif fraud_probability >= 0.30:
        prediction = "LEGITIMATE"
        risk_level = "MEDIUM"

    else:
        prediction = "LEGITIMATE"
        risk_level = "LOW"

    return {
        "fraud_probability": fraud_probability,
        "prediction": prediction,
        "risk_level": risk_level
    }