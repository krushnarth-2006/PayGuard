from fastapi.testclient import TestClient
from api.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "PayGuard API is running"


def test_predict_valid_transaction():
    response = client.post(
        "/predict",
        json={
            "amount": 5000.0,
            "transaction_type": "TRANSFER"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "fraud_probability" in data
    assert "prediction" in data
    assert "risk_level" in data

    assert 0 <= data["fraud_probability"] <= 1


def test_predict_missing_amount():
    response = client.post(
        "/predict",
        json={
            "transaction_type": "TRANSFER"
        }
    )

    assert response.status_code == 422


def test_predict_missing_transaction_type():
    response = client.post(
        "/predict",
        json={
            "amount": 5000.0
        }
    )

    assert response.status_code == 422