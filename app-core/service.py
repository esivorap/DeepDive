from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_data
from agent_client import get_ai_insight

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
def fetch_data():
    return get_data()

@app.get("/insights")
async def fetch_insights():
    data = get_data()
    insight = await get_ai_insight(data)
    return {"insight": insight}