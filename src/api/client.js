/**
 * API Client v2.0 — Backend-First Architecture
 * 
 * Priority: FastAPI Backend → CoinGecko Fallback → Offline
 * 
 * When the backend is running, all data comes from real yfinance + Binance + Yahoo News.
 * If backend is down, falls back to CoinGecko for crypto and mock data for stocks.
 */

// ── Backend URL ────────────────────────────────────────────────
// Change this to your deployed backend URL (e.g., "https://your-app.onrender.com")
const BACKEND_URL = "http://localhost:10000";

// ── Fallback Data (used when backend is down) ──────────────────
const AAPL_MOCK = { usd: 195.0, usd_24h_change: 0.45 };
const TSLA_MOCK = { usd: 175.5, usd_24h_change: -1.2 };

// ── Helper: fetch with timeout ─────────────────────────────────
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}


// ══════════════════════════════════════════════════════════════
// 1. MARKET DATA
// ══════════════════════════════════════════════════════════════
export async function fetchMarketData() {
  // ── Try Backend First ──────────────────────────────────────
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/api/market`);
    if (data?.assets && data.assets.length > 0) {
      return {
        data: { assets: data.assets },
        offline: false,
        source: "backend"
      };
    }
  } catch (e) {
    console.warn("[client.js] Backend unavailable for /api/market, falling back to CoinGecko:", e.message);
  }

  // ── Fallback: CoinGecko (crypto only) + Mock (stocks) ──────
  try {
    const ids = "bitcoin,ethereum,solana,ripple";
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    const data = await res.json();

    return {
      data: {
        assets: [
          { symbol: "BTC", type: "crypto", price: data.bitcoin?.usd || 65000, change_24h: data.bitcoin?.usd_24h_change || 0, volume: 30000000 },
          { symbol: "ETH", type: "crypto", price: data.ethereum?.usd || 3500, change_24h: data.ethereum?.usd_24h_change || 0, volume: 15000000 },
          { symbol: "SOL", type: "crypto", price: data.solana?.usd || 150, change_24h: data.solana?.usd_24h_change || 0, volume: 5000000 },
          { symbol: "XRP", type: "crypto", price: data.ripple?.usd || 0.6, change_24h: data.ripple?.usd_24h_change || 0, volume: 2000000 },
          { symbol: "AAPL", type: "stock", price: AAPL_MOCK.usd, change_24h: AAPL_MOCK.usd_24h_change, volume: 45000000 },
          { symbol: "TSLA", type: "stock", price: TSLA_MOCK.usd, change_24h: TSLA_MOCK.usd_24h_change, volume: 62000000 }
        ]
      },
      offline: false,
      source: "coingecko-fallback"
    };
  } catch (error) {
    console.error("All market data sources failed:", error);
    return { data: { assets: [] }, offline: true, error: error.message };
  }
}


// ══════════════════════════════════════════════════════════════
// 2. ASSET DETAIL (Price History)
// ══════════════════════════════════════════════════════════════
export async function fetchAssetDetail(symbol) {
  // ── Try Backend First ──────────────────────────────────────
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/api/market/${symbol}`);
    if (data?.history && data.history.length > 0) {
      return {
        data: {
          currentPrice: data.current?.price || 0,
          history: data.history.map(h => ({
            date: h.date,
            close: h.close
          }))
        },
        offline: false,
        source: "backend"
      };
    }
  } catch (e) {
    console.warn(`[client.js] Backend unavailable for /api/market/${symbol}, generating mock history`);
  }

  // ── Fallback: Generate simulated history ───────────────────
  try {
    const marketFetch = await fetchMarketData();
    const asset = marketFetch.data.assets.find(a => a.symbol === symbol);
    if (!asset) throw new Error("Asset not found");

    const currentPrice = asset.price;
    const history = [];
    let date = new Date();
    date.setDate(date.getDate() - 30);

    let simulatedPrice = currentPrice * (1 - (asset.change_24h / 100 * 5));
    for (let i = 0; i < 30; i++) {
      history.push({
        date: date.toISOString().split('T')[0],
        close: simulatedPrice
      });
      simulatedPrice = simulatedPrice * (1 + (Math.random() * 0.04 - 0.018));
      date.setDate(date.getDate() + 1);
    }
    history.push({
      date: new Date().toISOString().split('T')[0],
      close: currentPrice
    });

    return { data: { currentPrice, history }, offline: false, source: "mock-fallback" };
  } catch (e) {
    return { data: null, offline: true, error: e.message };
  }
}


// ══════════════════════════════════════════════════════════════
// 3. NEWS (with Sentiment)
// ══════════════════════════════════════════════════════════════
export async function fetchNews(symbol = null) {
  // ── Try Backend First ──────────────────────────────────────
  try {
    const endpoint = symbol
      ? `${BACKEND_URL}/api/news/${symbol}`
      : `${BACKEND_URL}/api/news`;
    const data = await fetchWithTimeout(endpoint, 8000);

    if (data?.news && data.news.length > 0) {
      return {
        data: { news: data.news },
        offline: false,
        source: "backend"
      };
    }
  } catch (e) {
    console.warn("[client.js] Backend unavailable for /api/news, falling back to CryptoCompare/Finnhub");
  }

  // ── Fallback: Direct API calls ─────────────────────────────
  try {
    const allNews = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // CryptoCompare
    try {
      const cryptoUrl = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN`;
      const cryptoRes = await fetch(cryptoUrl, { signal: controller.signal });
      const cryptoJson = await cryptoRes.json();

      if (cryptoJson.Data) {
        cryptoJson.Data.slice(0, 15).forEach(item => {
          allNews.push({
            title: item.title,
            date: new Date(item.published_on * 1000).toISOString(),
            link: item.url,
            image: item.imageurl,
            source: item.source_info?.name || "Crypto News",
            category: "Crypto"
          });
        });
      }
    } catch (e) {
      console.warn("CryptoCompare fetch failed:", e);
    }

    clearTimeout(timeoutId);

    // Sort by date (newest first)
    const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Basic sentiment enrichment
    const enrichedNews = sortedNews.slice(0, 20).map(item => {
      const lower = item.title.toLowerCase();
      let sentiment = "Neutral";
      let explanation = "Market sentiment remains balanced with no clear directional bias.";

      if (lower.match(/(bull|surge|jump|high|gain|up|adopt|approve|launch|grow|positive|recovery|success|soar)/)) {
        sentiment = "Bullish";
        explanation = "Positive catalysts or strong momentum suggests upward price movement.";
      } else if (lower.match(/(bear|crash|drop|low|loss|down|ban|reject|hack|fear|negative|slump|fail|plunge)/)) {
        sentiment = "Bearish";
        explanation = "Negative market catalysts could lead to near-term downward pressure.";
      }

      return { ...item, sentiment, explanation };
    });

    return { data: { news: enrichedNews }, offline: false, source: "fallback" };
  } catch (e) {
    console.error("News aggregation failed:", e);
    return { data: { news: [] }, offline: true, error: e.message };
  }
}


// ══════════════════════════════════════════════════════════════
// 4. AI SIGNALS (Explainable AI)
// ══════════════════════════════════════════════════════════════
export async function fetchAllSignals() {
  // ── Try Backend First ──────────────────────────────────────
  try {
    const data = await fetchWithTimeout(`${BACKEND_URL}/api/ai-signals`, 15000);

    if (data?.signals && data.signals.length > 0) {
      // Map backend response to the format the frontend expects
      const signals = data.signals.map(s => ({
        symbol: s.symbol,
        signal: s.signal,
        confidence: s.confidence,
        risk: s.risk || "Medium",
        reasons: s.reasons || [],
        simpleExplanation: s.simpleExplanation || s.explanation || "",
        suggestedAction: s.suggestedAction || "Monitor position and wait for clearer signals."
      }));

      return {
        data: { signals },
        offline: false,
        source: "backend"
      };
    }
  } catch (e) {
    console.warn("[client.js] Backend unavailable for /api/ai-signals, falling back to local engine:", e.message);
  }

  // ── Fallback: Local AI Signal Engine ────────────────────────
  try {
    const market = await fetchMarketData();
    const news = await fetchNews();

    const bullishNewsCount = news.data.news.filter(n => n.sentiment === "Bullish").length;
    const bearishNewsCount = news.data.news.filter(n => n.sentiment === "Bearish").length;

    const signals = market.data.assets.map(asset => {
      let score = 50;

      // Factor 1: Price Action
      if (asset.change_24h > 2) score += 15;
      else if (asset.change_24h > 0) score += 5;
      else if (asset.change_24h < -2) score -= 15;
      else if (asset.change_24h < 0) score -= 5;

      // Factor 2: News Sentiment
      if (bullishNewsCount > bearishNewsCount) score += 10;
      if (bearishNewsCount > bullishNewsCount) score -= 10;

      const confidence = Math.min(Math.max(score, 10), 99);

      let signal = "HOLD";
      if (confidence >= 65) signal = "BUY";
      if (confidence <= 35) signal = "SELL";

      let reasons = [];
      if (asset.change_24h > 0) reasons.push(`Positive 24h trend (+${asset.change_24h.toFixed(2)}%) shows accumulation.`);
      else if (asset.change_24h < 0) reasons.push(`Negative 24h trend (${asset.change_24h.toFixed(2)}%) shows selling pressure.`);
      if (bullishNewsCount > bearishNewsCount) reasons.push("Overall Macro news sentiment implies market optimism.");
      if (asset.volume > 10000000) reasons.push("High liquidity and trading volume supports price stability.");
      if (reasons.length === 0) reasons.push("Consolidation phase detected, waiting for breakout.");

      let simpleExplanation = "The price is going up and people are buying more, so AI suggests buying.";
      if (signal === "SELL") simpleExplanation = "Market momentum looks weak and there is negative news, it might be safer to sell.";
      else if (signal === "HOLD") simpleExplanation = "There is no strong direction right now, best to wait and hold.";

      let risk = "Medium";
      const absChange = Math.abs(asset.change_24h);
      if (absChange > 5 || confidence < 30) risk = "High";
      else if (absChange < 2 && confidence > 60) risk = "Low";

      let suggestedAction = "Monitor position and wait for clearer signals.";
      if (signal === "BUY" && risk === "Low") suggestedAction = "Invest 10-15% of your portfolio — strong setup with low risk.";
      else if (signal === "BUY" && risk === "Medium") suggestedAction = "Invest 5-10% of your portfolio — decent opportunity with moderate risk.";
      else if (signal === "BUY" && risk === "High") suggestedAction = "Small speculative position (2-5%) — high volatility detected.";
      else if (signal === "SELL" && risk !== "Low") suggestedAction = "Consider reducing exposure or taking profits on this asset.";
      else if (signal === "SELL" && risk === "Low") suggestedAction = "Gradual exit recommended — weak momentum but stable conditions.";

      return { symbol: asset.symbol, signal, confidence, risk, reasons, simpleExplanation, suggestedAction };
    });

    return { data: { signals }, offline: false, source: "local-fallback" };
  } catch (e) {
    return { data: { signals: [] }, offline: true, error: e.message };
  }
}


// ══════════════════════════════════════════════════════════════
// 5. PORTFOLIO
// ══════════════════════════════════════════════════════════════
import { getUserPortfolio } from './trading';

export async function fetchPortfolio() {
  try {
    const portfolio = await getUserPortfolio();
    if (!portfolio) {
      return {
        data: {
          nav: 0, total_pnl: 0, total_pnl_pct: 0,
          sharpe_ratio: 0, active_positions: 0, positions: []
        },
        offline: false
      };
    }

    const market = await fetchMarketData();
    let currentNav = portfolio.usdBalance;
    let activePosCount = 0;

    for (const [symbol, qty] of Object.entries(portfolio.positions)) {
      if (qty > 0) {
        activePosCount++;
        const asset = market.data.assets.find(a => a.symbol === symbol);
        if (asset) currentNav += asset.price * qty;
      }
    }

    const totalPnl = currentNav - 10000;
    const totalPnlPct = (totalPnl / 10000) * 100;

    return {
      data: {
        nav: currentNav,
        total_pnl: totalPnl,
        total_pnl_pct: totalPnlPct,
        sharpe_ratio: (totalPnlPct > 0 ? 1.5 + Math.random() : 0.8),
        active_positions: activePosCount,
        positions: portfolio.positions
      },
      offline: false
    };
  } catch (e) {
    return { data: null, offline: true, error: e.message };
  }
}
