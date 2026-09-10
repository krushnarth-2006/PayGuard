import pandas as pd
from pathlib import Path


LOG_FILE = Path("monitoring/predictions.csv")


def calculate_metrics():

    if not LOG_FILE.exists():
        return {
            "total_transactions": 0,
            "fraud_predictions": 0,
            "legitimate_predictions": 0,
            "fraud_prediction_rate": 0,
            "average_latency_ms": 0,
            "p95_latency_ms": 0
        }

    df = pd.read_csv(LOG_FILE)

    if df.empty:
        return {
            "total_transactions": 0,
            "fraud_predictions": 0,
            "legitimate_predictions": 0,
            "fraud_prediction_rate": 0,
            "average_latency_ms": 0,
            "p95_latency_ms": 0
        }

    total_transactions = len(df)

    fraud_predictions = (df["prediction"] == "FRAUD").sum()

    legitimate_predictions = (
        df["prediction"] == "LEGITIMATE"
    ).sum()

    fraud_prediction_rate = (
        fraud_predictions / total_transactions
    ) * 100

    average_latency = df["latency"].mean()

    p95_latency = df["latency"].quantile(0.95)

    return {
        "total_transactions": total_transactions,
        "fraud_predictions": int(fraud_predictions),
        "legitimate_predictions": int(legitimate_predictions),
        "fraud_prediction_rate": round(fraud_prediction_rate, 2),
        "average_latency_ms": round(average_latency, 2),
        "p95_latency_ms": round(p95_latency, 2)
    }


if __name__ == "__main__":

    metrics = calculate_metrics()

    print("\nPayGuard Monitoring Metrics")
    print("---------------------------")

    for key, value in metrics.items():
        print(f"{key}: {value}")