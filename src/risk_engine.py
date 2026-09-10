def get_risk_level(fraud_probability: float) -> str:
    """
    Convert fraud probability into a risk level.
    """

    if fraud_probability >= 0.70:
        return "HIGH"

    elif fraud_probability >= 0.30:
        return "MEDIUM"

    else:
        return "LOW"