from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("model.pkl")

@app.get("/")
def home():
    return {"message": "Fraud Detection API"}

@app.post("/predict")
def predict(amount: float, txn_per_user: int):
    features = np.array([[amount, txn_per_user]])
    prediction = model.predict(features)[0]
    return {"fraud": int(prediction)}
