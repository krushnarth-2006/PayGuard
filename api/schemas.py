from typing import Any
from pydantic import BaseModel, ConfigDict


class Transaction(BaseModel):
    model_config = ConfigDict(extra="allow")


class PredictionResponse(BaseModel):
    fraud_probability: float
    prediction: str
    risk_level: str


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