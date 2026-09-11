# 🛡️ PayGuard
## Real-Time Digital Payment Fraud Detection

PayGuard is an end-to-end machine learning system for detecting suspicious digital payment transactions in real time.

The project combines an imbalance-aware fraud detection model with a FastAPI inference service, risk-based decisions, prediction logging, monitoring, and drift detection through a Streamlit dashboard.

> **Project Pitch:**  
> PayGuard is a drift-aware real-time fraud detection pipeline that detects suspicious digital payments, assigns risk levels, and monitors changes in transaction behavior.

---

## 🚀 Key Features

- 🤖 Machine learning-based fraud detection
- ⚖️ Fraud probability scoring
- 🚨 Risk-based classification: LOW, MEDIUM, HIGH
- ⚡ Real-time FastAPI inference
- 🔄 Reusable preprocessing pipeline
- 📝 Automatic prediction logging
- 📊 Transaction and API performance monitoring
- 📈 Fraud probability visualization
- 🔍 Data drift detection
- 📊 Streamlit monitoring dashboard
- 🧪 Automated API and validation tests
- 🔢 Automated transaction generation for testing
- 🔗 Complete ML-to-API integration

---

## 🎯 Problem Statement

Digital payment systems process a large number of transactions every day, while fraudulent transactions represent a relatively small portion of the total traffic.

This creates several challenges:

- Fraud detection datasets are highly imbalanced.
- Accuracy alone may not adequately represent fraud detection performance.
- Fraud decisions must be produced with low latency.
- Transaction behavior can change over time.
- A deployed model can become less reliable when incoming data distribution changes.

Therefore, an effective fraud detection system needs more than a machine learning model. It needs an integrated prediction and monitoring pipeline.

---

## 💡 Project Objective

The objective of PayGuard is to build an end-to-end fraud detection pipeline that:

1. Accepts transaction information.
2. Validates the incoming request.
3. Applies the same preprocessing pipeline used during training.
4. Generates a fraud probability.
5. Converts the probability into a fraud/legitimate prediction.
6. Assigns a risk level.
7. Logs the prediction and API latency.
8. Monitors prediction behavior.
9. Detects changes in transaction behavior through drift analysis.
10. Displays system behavior through a monitoring dashboard.

---

## 🧠 System Architecture

```text
                 ┌─────────────────────┐
                 │  Transaction Input  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │      FastAPI        │
                 │  Request Validation │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Preprocessing    │
                 │  Saved Transformer  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    ML Fraud Model   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Fraud Probability  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     Risk Engine     │
                 │ LOW / MEDIUM / HIGH │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Prediction Logging  │
                 └──────────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
        ┌─────────────────┐   ┌─────────────────┐
        │   Monitoring    │   │ Drift Detection │
        └────────┬────────┘   └────────┬────────┘
                 │                     │
                 └──────────┬──────────┘
                            ▼
                 ┌─────────────────────┐
                 │ Streamlit Dashboard │
                 └─────────────────────┘
```

---

## 🔄 Prediction Workflow

For every transaction, PayGuard performs the following workflow:

### 1. Transaction Input

A transaction containing the model's required features is submitted to the API.

### 2. Validation

FastAPI validates the incoming request.

### 3. Preprocessing

The saved preprocessing pipeline transforms the transaction into the format expected by the trained model.

### 4. Fraud Prediction

The machine learning model generates a fraud probability between `0` and `1`.

### 5. Prediction Decision

```text
Probability >= 0.50
        ↓
      FRAUD

Probability < 0.50
        ↓
   LEGITIMATE
```

### 6. Risk Classification

```text
0.00 – 0.29  → LOW
0.30 – 0.69  → MEDIUM
0.70 – 1.00  → HIGH
```

### 7. Logging

Each successful prediction records:

- Timestamp
- Transaction ID
- Fraud probability
- Prediction
- Risk level
- API latency

---

## ⚙️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| Pandas | Data processing |
| Scikit-learn | Machine learning and preprocessing |
| Joblib | Model and preprocessing serialization |
| FastAPI | Real-time API |
| Pydantic | Request validation |
| Uvicorn | API server |
| Streamlit | Monitoring dashboard |
| Plotly | Dashboard visualizations |
| Pytest | Automated testing |
| Git & GitHub | Version control |

---

## 📁 Project Structure

```text
PayGuard/
│
├── api/
│   ├── main.py
│   └── schemas.py
│
├── dashboard/
│   └── app.py
│
├── models/
│   ├── fraud_model.pkl
│   ├── preprocessor.pkl
│   ├── model_input_features.json
│   └── sample_api_request.json
│
├── monitoring/
│   ├── metrics.py
│   ├── drift.py
│   └── predictions.csv
│
├── notebooks/
│
├── scripts/
│   └── generate_transactions.py
│
├── src/
│   ├── data_preprocessing.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── evaluate.py
│   ├── predict.py
│   └── risk_engine.py
│
├── tests/
│   └── test_api.py
│
├── requirements.txt
├── pytest.ini
├── .gitignore
└── README.md
```

---

## 🔌 API

### Start the FastAPI Server

From the project root:

```bash
uvicorn api.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

### API Documentation

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

## 🔮 Prediction Endpoint

### `POST /predict`

The `/predict` endpoint accepts a transaction and returns:

```json
{
  "fraud_probability": 0.7042,
  "prediction": "FRAUD",
  "risk_level": "HIGH"
}
```

### Response Fields

| Field | Description |
|---|---|
| `fraud_probability` | Model-estimated probability of fraud |
| `prediction` | `FRAUD` or `LEGITIMATE` |
| `risk_level` | `LOW`, `MEDIUM`, or `HIGH` |

---

## 📊 Monitoring Dashboard

PayGuard includes a Streamlit dashboard for monitoring the deployed prediction pipeline.

### Start the Dashboard

```bash
streamlit run dashboard/app.py
```

The dashboard provides the following monitoring capabilities.

### Transaction Metrics

- Total transactions
- Fraud predictions
- Legitimate predictions
- Fraud prediction rate

### API Performance

- Average latency
- P95 latency

### Prediction Monitoring

- Prediction distribution
- Fraud probability over time
- Risk-level distribution

### Drift Monitoring

- Drift detection status
- Drifted features
- Feature distribution changes

### Recent Predictions

The dashboard displays recently logged transactions including:

- Timestamp
- Transaction ID
- Fraud probability
- Prediction
- Risk level
- Latency

---

## 🔍 Drift Detection

A deployed fraud detection model can become less reliable when transaction behavior changes.

PayGuard includes a simple drift detection mechanism based on changes in numerical feature means.

The system compares:

```text
Reference Transaction Behavior
              ↓
        Drift Detection
              ↑
Recent Transaction Behavior
```

A feature is considered drifted when its relative mean change exceeds the configured threshold.

The current demonstration uses a threshold of:

```text
20%
```

The dashboard demonstrates this using reference and current transaction behavior and reports the features showing significant changes.

---

## 🧪 Testing

PayGuard includes automated API tests using Pytest.

Run:

```bash
pytest
```

The test suite validates:

- API root endpoint
- Valid transaction prediction
- Required model feature validation
- Empty transaction handling

Current integration test result:

```text
4 passed
```

Dependency deprecation warnings may appear during testing, but they do not represent test failures.

---

## 🔢 Transaction Generator

PayGuard includes an automated transaction generator for testing the complete prediction pipeline.

Run:

```bash
python scripts/generate_transactions.py
```

The generator:

1. Loads the official sample API transaction.
2. Creates randomized transaction variations.
3. Sends them to the FastAPI `/predict` endpoint.
4. Displays fraud probability and risk level.
5. Logs successful predictions through the API.

The generator was successfully tested with:

```text
500 transactions
Successful: 500
Failed: 0
```

This generates API traffic for demonstrating the monitoring dashboard.

> **Note:** The generated demonstration transactions currently produced predominantly fraud-oriented predictions. This is a test-data behavior and should not be interpreted as real-world fraud prevalence or model accuracy.

---

## 📈 Example Monitoring Results

During integration testing, the system successfully processed hundreds of API transactions.

Example observed metrics:

```text
Total Transactions:       602
Fraud Predictions:        602
Legitimate Predictions:     0
Fraud Prediction Rate:  100.00%

Average Latency:       52.58 ms
P95 Latency:           59.69 ms
```

These values represent the demonstration traffic generated during testing and are not intended to represent production fraud rates.

---

## 🧩 Core Components

### Machine Learning Pipeline

Responsible for:

- Data preprocessing
- Feature engineering
- Model training
- Model evaluation
- Model prediction
- Saving the trained model
- Saving the preprocessing pipeline
- Defining the model input feature contract

### FastAPI Service

Responsible for:

- Real-time inference
- Request validation
- Model loading
- Preprocessing
- Fraud probability generation
- Risk classification
- Error handling
- Prediction logging

### Risk Engine

The risk engine converts fraud probability into operational risk categories:

```text
LOW
MEDIUM
HIGH
```

This provides a more useful decision layer than a raw probability alone.

### Monitoring

The monitoring layer tracks:

- Prediction counts
- Fraud prediction rate
- API latency
- P95 latency
- Prediction probabilities
- Risk-level distribution

### Drift Detection

The drift module compares reference and recent transaction behavior to identify significant changes in numerical features.

### Dashboard

The Streamlit dashboard brings prediction, performance, and drift information together into one monitoring interface.

---

## 👥 Team Contributions

### Krushnarth — Machine Learning & Fraud Detection

- Dataset analysis and EDA
- Data preprocessing
- Feature engineering
- Handling class imbalance
- Model training and evaluation
- Model selection
- Probability-based prediction
- Saved ML model and preprocessing artifacts
- Model input feature definition
- Sample API request preparation

### Samarth — API, Monitoring & Integration

- FastAPI application
- Pydantic validation
- Real-time `/predict` endpoint
- Model integration
- Risk engine integration
- Prediction logging
- Monitoring metrics
- Drift detection
- Streamlit dashboard
- API testing
- Transaction generator
- End-to-end integration
- GitHub integration

---

## 💡 Innovation

The innovation of PayGuard is not simply using machine learning for fraud classification.

The stronger contribution is the integration of:

```text
Imbalance-aware ML
        +
Real-time API inference
        +
Risk-based decisions
        +
Prediction monitoring
        +
Drift detection
```

into a single end-to-end pipeline.

This allows the system to move beyond static model prediction toward monitoring the reliability of a deployed fraud detection system as transaction behavior changes.

> **Innovation Statement:**  
> PayGuard is a drift-aware real-time fraud detection pipeline that monitors whether its deployed predictions remain reliable as transaction behavior changes.

---

## 🔐 Important Design Considerations

PayGuard demonstrates a prototype production-style architecture.

For a real-world deployment, additional capabilities would be required, such as:

- Secure authentication and authorization
- Encrypted communication
- Production database/log storage
- Distributed logging
- Real-time streaming infrastructure
- Model explainability
- Human fraud-review workflows
- Automated retraining
- Production-grade drift monitoring
- Cloud deployment
- Scalability and fault tolerance

---

## 🔮 Future Scope

Potential future improvements include:

- Kafka or another real-time streaming platform
- Automated retraining after sustained drift
- Cloud deployment and autoscaling
- Human-in-the-loop fraud review
- Explainable AI
- Production feedback loops
- Graph-based fraud detection
- Anomaly detection models
- Advanced statistical drift detection
- Model performance monitoring using confirmed fraud labels

---

## 🏁 Project Status

```text
ML Pipeline              ✅ Complete
Model Integration        ✅ Complete
FastAPI Inference        ✅ Complete
Risk Engine              ✅ Complete
Prediction Logging       ✅ Complete
Monitoring               ✅ Complete
Drift Detection          ✅ Complete
Streamlit Dashboard      ✅ Complete
Transaction Generator    ✅ Complete
API Testing              ✅ Complete
GitHub Integration       ✅ Complete
```

### Final Status: **Complete Prototype / Academic Project**

---

## 📌 Conclusion

PayGuard demonstrates how a machine learning fraud detection model can be transformed into a complete real-time monitoring system.

Instead of stopping at model training, the project connects:

```text
Machine Learning
      ↓
Real-Time API
      ↓
Risk Decision
      ↓
Prediction Logging
      ↓
Monitoring
      ↓
Drift Detection
      ↓
Dashboard
```

This architecture demonstrates the practical transition from an ML model to a deployable, observable fraud detection pipeline.

---

## 📄 License

This project was developed for academic and educational purposes.