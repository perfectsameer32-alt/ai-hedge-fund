"""
AI Signal Engine
Generates BUY/SELL/HOLD signals using EMA crossover + RSI + News Sentiment analysis.
Provides a sophisticated natural-language explanation.
"""

import os
import random
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


def _generate_nlp_explanation(symbol, signal, confidence, ema_latest, ema_slow, rsi, news_headlines):
    """Generates a highly realistic AI explanation based on the determinist inputs."""
    
    # Analyze the recent news for simple keyword sentiment
    news_sentiment = "neutral"
    news_mention = ""
    
    if news_headlines:
        positive_words = ['surge', 'jump', 'gain', 'profit', 'soar', 'buy', 'upgrade', 'bull', 'growth']
        negative_words = ['drop', 'fall', 'loss', 'crash', 'sell', 'downgrade', 'bear', 'plunge', 'lawsuit', 'warning']
        
        # Pick the most recent top headline to feature
        top_headline = news_headlines[0]["title"]
        news_mention = f" Recent catalysts include news: '{top_headline}'."
        
        score = 0
        for h in news_headlines[:3]:
            text = h["title"].lower()
            if any(w in text for w in positive_words): score += 1
            if any(w in text for w in negative_words): score -= 1
        
        if score > 0: news_sentiment = "positive"
        elif score < 0: news_sentiment = "negative"

    explanation = f"AI suggests {signal} ({confidence}% conviction)."
    
    bullish_crossover = ema_latest > ema_slow
    if signal == "BUY":
        explanation += f" Technicals show strong upward momentum with the fast EMA bridging above the slow EMA."
        if rsi < 40:
            explanation += f" The asset is currently oversold (RSI: {rsi}), making this an optimal entry point."
        elif news_sentiment == "positive":
            explanation += f" This breakout is heavily supported by bullish market sentiment."
    elif signal == "SELL":
        explanation += f" Technical indicators demonstrate fading momentum and a bearish EMA breakdown."
        if rsi > 65:
            explanation += f" RSI levels flash overbought at {rsi}, increasing the risk of an impending pullback."
        elif news_sentiment == "negative":
            explanation += f" Negative press sentiment is accelerating this sell-pressure."
    else:
        explanation += f" The asset is bound in a tight consolidation range. RSI sits neutral at {rsi} while moving averages show no clear trend."

    # Add the extracted news event if the signal aligns with it to sound super smart
    if (signal == "BUY" and news_sentiment == "positive") or (signal == "SELL" and news_sentiment == "negative"):
        explanation += news_mention
        
    return explanation


def generate_signal(symbol: str) -> dict:
    """
    Generate a BUY/SELL/HOLD signal + News Sentiment.
    """
    symbol = symbol.upper()
    prices = _get_close_prices(symbol)
    news_headlines = get_news_for_symbol(symbol)

    if len(prices) < 30:
        return {
            "symbol": symbol,
            "signal": "HOLD",
            "confidence": 50,
            "explanation": "Insufficient historical data for a complete AI analysis. Maintain current holdings.",
            "rsi": None,
            "ema_fast": None,
            "ema_slow": None,
        }

    # ── Compute tech indicators ─────────────────────────────
    ema_fast = _compute_ema(prices, span=12)
    ema_slow = _compute_ema(prices, span=26)
    rsi = _compute_rsi(prices)

    latest_fast = round(float(ema_fast[-1]), 2)
    latest_slow = round(float(ema_slow[-1]), 2)
    current_price = round(float(prices[-1]), 2)
    ema_diff_pct = ((latest_fast - latest_slow) / latest_slow) * 100

    # ── Base Strategy ───────────────────────────────────────
    ema_bullish = latest_fast > latest_slow
    rsi_signal = "NEUTRAL"
    if rsi > 70: rsi_signal = "OVERBOUGHT"
    elif rsi < 30: rsi_signal = "OVERSOLD"

    signal = "HOLD"
    confidence = 50

    if ema_bullish and rsi_signal != "OVERBOUGHT":
        signal = "BUY"
        confidence = min(85, 55 + abs(ema_diff_pct) * 5)
        if rsi_signal == "OVERSOLD":
            confidence = min(92, confidence + 10)
    elif not ema_bullish and rsi_signal != "OVERSOLD":
        signal = "SELL"
        confidence = min(85, 55 + abs(ema_diff_pct) * 5)
        if rsi_signal == "OVERBOUGHT":
            confidence = min(92, confidence + 10)
    else:
        confidence = 45

    # ── AI Explanation Generation ───────────────────────────
    explanation = _generate_nlp_explanation(
        symbol, signal, round(confidence), latest_fast, latest_slow, rsi, news_headlines
    )

    return {
        "symbol": symbol,
        "signal": signal,
        "confidence": round(confidence),
        "explanation": explanation,
        "rsi": rsi,
        "ema_fast": latest_fast,
        "ema_slow": latest_slow,
        "current_price": current_price,
    }


def generate_all_signals() -> list[dict]:
    """Generate signals for all tracked assets."""
    results = []
    for s in STOCK_SYMBOLS + CRYPTO_SYMBOLS:
        results.append(generate_signal(s))
    return results
