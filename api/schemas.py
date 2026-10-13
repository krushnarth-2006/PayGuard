from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class Transaction(BaseModel):
    model_config = ConfigDict(extra="allow")


class PredictionResponse(BaseModel):
    fraud_probability: float
    prediction: str
    risk_level: str


# ---------------------------------------------------------
# Customer payment transaction
# Used by the frontend payment-check flow.
# ---------------------------------------------------------

class PaymentTransactionRequest(BaseModel):
    amount: float = Field(gt=0)
    category: str
    paymentMethod: str
    deviceType: str
    emailDomain: str
    distanceKm: float = Field(default=0, ge=0)
    merchant: str
    isNewRecipient: str


class PaymentTransactionResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    prediction: str
    risk_level: str
    decision: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class VerifyEmailRequest(BaseModel):
    email: str
    otp: str


class LoginRequest(BaseModel):
    email: str
    password: str


class OTPRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class AuthResponse(BaseModel):
    message: str
    email: str | None = None
    role: str | None = None
    token: str | None = None