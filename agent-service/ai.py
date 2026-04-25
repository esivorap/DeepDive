from google import genai
from google.genai.types import HttpOptions
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    vertexai=True,
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_REGION")
)

def get_ai_insight(data):
    prompt = f"Analyze this data and give clear insights:\n{data}"
    response = client.models.generate_content(
        model="gemma-3-27b-it",
        contents=prompt
    )
    return response.text