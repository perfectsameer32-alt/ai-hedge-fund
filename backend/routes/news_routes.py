from fastapi import APIRouter
from services import news

router = APIRouter()


@router.get("/news")
def get_market_news():
    """Return latest enriched market news with sentiment analysis."""
    return {"news": news.get_general_market_news()}


@router.get("/news/{symbol}")
def get_symbol_news(symbol: str):
    """Return latest enriched news for a specific symbol."""
    return {"news": news.get_enriched_news_for_symbol(symbol.upper())}
