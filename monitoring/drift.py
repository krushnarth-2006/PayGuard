import pandas as pd


def detect_drift(reference_data, current_data, threshold=0.20):
    """
    Simple drift detection based on mean change.

    reference_data: historical/reference transaction data
    current_data: recent transaction data
    threshold: percentage change considered as drift
    """

    drifted_features = []

    common_columns = reference_data.select_dtypes(
        include=["number"]
    ).columns.intersection(
        current_data.select_dtypes(include=["number"]).columns
    )

    for column in common_columns:

        reference_mean = reference_data[column].mean()
        current_mean = current_data[column].mean()

        if reference_mean == 0:
            continue

        change = abs(current_mean - reference_mean) / abs(reference_mean)

        if change > threshold:
            drifted_features.append(column)

    return {
        "drift_detected": len(drifted_features) > 0,
        "drifted_features": list(drifted_features)
    }


if __name__ == "__main__":

    # Example reference data
    reference_data = pd.DataFrame({
        "amount": [100, 120, 150, 130, 110],
        "transaction_count": [1, 1, 2, 1, 1]
    })

    # Example current data with changed behavior
    current_data = pd.DataFrame({
        "amount": [500, 600, 550, 700, 650],
        "transaction_count": [2, 3, 2, 3, 2]
    })

    result = detect_drift(reference_data, current_data)

    print("PayGuard Drift Detection")
    print("------------------------")
    print(f"Drift detected: {result['drift_detected']}")
    print(f"Drifted features: {result['drifted_features']}")