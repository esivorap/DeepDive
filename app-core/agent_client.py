import httpx
import os
from dotenv import load_dotenv

load_dotenv()

AGENT_URL = os.getenv("AGENT_SERVICE_URL")

async def get_ai_insight(data: list) -> str:
    message = f"Analyze this data and give clear insights:\n{data}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AGENT_URL}/analyze",
            json={"message": message},
            timeout=30.0
        )
        return response.json()["insight"]