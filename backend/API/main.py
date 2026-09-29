from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from backend.TradingAgents_integration.bridge import run_agent_analysis

app = FastAPI(title="TradingIQ API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "TradingIQ Backend with TradingAgents is running successfully!"}

@app.get("/api/analyze")
def analyze(ticker: str, date: str):
    try:
        result = run_agent_analysis(ticker, date)
        return {"ticker": ticker, "date": date, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
