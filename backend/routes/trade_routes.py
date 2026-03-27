from pydantic import BaseModel
from fastapi import APIRouter
from services import alpaca

router = APIRouter()


class TradeRequest(BaseModel):
    symbol: str
    side: str
    qty: float
    type: str = "market"


@router.post("/trade")
def execute_trade(req: TradeRequest):
    """
    Execute a trade on Alpaca Paper API.
    Used for both manual execution and AI auto-trading.
    """
    res = alpaca.submit_order(
        symbol=req.symbol,
        qty=req.qty,
        side=req.side,
        type=req.type
    )
    return {"trade": res}


@router.get("/trade/status")
def trade_api_status():
    """Check if trading is configured correctly."""
    configured = alpaca.is_configured()
    return {
        "status": "online",
        "keys_configured": configured,
        "environment": "paper" if configured else "mock"
    }
