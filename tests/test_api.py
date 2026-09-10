from pathlib import Path
import json

from fastapi.testclient import TestClient
from api.main import app


client = TestClient(app)

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_REQUEST_FILE = BASE_DIR / "models" / "sample_api_request.json"


def load_sample_request():
    with open(SAMPLE_REQUEST_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "PayGuard API is running"


def test_predict_valid_transaction():
    sample_request = load_sample_request()

    response = client.post(
        "/predict",
        json=sample_request
    )

    assert response.status_code == 200

    data = response.json()

    assert "fraud_probability" in data
    assert "prediction" in data
    assert "risk_level" in data

    assert 0 <= data["fraud_probability"] <= 1
    assert data["prediction"] in ["FRAUD", "LEGITIMATE"]
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]


def test_predict_missing_required_features():
    response = client.post(
        "/predict",
        json={
            "TransactionAmt": 68.5,
            "ProductCD": "W"
        }
    )

    assert response.status_code == 422


def test_predict_empty_transaction():
    response = client.post(
        "/predict",
        json={}
    )

    assert response.status_code == 422