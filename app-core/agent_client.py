import httpx
import os
from dotenv import load_dotenv

load_dotenv()

AGENT_URL = os.getenv("AGENT_SERVICE_URL")

async def get_ai_insight(employees: list, job_description: str) -> dict:
    message = (
        f"Job Description:\n{job_description}\n\n"
        f"Available Employees (ID, capabilities, limitations, unavailability):\n{employees}\n\n"
    )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AGENT_URL}/analyze",
            json={"message": message},
            timeout=120.0
        )
        return response.json()
