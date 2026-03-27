"""
News Service
Fetches the latest financial news using the free Yahoo Finance RSS feeds.
Requires no API keys and provides real-time headlines.
"""

import time
import requests
import xml.etree.ElementTree as ET

# Simple in-memory cache to avoid spamming Yahoo
_NEWS_CACHE = {}
CACHE_TTL = 300  # 5 minutes


def get_news_for_symbol(symbol: str) -> list[dict]:
    """Fetch the latest news headlines for a specific symbol."""
    now = time.time()
    if symbol in _NEWS_CACHE:
        cached_data, timestamp = _NEWS_CACHE[symbol]
        if now - timestamp < CACHE_TTL:
            return cached_data

    url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}&region=US&lang=en-US"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        items = root.findall(".//item")
        
        news_data = []
        for item in items[:5]:  # Limit to top 5
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
        
        _NEWS_CACHE[symbol] = (news_data, now)
        return news_data
        
    except Exception as e:
        print(f"[News] Failed to fetch for {symbol}: {e}")
        return []


def get_general_market_news() -> list[dict]:
    """Fetch general market news (usually SPY or major indices work as a proxy on Yahoo)."""
    return get_news_for_symbol("SPY")
