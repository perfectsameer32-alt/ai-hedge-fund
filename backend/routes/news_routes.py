from fastapi import APIRouter
from services import news

router = APIRouter()

@router.get("/news")
def get_market_news():
    """Return latest general market news."""
    return {"news": news.get_general_market_news()}

@router.get("/news/{symbol}")
def get_symbol_news(symbol: str):
    """Return latest news for a specific symbol."""
    return {"news": news.get_news_for_symbol(symbol)}
