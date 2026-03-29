"""
News Service v2.0
Fetches the latest financial news using Yahoo Finance RSS feeds.
Enriches each article with AI sentiment analysis (Bullish/Bearish/Neutral).
Requires no API keys.
"""

import time
import requests
import xml.etree.ElementTree as ET

# Simple in-memory cache to avoid spamming Yahoo
_NEWS_CACHE = {}
CACHE_TTL = 300  # 5 minutes

# Sentiment keyword lists
_POSITIVE_WORDS = [
    'surge', 'jump', 'gain', 'profit', 'soar', 'buy', 'upgrade', 'bull',
    'growth', 'rally', 'record', 'boom', 'approve', 'launch', 'high',
    'strong', 'positive', 'up', 'success', 'recovery', 'adopt'
]

_NEGATIVE_WORDS = [
    'drop', 'fall', 'loss', 'crash', 'sell', 'downgrade', 'bear', 'plunge',
    'lawsuit', 'warning', 'hack', 'ban', 'reject', 'fear', 'low',
    'weak', 'negative', 'down', 'fail', 'slump', 'risk'
]


def _analyze_sentiment(title: str) -> dict:
    """Analyze a headline for sentiment."""
    lower = title.lower()

    pos_count = sum(1 for w in _POSITIVE_WORDS if w in lower)
    neg_count = sum(1 for w in _NEGATIVE_WORDS if w in lower)

    if pos_count > neg_count:
        sentiment = "Bullish"
        explanation = "Positive catalysts or strong momentum suggests upward price movement."
    elif neg_count > pos_count:
        sentiment = "Bearish"
        explanation = "Negative market catalysts could lead to near-term downward pressure."
    else:
        sentiment = "Neutral"
        explanation = "Market sentiment remains balanced with no clear directional bias."

    return {"sentiment": sentiment, "explanation": explanation}


def get_news_for_symbol(symbol: str) -> list[dict]:
    """Fetch the latest news headlines for a specific symbol (raw, no sentiment)."""
    now = time.time()
    cache_key = f"raw_{symbol}"
    if cache_key in _NEWS_CACHE:
        cached_data, timestamp = _NEWS_CACHE[cache_key]
        if now - timestamp < CACHE_TTL:
            return cached_data

    url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}&region=US&lang=en-US"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()

        root = ET.fromstring(response.content)
        items = root.findall(".//item")

        news_data = []
        for item in items[:5]:
            title = item.find("title")
            link = item.find("link")
            pub_date = item.find("pubDate")

            if title is not None:
                news_data.append({
                    "title": title.text,
                    "link": link.text if link is not None else "",
                    "date": pub_date.text if pub_date is not None else "",
                    "symbol": symbol
                })

        _NEWS_CACHE[cache_key] = (news_data, now)
        return news_data

    except Exception as e:
        print(f"[News] Failed to fetch for {symbol}: {e}")
        return []


def get_enriched_news_for_symbol(symbol: str) -> list[dict]:
    """Fetch news for a symbol and enrich with sentiment analysis."""
    raw_news = get_news_for_symbol(symbol)
    enriched = []
    for item in raw_news:
        analysis = _analyze_sentiment(item.get("title", ""))
        enriched.append({
            **item,
            "sentiment": analysis["sentiment"],
            "explanation": analysis["explanation"],
            "category": "Crypto" if symbol in ["BTC", "ETH", "SOL", "XRP"] else "Stocks",
            "source": "Yahoo Finance",
        })
    return enriched


def get_general_market_news() -> list[dict]:
    """Fetch and enrich general market news from multiple symbols."""
    now = time.time()
    cache_key = "enriched_general"
    if cache_key in _NEWS_CACHE:
        cached_data, timestamp = _NEWS_CACHE[cache_key]
        if now - timestamp < CACHE_TTL:
            return cached_data

    all_news = []

    # Fetch from multiple symbols for variety
    symbols = ["SPY", "BTC-USD", "AAPL", "TSLA", "ETH-USD"]
    for sym in symbols:
        raw = get_news_for_symbol(sym)
        # Determine category
        category = "Stocks"
        display_sym = sym.replace("-USD", "")
        if display_sym in ["BTC", "ETH", "SOL", "XRP"]:
            category = "Crypto"

        for item in raw:
            analysis = _analyze_sentiment(item.get("title", ""))
            all_news.append({
                **item,
                "sentiment": analysis["sentiment"],
                "explanation": analysis["explanation"],
                "category": category,
                "source": "Yahoo Finance",
            })

    # Deduplicate by title
    seen_titles = set()
    unique_news = []
    for item in all_news:
        if item["title"] not in seen_titles:
            seen_titles.add(item["title"])
            unique_news.append(item)

    # Sort newest first (best effort, Yahoo provides pubDate)
    unique_news.sort(key=lambda x: x.get("date", ""), reverse=True)

    result = unique_news[:20]
    _NEWS_CACHE[cache_key] = (result, now)
    return result
