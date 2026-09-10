from pydantic import BaseModel


class Transaction(BaseModel):
    amount: float
    transaction_type: str


class PredictionResponse(BaseModel):
    fraud_probability: float
    prediction: str
    risk_level: str