from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

from src.ingestion.ingest import fetch_data
from src.validation.validate import validate
from src.features.feature_engineering import create_features

def pipeline():
    df = fetch_data()
    validate(df)
    df = create_features(df)
    df.to_csv("data/processed/data.csv", index=False)

with DAG("fraud_pipeline",
         start_date=datetime(2024, 1, 1),
         schedule_interval="@daily",
         catchup=False) as dag:

    task = PythonOperator(
        task_id="run_pipeline",
        python_callable=pipeline
    )
