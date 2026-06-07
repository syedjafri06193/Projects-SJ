from fastapi import FastAPI
from pydantic import BaseModel
import os
from openai import OpenAI

app = FastAPI()

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

class JobRequest(BaseModel):
    job_description: str
    resume: str

@app.post("/generate")
def generate_answers(req: JobRequest):
    prompt = f"""
    You are a job assistant.

    Job Description:
    {req.job_description}

    Candidate Resume:
    {req.resume}

    Generate:
    1. Short "Why are you a good fit?"
    2. Skills summary
    3. 2–3 custom answers for typical application questions
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"result": response.choices[0].message.content}
