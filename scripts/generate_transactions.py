import json
import random
import time
from pathlib import Path

import requests


BASE_DIR = Path(__file__).resolve().parent.parent

SAMPLE_FILE = BASE_DIR / "models" / "sample_api_request.json"
API_URL = "http://127.0.0.1:8000/predict"

NUMBER_OF_TRANSACTIONS = 500

random.seed(42)


def main():
    with open(SAMPLE_FILE, "r", encoding="utf-8") as file:
        base_transaction = json.load(file)

    successful = 0
    failed = 0

    print("\nPayGuard Transaction Generator")
    print("------------------------------")
    print(f"Generating {NUMBER_OF_TRANSACTIONS} transactions...\n")

    for i in range(NUMBER_OF_TRANSACTIONS):

        transaction = base_transaction.copy()

        # Vary numerical transaction features
        transaction["TransactionAmt"] = round(
            random.uniform(20, 5000), 2
        )

        transaction["dist1"] = float(
            random.randint(1, 100)
        )

        transaction["C1"] = float(
            random.randint(0, 10)
        )

        transaction["C2"] = float(
            random.randint(0, 10)
        )

        transaction["C11"] = float(
            random.randint(0, 10)
        )

        transaction["C13"] = float(
            random.randint(0, 10)
        )

        transaction["D1"] = float(
            random.randint(1, 30)
        )

        try:
            response = requests.post(
                API_URL,
                json=transaction,
                timeout=10
            )

            if response.status_code == 200:
                result = response.json()
                successful += 1

                print(
                    f"{i + 1:03d} | "
                    f"Amount: ₹{transaction['TransactionAmt']:8.2f} | "
                    f"Probability: {result['fraud_probability']:.4f} | "
                    f"{result['prediction']:10s} | "
                    f"{result['risk_level']}"
                )

            else:
                failed += 1
                print(
                    f"{i + 1:03d} | FAILED | "
                    f"HTTP {response.status_code}"
                )

        except Exception as error:
            failed += 1
            print(
                f"{i + 1:03d} | ERROR | {error}"
            )

        time.sleep(0.05)

    print("\n------------------------------")
    print("Generation complete")
    print(f"Successful: {successful}")
    print(f"Failed:     {failed}")


if __name__ == "__main__":
    main()