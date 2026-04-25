from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(os.getenv("DB_URL"))

def get_data():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM your_table LIMIT 100"))
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]
