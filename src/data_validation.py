from typing import Any, Dict


def validate_transaction(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate incoming transaction data before ML inference.

    Returns:
        {
            "valid": bool,
            "errors": list[str]
        }
    """

    errors = []

    # Required field validation
    required_fields = [
        "amount",
        "category",
        "paymentMethod",
        "deviceType",
        "emailDomain",
        "distanceKm",
        "merchant",
        "isNewRecipient",
    ]

    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    # Stop further validation if required fields are missing
    if errors:
        return {
            "valid": False,
            "errors": errors,
        }

    # Amount validation
    try:
        amount = float(data["amount"])

        if amount <= 0:
            errors.append("Amount must be greater than 0.")

    except (TypeError, ValueError):
        errors.append("Amount must be a valid number.")

    # Distance validation
    try:
        distance = float(data["distanceKm"])

        if distance < 0:
            errors.append("Distance cannot be negative.")

    except (TypeError, ValueError):
        errors.append("Distance must be a valid number.")

    # String validation
    string_fields = [
        "category",
        "paymentMethod",
        "deviceType",
        "emailDomain",
        "merchant",
        "isNewRecipient",
    ]

    for field in string_fields:
        value = data.get(field)

        if not isinstance(value, str) or not value.strip():
            errors.append(f"{field} must be a non-empty string.")

    # New recipient validation
    if data.get("isNewRecipient") not in ["yes", "no"]:
        errors.append("isNewRecipient must be either 'yes' or 'no'.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }