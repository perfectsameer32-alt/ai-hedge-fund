"""
AI Signal Engine v2.0
Generates BUY/SELL/HOLD signals using EMA crossover + RSI + Volatility + News Sentiment.
Returns explainable signals with risk level, reasons, simpleExplanation, and suggestedAction.
"""

import numpy as np
import yfinance as yf

from services.market import STOCK_SYMBOLS, CRYPTO_SYMBOLS
from services.news import get_news_for_symbol


def _compute_ema(prices: np.ndarray, span: int) -> np.ndarray:
    """Compute Exponential Moving Average."""
    multiplier = 2 / (span + 1)
    ema = np.zeros_like(prices, dtype=float)
    if len(prices) > 0:
        ema[0] = prices[0]
        for i in range(1, len(prices)):
            ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
    return ema


def _compute_rsi(prices: np.ndarray, period: int = 14) -> float:
    """Compute the most recent RSI value."""
    if len(prices) < period + 1:
        return 50.0

    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)

    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def _compute_volatility(prices: np.ndarray, period: int = 14) -> float:
    """Compute annualized volatility from recent returns."""
    if len(prices) < period + 1:
        return 0.0
    returns = np.diff(prices[-period:]) / prices[-period:-1]
    return round(float(np.std(returns) * np.sqrt(252) * 100), 2)


def _get_close_prices(symbol: str, period: str = "3mo") -> np.ndarray:
    """Fetch closing prices from yfinance."""
    try:
        yf_symbol = symbol if symbol in STOCK_SYMBOLS else f"{symbol}-USD"
        ticker = yf.Ticker(yf_symbol)
        hist = ticker.history(period=period)
        if hist.empty:
            return np.array([])
        return hist["Close"].values.astype(float)
    except Exception as e:
        print(f"[ai_engine.py] Error fetching prices for {symbol}: {e}")
        return np.array([])


def _analyze_news_sentiment(news_headlines: list) -> dict:
    """Analyze news headlines for sentiment."""
    if not news_headlines:
        return {"sentiment": "neutral", "score": 0, "top_headline": None}

    positive_words = ['surge', 'jump', 'gain', 'profit', 'soar', 'buy', 'upgrade',
                      'bull', 'growth', 'rally', 'record', 'boom', 'approve', 'launch']
    negative_words = ['drop', 'fall', 'loss', 'crash', 'sell', 'downgrade', 'bear',
                      'plunge', 'lawsuit', 'warning', 'hack', 'ban', 'reject', 'fear']

    score = 0
    for h in news_headlines[:5]:
        text = h.get("title", "").lower()
        if any(w in text for w in positive_words):
            score += 1
        if any(w in text for w in negative_words):
            score -= 1

    sentiment = "neutral"
    if score > 0:
        sentiment = "positive"
    elif score < 0:
        sentiment = "negative"

    return {
        "sentiment": sentiment,
        "score": score,
        "top_headline": news_headlines[0].get("title") if news_headlines else None
    }


def generate_signal(symbol: str) -> dict:
    """
    Generate a BUY/SELL/HOLD signal with full explainability.
    Returns: signal, confidence, risk, reasons[], simpleExplanation, suggestedAction
    """
    symbol = symbol.upper()
    prices = _get_close_prices(symbol)
    news_headlines = get_news_for_symbol(symbol)
    news_analysis = _analyze_news_sentiment(news_headlines)

    if len(prices) < 30:
        return {
            "symbol": symbol,
            "signal": "HOLD",
            "confidence": 50,
            "risk": "Medium",
            "reasons": ["Insufficient historical data for a complete AI analysis."],
            "simpleExplanation": "We don't have enough price history yet. Best to wait.",
            "suggestedAction": "Monitor position and wait for more data.",
            "rsi": None,
            "ema_fast": None,
            "ema_slow": None,
            "current_price": float(prices[-1]) if len(prices) > 0 else 0,
            "volatility": 0,
        }

    # ── Compute Technical Indicators ─────────────────────────
    ema_fast = _compute_ema(prices, span=12)
    ema_slow = _compute_ema(prices, span=26)
    rsi = _compute_rsi(prices)
    volatility = _compute_volatility(prices)

    latest_fast = round(float(ema_fast[-1]), 2)
    latest_slow = round(float(ema_slow[-1]), 2)
    current_price = round(float(prices[-1]), 2)
    ema_diff_pct = ((latest_fast - latest_slow) / latest_slow) * 100

    # ── Signal Generation ───────────────────────────────────
    ema_bullish = latest_fast > latest_slow
    rsi_signal = "NEUTRAL"
    if rsi > 70:
        rsi_signal = "OVERBOUGHT"
    elif rsi < 30:
        rsi_signal = "OVERSOLD"

    signal = "HOLD"
    confidence = 50

    if ema_bullish and rsi_signal != "OVERBOUGHT":
        signal = "BUY"
        confidence = min(85, 55 + abs(ema_diff_pct) * 5)
        if rsi_signal == "OVERSOLD":
            confidence = min(92, confidence + 10)
        # News sentiment boost
        if news_analysis["sentiment"] == "positive":
            confidence = min(95, confidence + 5)
    elif not ema_bullish and rsi_signal != "OVERSOLD":
        signal = "SELL"
        confidence = min(85, 55 + abs(ema_diff_pct) * 5)
        if rsi_signal == "OVERBOUGHT":
            confidence = min(92, confidence + 10)
        if news_analysis["sentiment"] == "negative":
            confidence = min(95, confidence + 5)
    else:
        confidence = 45

    confidence = round(confidence)

    # ── Risk Level ──────────────────────────────────────────
    risk = "Medium"
    if volatility > 40 or rsi > 75 or rsi < 25:
        risk = "High"
    elif volatility < 20 and 40 < rsi < 60:
        risk = "Low"

    # ── Reasons Array (Explainable AI) ─────────────────────
    reasons = []

    if ema_bullish:
        reasons.append(f"Fast EMA ({latest_fast}) is above Slow EMA ({latest_slow}), indicating bullish momentum.")
    else:
        reasons.append(f"Fast EMA ({latest_fast}) is below Slow EMA ({latest_slow}), indicating bearish pressure.")

    if rsi > 70:
        reasons.append(f"RSI at {rsi} — asset is overbought, pullback risk is elevated.")
    elif rsi < 30:
        reasons.append(f"RSI at {rsi} — asset is oversold, potential bounce opportunity.")
    else:
        reasons.append(f"RSI at {rsi} — momentum is in a neutral zone.")

    if volatility > 40:
        reasons.append(f"Volatility is high at {volatility}% annualized — expect sharp price swings.")
    elif volatility < 15:
        reasons.append(f"Low volatility ({volatility}%) — price is stable and consolidating.")

    if news_analysis["sentiment"] == "positive":
        reasons.append("Recent news sentiment is bullish — positive catalysts detected.")
    elif news_analysis["sentiment"] == "negative":
        reasons.append("Recent news sentiment is bearish — negative headlines detected.")

    if news_analysis["top_headline"]:
        reasons.append(f"Latest headline: \"{news_analysis['top_headline']}\"")

    # ── Simple Explanation (ELI5) ──────────────────────────
    if signal == "BUY":
        simpleExplanation = "The price is trending upward and technical indicators look strong. AI recommends buying."
        if rsi_signal == "OVERSOLD":
            simpleExplanation = "The price dropped a lot recently but is starting to recover. It could be a good time to buy at a discount."
        elif news_analysis["sentiment"] == "positive":
            simpleExplanation = "The price is going up AND the news is positive — a strong combo that suggests buying."
    elif signal == "SELL":
        simpleExplanation = "The price momentum is weakening. Technical signals suggest it may drop further, so it might be safer to sell."
        if rsi_signal == "OVERBOUGHT":
            simpleExplanation = "The price has gone up too fast and might correct soon. Selling now could lock in profits."
        elif news_analysis["sentiment"] == "negative":
            simpleExplanation = "Market momentum is fading and negative news is adding pressure. Consider selling."
    else:
        simpleExplanation = "There is no strong direction right now — the market is in a wait-and-see mode."

    # ── Suggested Action ───────────────────────────────────
    if signal == "BUY" and risk == "Low":
        suggestedAction = "Invest 10-15% of your portfolio — strong setup with low risk."
    elif signal == "BUY" and risk == "Medium":
        suggestedAction = "Invest 5-10% of your portfolio — decent opportunity with moderate risk."
    elif signal == "BUY" and risk == "High":
        suggestedAction = "Small speculative position (2-5%) — high volatility detected."
    elif signal == "SELL" and risk != "Low":
        suggestedAction = "Consider reducing exposure or taking profits on this asset."
    elif signal == "SELL" and risk == "Low":
        suggestedAction = "Gradual exit recommended — weak momentum but stable conditions."
    else:
        suggestedAction = "Monitor position and wait for clearer signals."

    return {
        "symbol": symbol,
        "signal": signal,
        "confidence": confidence,
        "risk": risk,
        "reasons": reasons,
        "simpleExplanation": simpleExplanation,
        "suggestedAction": suggestedAction,
        "rsi": rsi,
        "ema_fast": latest_fast,
        "ema_slow": latest_slow,
        "current_price": current_price,
        "volatility": volatility,
    }


def generate_all_signals() -> list[dict]:
    """Generate signals for all tracked assets."""
    results = []
    for s in STOCK_SYMBOLS + CRYPTO_SYMBOLS:
        results.append(generate_signal(s))
    return results
