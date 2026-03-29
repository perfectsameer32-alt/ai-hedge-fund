"""
Market Data Service
Fetches real-time stock prices via yfinance and crypto prices via Binance public API.
Includes an in-memory cache with 30-second TTL to avoid rate limits.
"""

import time
import yfinance as yf
import requests

# ── Config ──────────────────────────────────────────────────────
STOCK_SYMBOLS = ["AAPL", "TSLA", "GOOGL", "MSFT", "NVDA"]
CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "XRP"]
BINANCE_TICKER_URL = "https://api.binance.com/api/v3/ticker/24hr"
CACHE_TTL_SECONDS = 30

# ── In-memory cache ────────────────────────────────────────────
_cache = {}  # { symbol: { data: {...}, timestamp: float } }


def _is_cache_valid(symbol: str) -> bool:
    if symbol not in _cache:
        return False
    return (time.time() - _cache[symbol]["timestamp"]) < CACHE_TTL_SECONDS


def _set_cache(symbol: str, data: dict):
    _cache[symbol] = {"data": data, "timestamp": time.time()}


# ── Stock Data (yfinance) ──────────────────────────────────────
def _fetch_stock(symbol: str) -> dict:
    """Fetch a single stock's current data via yfinance."""
    if _is_cache_valid(symbol):
        return _cache[symbol]["data"]

    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info

        current_price = float(info.get("lastPrice", 0) or info.get("last_price", 0))
        prev_close = float(info.get("previousClose", 0) or info.get("previous_close", current_price))
        day_high = float(info.get("dayHigh", 0) or info.get("day_high", current_price))
        day_low = float(info.get("dayLow", 0) or info.get("day_low", current_price))
        volume = int(info.get("lastVolume", 0) or info.get("last_volume", 0))

        change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0.0

        result = {
            "symbol": symbol,
            "type": "stock",
            "price": round(current_price, 2),
            "change_24h": round(change_pct, 2),
            "high": round(day_high, 2),
            "low": round(day_low, 2),
            "volume": volume,
        }
        _set_cache(symbol, result)
        return result

    except Exception as e:
        print(f"[market.py] Error fetching stock {symbol}: {e}")
        # Return cached data if available, otherwise fallback
        if symbol in _cache:
            return _cache[symbol]["data"]
        return {
            "symbol": symbol, "type": "stock", "price": 0,
            "change_24h": 0, "high": 0, "low": 0, "volume": 0,
            "error": str(e)
        }


# ── Crypto Data (Binance) ─────────────────────────────────────
def _fetch_crypto(symbol: str) -> dict:
    """Fetch a single crypto's data via Binance public REST API."""
    binance_symbol = f"{symbol}USDT"

    if _is_cache_valid(symbol):
        return _cache[symbol]["data"]

    try:
        resp = requests.get(BINANCE_TICKER_URL, params={"symbol": binance_symbol}, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        result = {
            "symbol": symbol,
            "type": "crypto",
            "price": round(float(data["lastPrice"]), 2),
            "change_24h": round(float(data["priceChangePercent"]), 2),
            "high": round(float(data["highPrice"]), 2),
            "low": round(float(data["lowPrice"]), 2),
            "volume": round(float(data["volume"]), 2),
        }
        _set_cache(symbol, result)
        return result

    except Exception as e:
        print(f"[market.py] Error fetching crypto {symbol}: {e}")
        if symbol in _cache:
            return _cache[symbol]["data"]
        return {
            "symbol": symbol, "type": "crypto", "price": 0,
            "change_24h": 0, "high": 0, "low": 0, "volume": 0,
            "error": str(e)
        }


# ── Public API ─────────────────────────────────────────────────
def get_all_prices() -> list[dict]:
    """Return current prices for all tracked assets."""
    results = []
    for s in STOCK_SYMBOLS:
        results.append(_fetch_stock(s))
    for s in CRYPTO_SYMBOLS:
        results.append(_fetch_crypto(s))
    return results


def get_price(symbol: str) -> dict:
    """Return current price for a single asset."""
    symbol = symbol.upper()
    if symbol in CRYPTO_SYMBOLS:
        return _fetch_crypto(symbol)
    return _fetch_stock(symbol)


def get_price_history(symbol: str, period: str = "1mo") -> list[dict]:
    """Return historical price data for a symbol (stocks only via yfinance)."""
    symbol = symbol.upper()
    try:
        ticker = yf.Ticker(symbol if symbol in STOCK_SYMBOLS else f"{symbol}-USD")
        hist = ticker.history(period=period)

        if hist.empty:
            return []

        return [
            {
                "date": row.Index.strftime("%Y-%m-%d"),
                "open": round(float(row.Open), 2),
                "high": round(float(row.High), 2),
                "low": round(float(row.Low), 2),
                "close": round(float(row.Close), 2),
                "volume": int(row.Volume),
            }
            for row in hist.itertuples()
        ]
    except Exception as e:
        print(f"[market.py] Error fetching history for {symbol}: {e}")
        return []
