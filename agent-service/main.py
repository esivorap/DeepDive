from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agent import run_agent, formatter

app = FastAPI()

class QueryRequest(BaseModel):
    message: str

@app.post("/analyze")
def analyze(request: QueryRequest):
    try:
        raw=run_agent(request.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if isinstance(raw, list):
        raw_text = next(
            (block["text"] for block in raw
            if isinstance(block, dict) and block.get("type") == "text"),
            ""
            )
    else:
        raw_text = raw

    try:
        formatted = formatter(raw_text)
        print(f"\nFormatted Response: {formatted}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return formatted
