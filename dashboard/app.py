import streamlit as st
import pandas as pd
import os

# Page configuration
st.set_page_config(
    page_title="PayGuard Dashboard",
    page_icon="🛡️",
    layout="wide"
)

st.title("🛡️ PayGuard Monitoring Dashboard")
st.write("Real-Time Digital Payment Fraud Detection")

# Path to prediction log
PREDICTIONS_FILE = "monitoring/predictions.csv"

# Check whether prediction data exists
if not os.path.exists(PREDICTIONS_FILE):
    st.warning("No prediction data available yet.")
    st.stop()

# Load prediction data
df = pd.read_csv(PREDICTIONS_FILE)

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# -----------------------------
# Calculate metrics
# -----------------------------

total_transactions = len(df)

fraud_predictions = (df["prediction"] == "FRAUD").sum()

legitimate_predictions = (df["prediction"] == "LEGITIMATE").sum()

fraud_rate = (
    fraud_predictions / total_transactions * 100
    if total_transactions > 0
    else 0
)

average_latency = df["latency"].mean() * 1000

p95_latency = df["latency"].quantile(0.95) * 1000

# -----------------------------
# Dashboard metrics
# -----------------------------

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

# -----------------------------
# Performance metrics
# -----------------------------

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

# -----------------------------
# Prediction distribution
# -----------------------------

st.subheader("🔍 Prediction Distribution")

prediction_counts = df["prediction"].value_counts()

st.bar_chart(prediction_counts)

# -----------------------------
# Fraud probability
# -----------------------------

st.subheader("📈 Fraud Probability")

st.line_chart(
    df.set_index("timestamp")["fraud_probability"]
)

# -----------------------------
# Recent predictions
# -----------------------------

st.subheader("🧾 Recent Predictions")

st.dataframe(
    df.tail(10),
    use_container_width=True
)