from typing import Any
from pydantic import BaseModel, ConfigDict


class Transaction(BaseModel):
    model_config = ConfigDict(extra="allow")


class PredictionResponse(BaseModel):
    fraud_probability: float
    prediction: str
    risk_level: str