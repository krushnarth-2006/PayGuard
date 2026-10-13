from api.main import build_model_transaction, run_model_prediction
from api.schemas import PaymentTransactionRequest
from src.risk_engine import get_risk_level


tests = [
    ("T1", 100, "gmail.com", 0, "Mobile", "no"),
    ("T2", 1000, "gmail.com", 0, "Mobile", "no"),
    ("T3", 10000, "gmail.com", 0, "Mobile", "no"),
    ("T4", 50000, "outlook.com", 0, "Mobile", "no"),
    ("T5", 100000, "outlook.com", 0, "Mobile", "no"),
    ("T6", 50000, "tempmail.com", 0, "Mobile", "no"),
    ("T7", 100000, "tempmail.com", 0, "Mobile", "yes"),
    ("T8", 50000, "yahoo.com", 500, "Mobile", "yes"),
    ("T9", 100000, "yahoo.com", 500, "Desktop", "yes"),
    ("T10", 1000000, "outlook.com", 500, "Desktop", "yes"),
]


for name, amount, email, distance, device, new_recipient in tests:

    transaction = PaymentTransactionRequest(
        amount=amount,
        category="Shopping",
        paymentMethod="UPI",
        deviceType=device,
        emailDomain=email,
        distanceKm=distance,
        merchant="Amazon",
        isNewRecipient=new_recipient,
    )

    model_input = build_model_transaction(transaction)

    probability, prediction = run_model_prediction(model_input)

    risk_level = get_risk_level(
        fraud_probability=probability,
        amount=amount,
        distance_km=distance,
        is_new_recipient=new_recipient,
        email_domain=email,
    )

    print(
        f"{name}: "
        f"amount={amount}, "
        f"email={email}, "
        f"distance={distance}, "
        f"device={device}, "
        f"new_recipient={new_recipient} "
        f"-> ML={probability * 100:.2f}% "
        f"| Model={prediction} "
        f"| Risk={risk_level}"
    )