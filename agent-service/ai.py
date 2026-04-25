import vertexai
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv
import os

load_dotenv()

vertexai.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_REGION")
)

model = GenerativeModel("google/gemma-3-27b-it")

def get_ai_insight(data):
    prompt = f"Analyze this data and give clear insights:\n{data}"
    response = model.generate_content(prompt)
    return response.text