from fastapi import FastAPI
from pydantic import BaseModel
from agent import run_agent

app = FastAPI()

class AnalyzeRequest(BaseModel):
    message: str

@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    result = run_agent(request.message)
    return {"insight": result}