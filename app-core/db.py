from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

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
    
def get_employees_by_ids(employee_ids: list):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT employeeID, name
            FROM employees
            WHERE employeeID IN :ids
        """), {"ids": tuple(employee_ids)})
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]