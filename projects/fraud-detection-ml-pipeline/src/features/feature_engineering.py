import pandas as pd

def create_features(df):
    df['amount_log'] = df['amount'].apply(lambda x: 0 if x <= 0 else x)
    df['txn_per_user'] = df.groupby('user_id')['transaction_id'].transform('count')
    return df
