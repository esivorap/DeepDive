from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

engine = create_engine(DB_URL)

def get_data():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM employees LIMIT 100"))
        rows = result.fetchall()
        return [dict(row._mapping) for row in rows]