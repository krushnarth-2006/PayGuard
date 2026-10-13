import os
import requests
import csv
import time
import uuid
import json
import joblib
import pandas as pd

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime
from pathlib import Path

from api.schemas import (
    Transaction,
    PredictionResponse,
    PaymentTransactionRequest,
    PaymentTransactionResponse,
)

from api.auth import init_auth_db, create_admin_if_needed
from api.auth_routes import router as auth_router

from src.risk_engine import get_risk_level
from src.data_validation import validate_transaction


# ---------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------

load_dotenv()


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="PayGuard API",
    description="Real-Time Digital Payment Fraud Detection API",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

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
SAMPLE_REQUEST_FILE = BASE_DIR / "models" / "sample_api_request.json"

LOG_FILE = BASE_DIR / "monitoring" / "predictions.csv"


# ---------------------------------------------------------
# Cashfree configuration
# ---------------------------------------------------------

CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID")
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY")

CASHFREE_API_URL = "https://sandbox.cashfree.com/pg/orders"
CASHFREE_API_VERSION = "2025-01-01"


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

    LOG_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    file_exists = LOG_FILE.exists()

    with open(
        LOG_FILE,
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

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
# Core ML prediction function
# ---------------------------------------------------------

def run_model_prediction(transaction_data: dict):
    """
    Run the existing PayGuard XGBoost model.

    The original 422-feature model contract
    is preserved.
    """

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

    input_data = {
        feature: transaction_data[feature]
        for feature in MODEL_FEATURES
    }

    input_df = pd.DataFrame([input_data])

    processed_data = preprocessor.transform(
        input_df
    )

    fraud_probability = float(
        model.predict_proba(processed_data)[0][1]
    )

    # Keep the original model-based risk calculation
    # for the generic /predict endpoint.
    risk_level = get_risk_level(
        fraud_probability
    )

    return fraud_probability, risk_level


# ---------------------------------------------------------
# Existing prediction endpoint
# ---------------------------------------------------------

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(transaction: Transaction):

    start_time = time.perf_counter()

    try:

        transaction_data = transaction.model_dump()

        fraud_probability, risk_level = (
            run_model_prediction(transaction_data)
        )

        # Preserve existing /predict behaviour
        if fraud_probability >= 0.50:
            prediction = "FRAUD"
        else:
            prediction = "LEGITIMATE"

        transaction_id = str(
            uuid.uuid4()
        )

        latency = (
            time.perf_counter()
            - start_time
        ) * 1000

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


# ---------------------------------------------------------
# Payment transaction adapter
# ---------------------------------------------------------

def build_model_transaction(
    payment: PaymentTransactionRequest
):
    """
    Convert customer-friendly payment form
    into the existing 422-feature PayGuard
    model structure.

    sample_api_request.json is used as the
    base template so that unsupported model
    features are not invented.
    """

    if not SAMPLE_REQUEST_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Model sample request template not found."
        )

    with open(
        SAMPLE_REQUEST_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        model_transaction = json.load(file)

    # -----------------------------------------------------
    # Defensible feature mappings
    # -----------------------------------------------------

    # Payment amount -> transaction amount
    if "TransactionAmt" in model_transaction:
        model_transaction["TransactionAmt"] = (
            payment.amount
        )

    # Customer email domain
    if "P_emaildomain" in model_transaction:
        model_transaction["P_emaildomain"] = (
            payment.emailDomain
        )

    # Transaction distance
    if "dist1" in model_transaction:
        model_transaction["dist1"] = (
            payment.distanceKm
        )

    # Device mapping
    if "DeviceType" in model_transaction:

        device = (
            payment.deviceType
            .lower()
            .strip()
        )

        if "mobile" in device:
            model_transaction["DeviceType"] = "mobile"

        elif "desktop" in device:
            model_transaction["DeviceType"] = "desktop"

        else:
            # Keep original template value
            # for unsupported values.
            pass

    # Current transaction time
    now = datetime.now()

    if "TransactionHour" in model_transaction:
        model_transaction["TransactionHour"] = (
            now.hour
        )

    if "TransactionDay" in model_transaction:
        model_transaction["TransactionDay"] = (
            now.day
        )

    return model_transaction


# ---------------------------------------------------------
# Customer payment fraud check
# ---------------------------------------------------------

@app.post(
    "/payment/check",
    response_model=PaymentTransactionResponse
)
def check_payment(
    payment: PaymentTransactionRequest
):

    start_time = time.perf_counter()

    try:

        # -------------------------------------------------
        # MLOps Data Validation
        # -------------------------------------------------

        validation_result = validate_transaction(
            payment.model_dump()
        )

        if not validation_result["valid"]:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Transaction data validation failed.",
                    "errors": validation_result["errors"]
                }
            )

        # -------------------------------------------------
        # Build model input
        # -------------------------------------------------

        model_transaction = build_model_transaction(
            payment
        )

        # -------------------------------------------------
        # Run existing XGBoost model
        # -------------------------------------------------

        fraud_probability, _ = run_model_prediction(
            model_transaction
        )

        # -------------------------------------------------
        # PayGuard Risk Engine
        #
        # The existing XGBoost model remains unchanged.
        # The risk engine combines the ML probability
        # with transaction-level risk signals.
        # -------------------------------------------------

        risk_level = get_risk_level(
            fraud_probability=fraud_probability,
            amount=payment.amount,
            distance_km=payment.distanceKm,
            is_new_recipient=payment.isNewRecipient,
            email_domain=payment.emailDomain,
        )

        # -------------------------------------------------
        # PayGuard fraud decision
        # -------------------------------------------------

        if risk_level == "HIGH":
            prediction = "FRAUD"
            decision = "BLOCK"

        else:
            prediction = "LEGITIMATE"
            decision = "ALLOW"

        # -------------------------------------------------
        # Generate transaction ID
        # -------------------------------------------------

        transaction_id = str(
            uuid.uuid4()
        )

        # -------------------------------------------------
        # Calculate API latency
        # -------------------------------------------------

        latency = (
            time.perf_counter()
            - start_time
        ) * 1000

        # -------------------------------------------------
        # Log prediction
        # -------------------------------------------------

        log_prediction(
            transaction_id=transaction_id,
            fraud_probability=fraud_probability,
            prediction=prediction,
            risk_level=risk_level,
            latency=latency
        )

        # -------------------------------------------------
        # Return PayGuard result
        # -------------------------------------------------

        return {
            "transaction_id": transaction_id,
            "fraud_probability": fraud_probability,
            "prediction": prediction,
            "risk_level": risk_level,
            "decision": decision
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Payment fraud check failed: {str(error)}"
        )


# ---------------------------------------------------------
# Cashfree: Create Sandbox Order
# ---------------------------------------------------------

@app.post("/payment/create-order")
def create_cashfree_order(
    payment: PaymentTransactionRequest
):
    """
    Create a Cashfree Sandbox payment order.

    IMPORTANT:
    Cashfree credentials remain on the backend.
    The frontend receives only the payment session ID.
    """

    try:

        # -------------------------------------------------
        # Validate Cashfree credentials
        # -------------------------------------------------

        if not CASHFREE_APP_ID:
            raise HTTPException(
                status_code=500,
                detail="CASHFREE_APP_ID is not configured."
            )

        if not CASHFREE_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="CASHFREE_SECRET_KEY is not configured."
            )

        # -------------------------------------------------
        # Validate amount
        # -------------------------------------------------

        if payment.amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Payment amount must be greater than zero."
            )

        # -------------------------------------------------
        # Generate PayGuard/Cashfree order ID
        # -------------------------------------------------

        order_id = (
            f"payguard_"
            f"{uuid.uuid4().hex[:20]}"
        )

        customer_id = (
            f"customer_"
            f"{uuid.uuid4().hex[:12]}"
        )

        # -------------------------------------------------
        # Cashfree order payload
        # -------------------------------------------------

        payload = {
            "order_id": order_id,
            "order_amount": float(payment.amount),
            "order_currency": "INR",

            "customer_details": {
                "customer_id": customer_id,
                "customer_phone": "9876543210"
            },

            "order_meta": {
                "return_url": (
                    "http://localhost:5173/"
                    "?cashfree_order_id={order_id}"
                )
            }
        }

        # -------------------------------------------------
        # Cashfree API headers
        # -------------------------------------------------

        headers = {
            "x-client-id": CASHFREE_APP_ID,
            "x-client-secret": CASHFREE_SECRET_KEY,
            "x-api-version": CASHFREE_API_VERSION,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # -------------------------------------------------
        # Create Cashfree Sandbox order
        # -------------------------------------------------

        response = requests.post(
            CASHFREE_API_URL,
            json=payload,
            headers=headers,
            timeout=30
        )

        # -------------------------------------------------
        # Handle Cashfree errors
        # -------------------------------------------------

        if not response.ok:

            try:
                cashfree_error = response.json()

            except Exception:
                cashfree_error = response.text

            raise HTTPException(
                status_code=response.status_code,
                detail={
                    "message": "Cashfree order creation failed.",
                    "cashfree_response": cashfree_error
                }
            )

        # -------------------------------------------------
        # Parse Cashfree response
        # -------------------------------------------------

        data = response.json()

        payment_session_id = data.get(
            "payment_session_id"
        )

        if not payment_session_id:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Cashfree order was created, "
                    "but payment_session_id was not returned."
                )
            )

        # -------------------------------------------------
        # Return only safe frontend information
        # -------------------------------------------------

        return {
            "success": True,
            "order_id": data.get(
                "order_id",
                order_id
            ),
            "cf_order_id": data.get(
                "cf_order_id"
            ),
            "payment_session_id": payment_session_id,
            "order_status": data.get(
                "order_status"
            )
        }

    except HTTPException:
        raise

    except requests.RequestException as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to Cashfree Sandbox: "
                f"{str(error)}"
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Cashfree integration failed: "
                f"{str(error)}"
            )
        )


# ---------------------------------------------------------
# Cashfree: Get Payment Status
# ---------------------------------------------------------

@app.get("/payment/status/{order_id}")
def get_cashfree_payment_status(order_id: str):
    """
    Fetch the payment status of a Cashfree Sandbox order.

    The Cashfree Secret Key remains on the backend.
    """

    try:

        # -------------------------------------------------
        # Validate Cashfree credentials
        # -------------------------------------------------

        if not CASHFREE_APP_ID:
            raise HTTPException(
                status_code=500,
                detail="CASHFREE_APP_ID is not configured."
            )

        if not CASHFREE_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="CASHFREE_SECRET_KEY is not configured."
            )

        # -------------------------------------------------
        # Cashfree API URL
        # -------------------------------------------------

        url = (
            f"https://sandbox.cashfree.com/pg/orders/"
            f"{order_id}/payments"
        )

        # -------------------------------------------------
        # Headers
        # -------------------------------------------------

        headers = {
            "x-client-id": CASHFREE_APP_ID,
            "x-client-secret": CASHFREE_SECRET_KEY,
            "x-api-version": CASHFREE_API_VERSION,
            "Accept": "application/json"
        }

        # -------------------------------------------------
        # Get payments for order
        # -------------------------------------------------

        response = requests.get(
            url,
            headers=headers,
            timeout=30
        )

        # -------------------------------------------------
        # Handle Cashfree API errors
        # -------------------------------------------------

        if not response.ok:

            try:
                cashfree_error = response.json()

            except Exception:
                cashfree_error = response.text

            raise HTTPException(
                status_code=response.status_code,
                detail={
                    "message": "Unable to fetch Cashfree payment status.",
                    "cashfree_response": cashfree_error
                }
            )

        payments = response.json()

        # -------------------------------------------------
        # Determine final payment status
        # -------------------------------------------------

        payment_status = "FAILURE"

        if isinstance(payments, list):

            if any(
                payment.get("payment_status") == "SUCCESS"
                for payment in payments
            ):
                payment_status = "SUCCESS"

            elif any(
                payment.get("payment_status") == "PENDING"
                for payment in payments
            ):
                payment_status = "PENDING"

        # -------------------------------------------------
        # Return safe payment information
        # -------------------------------------------------

        return {
            "success": True,
            "order_id": order_id,
            "payment_status": payment_status,
            "payments": payments
        }

    except HTTPException:
        raise

    except requests.RequestException as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to Cashfree Sandbox: "
                f"{str(error)}"
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Cashfree payment status check failed: "
                f"{str(error)}"
            )
        )