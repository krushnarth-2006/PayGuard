import sys
from pathlib import Path

# ---------------------------------------------------------
# Add project root to Python path
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))


import streamlit as st
import pandas as pd

from monitoring.drift import detect_drift


# ---------------------------------------------------------
# Page configuration
# ---------------------------------------------------------

st.set_page_config(
    page_title="PayGuard Dashboard",
    page_icon="🛡️",
    layout="wide"
)


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

PREDICTIONS_FILE = (
    BASE_DIR / "monitoring" / "predictions.csv"
)


# ---------------------------------------------------------
# Dashboard header
# ---------------------------------------------------------

st.title("🛡️ PayGuard Monitoring Dashboard")

st.write(
    "Real-Time Digital Payment Fraud Detection"
)


# ---------------------------------------------------------
# Refresh button
# ---------------------------------------------------------

if st.button("🔄 Refresh Dashboard"):
    st.rerun()


# ---------------------------------------------------------
# Check prediction data
# ---------------------------------------------------------

if not PREDICTIONS_FILE.exists():

    st.warning(
        "No prediction data available yet."
    )

    st.stop()


# ---------------------------------------------------------
# Load prediction data
# ---------------------------------------------------------

df = pd.read_csv(PREDICTIONS_FILE)

if df.empty:

    st.warning(
        "Prediction log is empty."
    )

    st.stop()


# ---------------------------------------------------------
# Validate required columns
# ---------------------------------------------------------

required_columns = [
    "timestamp",
    "transaction_id",
    "fraud_probability",
    "prediction",
    "risk_level",
    "latency"
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:

    st.error(
        f"Missing columns in prediction log: "
        f"{', '.join(missing_columns)}"
    )

    st.stop()


# ---------------------------------------------------------
# Data preparation
# ---------------------------------------------------------

df["timestamp"] = pd.to_datetime(
    df["timestamp"]
)

df["fraud_probability"] = pd.to_numeric(
    df["fraud_probability"],
    errors="coerce"
)

df["latency"] = pd.to_numeric(
    df["latency"],
    errors="coerce"
)


# ---------------------------------------------------------
# Calculate transaction metrics
# ---------------------------------------------------------

total_transactions = len(df)

fraud_predictions = (
    df["prediction"] == "FRAUD"
).sum()

legitimate_predictions = (
    df["prediction"] == "LEGITIMATE"
).sum()

fraud_rate = (
    fraud_predictions / total_transactions * 100
    if total_transactions > 0
    else 0
)


# ---------------------------------------------------------
# Calculate API performance
# ---------------------------------------------------------
# latency is already stored in milliseconds
# by api/main.py

average_latency = df["latency"].mean()

p95_latency = df["latency"].quantile(0.95)


# ---------------------------------------------------------
# Transaction metrics
# ---------------------------------------------------------

st.subheader("📊 Transaction Metrics")

col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "Total Transactions",
    total_transactions
)

col2.metric(
    "Fraud Predictions",
    fraud_predictions
)

col3.metric(
    "Legitimate Predictions",
    legitimate_predictions
)

col4.metric(
    "Fraud Prediction Rate",
    f"{fraud_rate:.2f}%"
)


# ---------------------------------------------------------
# API performance
# ---------------------------------------------------------

st.subheader("⚡ API Performance")

col5, col6 = st.columns(2)

col5.metric(
    "Average Latency",
    f"{average_latency:.2f} ms"
)

col6.metric(
    "P95 Latency",
    f"{p95_latency:.2f} ms"
)


# ---------------------------------------------------------
# Prediction distribution
# ---------------------------------------------------------

st.subheader("🔍 Prediction Distribution")

prediction_counts = (
    df["prediction"].value_counts()
)

st.bar_chart(
    prediction_counts
)


# ---------------------------------------------------------
# Fraud probability
# ---------------------------------------------------------

st.subheader("📈 Fraud Probability")

probability_data = (
    df.sort_values("timestamp")
    .set_index("timestamp")[
        "fraud_probability"
    ]
)

st.line_chart(
    probability_data
)


# ---------------------------------------------------------
# Risk distribution
# ---------------------------------------------------------

st.subheader("🚦 Risk Level Distribution")

risk_counts = (
    df["risk_level"].value_counts()
)

st.bar_chart(
    risk_counts
)


# ---------------------------------------------------------
# Drift monitoring
# ---------------------------------------------------------

st.subheader("🔄 Drift Monitoring")


# ---------------------------------------------------------
# Reference transaction behavior
# ---------------------------------------------------------
# In the final version, this can be replaced by
# Krushnarth's original/reference dataset.

reference_data = pd.DataFrame({
    "amount": [
        100, 120, 150, 130, 110
    ],
    "transaction_count": [
        1, 1, 2, 1, 1
    ]
})


# ---------------------------------------------------------
# Simulated current transaction behavior
# ---------------------------------------------------------
# This intentionally represents changed transaction
# behavior to demonstrate drift detection.

current_data = pd.DataFrame({
    "amount": [
        500, 600, 550, 700, 650
    ],
    "transaction_count": [
        2, 3, 2, 3, 2
    ]
})


# ---------------------------------------------------------
# Run drift detection
# ---------------------------------------------------------

drift_result = detect_drift(
    reference_data,
    current_data,
    threshold=0.20
)


# ---------------------------------------------------------
# Calculate feature-level changes
# ---------------------------------------------------------

feature_changes = {}

common_columns = (
    reference_data
    .select_dtypes(include=["number"])
    .columns
    .intersection(
        current_data
        .select_dtypes(include=["number"])
        .columns
    )
)

for column in common_columns:

    reference_mean = reference_data[column].mean()
    current_mean = current_data[column].mean()

    if reference_mean == 0:
        continue

    change = (
        abs(current_mean - reference_mean)
        / abs(reference_mean)
    ) * 100

    feature_changes[column] = round(
        change,
        2
    )


# ---------------------------------------------------------
# Display drift status
# ---------------------------------------------------------

if drift_result["drift_detected"]:

    st.error(
        "⚠️ Drift Detected"
    )

    st.write(
        "The distribution of one or more "
        "numerical transaction features "
        "has changed significantly."
    )

    st.write(
        "**Drifted Features:**",
        ", ".join(
            drift_result["drifted_features"]
        )
    )

else:

    st.success(
        "✅ No Significant Drift Detected"
    )


# ---------------------------------------------------------
# Feature-level drift changes
# ---------------------------------------------------------

if feature_changes:

    st.write(
        "### 📊 Feature Changes (%)"
    )

    drift_df = pd.DataFrame(
        list(feature_changes.items()),
        columns=[
            "Feature",
            "Change (%)"
        ]
    )

    st.dataframe(
        drift_df,
        use_container_width=True,
        hide_index=True
    )

    st.bar_chart(
        drift_df.set_index("Feature")
    )


# ---------------------------------------------------------
# Drift explanation
# ---------------------------------------------------------

st.info(
    "Drift detection compares the reference transaction "
    "behavior with recent transaction behavior. A feature "
    "is considered drifted when its mean changes by more "
    "than the configured threshold."
)


# ---------------------------------------------------------
# Recent predictions
# ---------------------------------------------------------

st.subheader("🧾 Recent Predictions")

st.dataframe(
    df.tail(10),
    use_container_width=True,
    hide_index=True
)