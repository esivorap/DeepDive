from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_KEY")

# ── Model ──────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",  # fast and cheap, swap to gemini-2.5-pro for more power
    temperature=0.2,
)

# ── Tools ──────────────────────────────────────────────────────────────────
def get_current_time() -> str:
    """Returns the current UTC date and time."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def add_numbers(a: float, b: float) -> float:
    """Adds two numbers and returns the result."""
    return a + b

tools = [get_current_time, add_numbers]

# ── Agent ──────────────────────────────────────────────────────────────────
agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="You are a helpful assistant. Use tools when appropriate.",
)

result = agent.invoke({"messages": [{"role": "user", "content": "testing, what time is it?"}]})

print(f"\nAgent: {result['messages'][-1].content}")