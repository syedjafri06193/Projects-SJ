import requests
import pandas as pd

API_URL = "https://api.mocktransactions.com/data"

def fetch_data():
    # Simulated API response
    data = {
        "transaction_id": [1, 2, 3],
        "amount": [100, 2500, 300],
        "user_id": [101, 102, 101],
        "timestamp": ["2024-01-01", "2024-01-01", "2024-01-02"],
        "is_fraud": [0, 1, 0]
    }
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = fetch_data()
    df.to_csv("data/raw/transactions.csv", index=False)
