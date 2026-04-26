from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import get_avail
from agent_client import get_ai_insight
from processor import process_ai_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobRequest(BaseModel):
    job_description: str

@app.get("/data")
def fetch_data():
    return get_avail()

@app.post("/insights")
async def fetch_insights(job: JobRequest):
    # 1. Get all active employees from DB
    employees = get_avail()

    # 2. Build a stripped down list for the AI (IDs + qualifications only)
    ai_input = [
        {
            "employeeID": emp["employeeID"],
            "capability": emp["capability"],
            "limitations": emp["limitations"],
            "unavailable": emp["unavailable"],
        }
        for emp in employees
    ]

    # 3. Send job description + employee data to agent-service
    ai_response = await get_ai_insight(ai_input, job.job_description)

    # 4. Process AI response into frontend-ready format
    result = process_ai_response(ai_response)

    return result