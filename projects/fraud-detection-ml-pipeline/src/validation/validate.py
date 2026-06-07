import pandas as pd

def validate(df):
    assert not df.isnull().sum().any(), "Missing values detected"
    assert "amount" in df.columns, "Missing column: amount"
    return True
