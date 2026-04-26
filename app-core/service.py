from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from db import get_avail, get_employee_by_id, create_employee, update_employee, delete_employee
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

class EmployeeCreate(BaseModel):
    companyID: int
    name: str
    status: str  # ACTIVE, INACTIVE, PER_DIEM, HIDDEN
    capability: dict
    limitations: dict
    unavailable: dict

class EmployeeUpdate(BaseModel):
    companyID: Optional[int] = None
    name: Optional[str] = None
    status: Optional[str] = None
    capability: Optional[dict] = None
    limitations: Optional[dict] = None
    unavailable: Optional[dict] = None

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

# GET single employee
@app.get("/employees/{employee_id}")
def fetch_employee(employee_id: int):
    employee = get_employee_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

# CREATE employee
@app.post("/employees")
def add_employee(employee: EmployeeCreate):
    new_id = create_employee(employee.model_dump())
    return {"employeeID": new_id, "message": "Employee created successfully"}

# UPDATE employee
@app.patch("/employees/{employee_id}")
def edit_employee(employee_id: int, employee: EmployeeUpdate):
    update_employee(employee_id, employee.model_dump())
    return {"message": "Employee updated successfully"}

# DELETE employee
@app.delete("/employees/{employee_id}")
def remove_employee(employee_id: int):
    delete_employee(employee_id)
    return {"message": "Employee deleted successfully"}