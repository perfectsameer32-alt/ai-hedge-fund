from fastapi import APIRouter
from services import market

router = APIRouter()


@router.get("/market")
def get_all_market_data():
    """Return current prices for all tracked assets."""
    return {
        "assets": market.get_all_prices(),
        "cached_ttl_seconds": market.CACHE_TTL_SECONDS,
    }


@router.get("/market/{symbol}")
def get_single_asset(symbol: str):
    """Return current price + 30-day history for a single asset."""
    price_data = market.get_price(symbol)
    history = market.get_price_history(symbol)
    return {
        "current": price_data,
        "history": history,
    }
