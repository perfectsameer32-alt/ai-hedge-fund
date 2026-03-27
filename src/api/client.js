/**
 * API Client — Central interface to the AI Hedge Fund backend.
 * 
 * Handles all fetch calls, error handling, and provides fallback
 * data when the backend is unreachable.
 */

const API_BASE = "http://localhost:8001/api";

// ── Generic fetch wrapper ──────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`API ${response.status}: ${response.statusText}`);
    }
    return { data: await response.json(), error: null, offline: false };
  } catch (error) {
    console.warn(`[API] Failed to reach ${endpoint}:`, error.message);
    return { data: null, error: error.message, offline: true };
  }
}

// ── Market Data ────────────────────────────────────────────────
export async function fetchMarketData() {
  const result = await apiFetch("/market");
  if (result.offline) {
    return {
      ...result,
      data: { assets: FALLBACK_MARKET },
    };
  }
  return result;
}

export async function fetchAssetDetail(symbol) {
  return apiFetch(`/market/${symbol}`);
}

// ── AI Signals ─────────────────────────────────────────────────
export async function fetchAllSignals() {
  const result = await apiFetch("/ai-signals");
  if (result.offline) {
    return {
      ...result,
      data: { signals: FALLBACK_SIGNALS },
    };
  }
  return result;
}

export async function fetchSignal(symbol) {
  return apiFetch(`/ai-signal/${symbol}`);
}

// ── Portfolio ──────────────────────────────────────────────────
export async function fetchPortfolio() {
  const result = await apiFetch("/portfolio");
  if (result.offline) {
    return {
      ...result,
      data: FALLBACK_PORTFOLIO,
    };
  }
  return result;
}

// ── Trade Execution ────────────────────────────────────────────
export async function executeTrade(symbol, side, qty) {
  const result = await apiFetch("/trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ symbol, side, qty, type: "market" })
  });
  return result;
}

// ── News ───────────────────────────────────────────────────────
export async function fetchNews(symbol = null) {
  const endpoint = symbol ? `/news/${symbol}` : "/news";
  const result = await apiFetch(endpoint);
  if (result.offline || !result.data?.news) {
    return {
      ...result,
      data: { news: FALLBACK_NEWS },
    };
  }
  return result;
}

// ── Fallback Data (when backend is offline) ────────────────────
const FALLBACK_NEWS = [
  { title: "Federal Reserve signals potential rate cuts as inflation cools", date: new Date().toUTCString(), symbol: "SPY" },
  { title: "Tech stocks rally heavily amidst strong enterprise AI adoption", date: new Date().toUTCString(), symbol: "QQQ" },
  { title: "Global markets brace for impact following sudden geopolitical tensions", date: new Date().toUTCString(), symbol: "SPY" }
];

const FALLBACK_MARKET = [
  { symbol: "AAPL", type: "stock", price: 195.00, change_24h: 0.45, high: 196.20, low: 193.80, volume: 45000000 },
  { symbol: "TSLA", type: "stock", price: 175.50, change_24h: -1.20, high: 178.00, low: 174.00, volume: 62000000 },
  { symbol: "BTC", type: "crypto", price: 64200.00, change_24h: 1.8, high: 65000.00, low: 63500.00, volume: 28000 },
  { symbol: "ETH", type: "crypto", price: 3450.00, change_24h: 2.1, high: 3500.00, low: 3400.00, volume: 150000 },
];

const FALLBACK_SIGNALS = [
  { symbol: "AAPL", signal: "BUY", confidence: 72, reasoning: "Offline mode — cached signal." },
  { symbol: "TSLA", signal: "HOLD", confidence: 55, reasoning: "Offline mode — cached signal." },
  { symbol: "BTC", signal: "BUY", confidence: 68, reasoning: "Offline mode — cached signal." },
];

const FALLBACK_PORTFOLIO = {
  nav: 42150000.00,
  total_pnl: 2150000.00,
  total_pnl_pct: 5.38,
  sharpe_ratio: 2.84,
  active_positions: 6,
  positions: [],
};
