from fastapi import APIRouter
from services import ai_engine

router = APIRouter()


@router.get("/ai-signals")
def get_all_signals():
    """Return AI signals for all tracked assets."""
    return {
        "signals": ai_engine.generate_all_signals(),
    }


@router.get("/ai-signal/{symbol}")
def get_signal(symbol: str):
    """Return AI signal for a specific asset."""
    return ai_engine.generate_signal(symbol)
