def get_risk_level(
    fraud_probability: float,
    amount: float = 0,
    distance_km: float = 0,
    is_new_recipient: str = "no",
    email_domain: str = "",
) -> str:
    """
    Determine transaction risk using the ML fraud probability
    and transparent transaction-level risk signals.

    The ML probability remains the primary signal.
    """

    # Primary ML-based risk
    if fraud_probability >= 0.85:
        return "HIGH"

    # Additional transaction risk signals
    risk_points = 0

    # Very high transaction amount
    if amount >= 50000:
        risk_points += 1

    # Very large transaction distance
    if distance_km >= 500:
        risk_points += 1

    # New recipient
    if str(is_new_recipient).lower() == "yes":
        risk_points += 1

    # Suspicious/disposable-style email domains
    suspicious_domains = {
        "tempmail.com",
        "10minutemail.com",
        "mailinator.com",
        "guerrillamail.com",
    }

    if email_domain.lower().strip() in suspicious_domains:
        risk_points += 1

    # Combine ML score with transaction signals
    if fraud_probability >= 0.70 and risk_points >= 1:
        return "HIGH"

    if fraud_probability >= 0.50 and risk_points >= 2:
        return "HIGH"

    if fraud_probability >= 0.30 or risk_points >= 1:
        return "MEDIUM"

    return "LOW"