import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import market_routes, ai_routes, portfolio_routes, news_routes, trade_routes

app = FastAPI(
    title="AI Hedge Fund API",
    description="Real-time market data, AI trading signals, and portfolio simulation.",
    version="2.0.0",
)

# CORS — allow the Vite dev server and Netlify production to communicate
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-hedge-fund.netlify.app",  # Update with your actual Netlify URL
    "*",  # Allow all during development — tighten for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────
app.include_router(market_routes.router, prefix="/api", tags=["Market Data"])
app.include_router(ai_routes.router, prefix="/api", tags=["AI Signals"])
app.include_router(portfolio_routes.router, prefix="/api", tags=["Portfolio"])
app.include_router(news_routes.router, prefix="/api", tags=["News"])
app.include_router(trade_routes.router, prefix="/api", tags=["Trade Execution"])


@app.get("/")
def root():
    return {
        "message": "AI Hedge Fund API v2.0 — Live Market Data + AI Signals + News + Auto Trading",
        "docs": "/docs",
        "endpoints": ["/api/market", "/api/ai-signals", "/api/portfolio", "/api/news", "/api/trade"],
    }

