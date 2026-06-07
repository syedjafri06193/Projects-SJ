import pandas as pd
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

def train():
    df = pd.read_csv("data/processed/data.csv")

    X = df.drop("is_fraud", axis=1)
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    with mlflow.start_run():
        model = RandomForestClassifier()
        model.fit(X_train, y_train)

        mlflow.log_param("model", "RandomForest")
        mlflow.sklearn.log_model(model, "model")

    return model

if __name__ == "__main__":
    train()
