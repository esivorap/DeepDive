from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
import json

load_dotenv()

DB_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

engine = create_engine(DB_URL)

def get_avail():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                e.employeeID,
                q.capability,
                q.limitations,
                q.unavailable
            FROM employees e
            JOIN qualifications q ON e.employeeID = q.employeeID
            WHERE e.status = 'ACTIVE'
        """))
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]
    
def get_employee_by_id(employee_id: int):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT 
                e.employeeID, e.companyID, e.name, e.status,
                q.capability, q.limitations, q.unavailable
            FROM employees e
            LEFT JOIN qualifications q ON e.employeeID = q.employeeID
            WHERE e.employeeID = :id
        """), {"id": employee_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None
    
def create_employee(data: dict):
    with engine.begin() as conn:
        # Insert into employees
        result = conn.execute(text("""
            INSERT INTO employees (companyID, name, status)
            VALUES (:companyID, :name, :status)
        """), {
            "companyID": data["companyID"],
            "name": data["name"],
            "status": data["status"],
        })
        new_id = result.lastrowid

        # Insert into qualifications
        conn.execute(text("""
            INSERT INTO qualifications (employeeID, capability, limitations, unavailable)
            VALUES (:id, :capability, :limitations, :unavailable)
        """), {
            "id": new_id,
            "capability": json.dumps(data["capability"]),
            "limitations": json.dumps(data["limitations"]),
            "unavailable": json.dumps(data["unavailable"]),
        })

        return new_id

def update_employee(employee_id: int, data: dict):
    with engine.begin() as conn:
        # Update employees table if any basic fields provided
        basic_fields = {k: v for k, v in data.items()
                       if k in ("companyID", "name", "status") and v is not None}
        if basic_fields:
            sets = ", ".join(f"{k} = :{k}" for k in basic_fields)
            basic_fields["id"] = employee_id
            conn.execute(text(f"UPDATE employees SET {sets} WHERE employeeID = :id"),
                        basic_fields)

        # Update qualifications table if any qual fields provided
        qual_fields = {k: v for k, v in data.items()
                      if k in ("capability", "limitations", "unavailable") and v is not None}
        if qual_fields:
            sets = ", ".join(f"{k} = :{k}" for k in qual_fields)
            qual_data = {k: json.dumps(v) for k, v in qual_fields.items()}
            qual_data["id"] = employee_id
            conn.execute(text(f"UPDATE qualifications SET {sets} WHERE employeeID = :id"),
                        qual_data)

def delete_employee(employee_id: int):
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM qualifications WHERE employeeID = :id"),
                    {"id": employee_id})
        conn.execute(text("DELETE FROM employees WHERE employeeID = :id"),
                    {"id": employee_id})