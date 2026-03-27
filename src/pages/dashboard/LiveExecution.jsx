import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Brain, WifiOff, Minus, Activity, Power, Newspaper } from 'lucide-react';
import { fetchMarketData, fetchAllSignals, executeTrade, fetchNews } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function LiveExecution() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoTrade, setIsAutoTrade] = useState(false);
  
  // Refs to prevent dependency cycles in the setInterval
  const assetsRef = useRef({});
  const signalsRef = useRef({});
  const newsRef = useRef([]);
  const isAutoTradeRef = useRef(isAutoTrade);
  const userProfileRef = useRef(userProfile);

  // Sync refs safely
  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => { isAutoTradeRef.current = isAutoTrade; }, [isAutoTrade]);
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);

  // ── Load live market data + AI signals + News ──────────────
  const loadLiveData = useCallback(async () => {
    const marketRes = await fetchMarketData();
    setIsOffline(marketRes.offline);

    if (marketRes.data?.assets) {
      const assetMap = {};
      marketRes.data.assets.forEach((a) => {
        assetMap[a.symbol] = a;
      });
      setAssets(assetMap);
    }

    const signalsRes = await fetchAllSignals();
    if (signalsRes.data?.signals) {
      const sigMap = {};
      signalsRes.data.signals.forEach((s) => {
        sigMap[s.symbol] = s;
      });
      signalsRef.current = sigMap;
    }
    
    // Fetch General Market News
    const newsRes = await fetchNews();
    if (newsRes.data?.news) {
      newsRef.current = newsRes.data.news;
    }

    setIsLoading(false);
  }, []);

  // ── Execute real trade via Backend + Alpaca ───────────────
  const executeRealTrade = async (trade) => {
    if (trade.action === "HOLD") return;

    try {
      const res = await executeTrade(trade.asset, trade.action, parseFloat(trade.amount));
      if (res.error) {
        toast.error(`Trade failed: ${trade.asset}`);
        return;
      }
      
      toast.success(`Alpaca Executed: ${trade.action} ${trade.amount} ${trade.asset}`);

      // Save to Firebase Trade History
      if (userProfileRef.current?.uid) {
        await addDoc(collection(db, "trades"), {
          userId: userProfileRef.current.uid,
          symbol: trade.asset,
          side: trade.action,
          qty: parseFloat(trade.amount),
          price: parseFloat(trade.price),
          timestamp: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Trade execution error:", e);
    }
  };

  // ── Generate a news log entry dynamically ──────────────────
  const generateNewsLog = useCallback(() => {
    const currentNews = newsRef.current;
    if (currentNews.length === 0) return null;
    
    // Pick a random news item
    const article = currentNews[Math.floor(Math.random() * currentNews.length)];
    
    return {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      time: new Date().toLocaleTimeString(),
      isNews: true,
      asset: article.symbol || "MARKET",
      title: article.title
    };
  }, []);

  // ── Generate a trade log entry dynamically ───────────────
  const generateTradeFromRealData = useCallback(() => {
    const currentAssets = assetsRef.current;
    const currentSignals = signalsRef.current;
    const currentAutoTrade = isAutoTradeRef.current;
    
    const symbols = Object.keys(currentAssets);
    if (symbols.length === 0) return null;

    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const asset = currentAssets[symbol];
    const signal = currentSignals[symbol];

    // Use AI signal to drive the action, falling back to random
    let action = "BUY";
    if (signal) {
      if (signal.signal === "HOLD") return null;
      action = signal.signal;
    } else {
      action = Math.random() > 0.45 ? "BUY" : "SELL";
    }

    // Slightly vary price from real price
    const priceVariance = asset.price * (Math.random() * 0.002 - 0.001);
    const tradePrice = asset.price + priceVariance;
    const isCrypto = asset.type === "crypto";
    const amount = isCrypto
      ? (Math.random() * (symbol === "BTC" ? 2 : 15)).toFixed(4)
      : Math.floor(Math.random() * 200 + 10);

    const trade = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      time: new Date().toLocaleTimeString(),
      isNews: false,
      asset: symbol,
      assetType: asset.type,
      action,
      amount: String(amount),
      price: tradePrice.toFixed(2),
      confidence: signal?.confidence || null,
      status: currentAutoTrade ? "EXECUTED" : "SIMULATED",
    };

    if (currentAutoTrade) {
      executeRealTrade(trade);
    }

    return trade;
  }, []);

  // ── Initial load & Background Polling ─────────────────────
  useEffect(() => {
    loadLiveData();
    const dataInterval = setInterval(loadLiveData, 5000);
    return () => clearInterval(dataInterval);
  }, [loadLiveData]);

  // ── High Speed Terminal Generator ────────────────────────
  useEffect(() => {
    const terminalInterval = setInterval(() => {
      // 15% chance to flash a NEWS headline
      if (Math.random() > 0.85) {
        const news = generateNewsLog();
        if (news) setLogs((prev) => [news, ...prev].slice(0, 50));
      } 
      // Otherwise 40% chance to generate a trade
      else if (Math.random() > 0.6) {
        const trade = generateTradeFromRealData();
        if (trade) setLogs((prev) => [trade, ...prev].slice(0, 50));
      }
    }, 1500);

    return () => clearInterval(terminalInterval);
  }, [generateTradeFromRealData, generateNewsLog]);

  // ── Skeleton loader ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="glass-panel p-6 sm:p-8 rounded-2xl h-[80vh] flex items-center justify-center animate-pulse">
        <div className="text-center">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Connecting to live market feed...</p>
        </div>
      </div>
    );
  }

  // Top displayed assets for the header ticker
  const headerAssets = ["BTC", "ETH", "AAPL", "TSLA"].filter((s) => assets[s]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 sm:p-8 rounded-2xl h-[80vh] flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />

      {/* Offline banner */}
      {isOffline && (
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg">
          <WifiOff size={14} />
          Backend offline — using cached data
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="text-neon-cyan" /> 
            {isAutoTrade ? "Live Trading Terminal" : "Paper Execution Terminal"}
          </h2>
          <p className="text-gray-400 text-sm font-light">
            AI-driven autonomous trading • Connected to Alpaca
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Header Stats Ticker */}
          <div className="hidden lg:flex gap-3 mr-4">
            {headerAssets.map((sym) => {
              const a = assets[sym];
              const isUp = a.change_24h >= 0;
              return (
                <div key={sym} className="bg-dark-bg/50 border border-white/5 py-1.5 px-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">{sym}</p>
                  <p className={`text-xs font-mono font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    ${a.price.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AUTO TRADE TOGGLE */}
          <div className="flex items-center gap-3 bg-dark-bg/80 border border-white/10 p-2 rounded-xl">
            <span className={`text-sm font-medium ${isAutoTrade ? 'text-neon-cyan' : 'text-gray-500'}`}>
              Auto Trade
            </span>
            <button
              onClick={() => {
                if (!isAutoTrade && !window.confirm("WARNING: This will enable live auto-trading against your Alpaca Paper account. Are you sure?")) return;
                setIsAutoTrade(!isAutoTrade);
                if (!isAutoTrade) {
                    toast.success("Auto Trading Activated. AI acts autonomously.");
                } else {
                    toast("Auto Trading paused.");
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isAutoTrade ? 'bg-neon-cyan' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAutoTrade ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/5 custom-scrollbar bg-dark-bg/30">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-dark-bg/95 backdrop-blur z-10">
            <tr>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">TIME</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">ACTION</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">ASSET</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">SIZE</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">PRICE</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5">AI CONF.</th>
              <th className="py-4 px-4 text-xs tracking-wider text-gray-400 font-semibold border-b border-white/5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <motion.tr
                initial={{ opacity: 0, scale: 0.98, backgroundColor: log.isNews ? 'rgba(168, 85, 247, 0.1)' : isAutoTrade ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}
                animate={{ opacity: 1, scale: 1, backgroundColor: 'transparent' }}
                transition={{ duration: 0.5 }}
                key={log.id}
                className={`hover:bg-white/5 transition-colors ${log.isNews ? 'bg-neon-purple/5' : ''}`}
              >
                {log.isNews ? (
                  <>
                    <td className="py-3 px-4 text-sm font-mono text-gray-400">{log.time}</td>
                    <td className="py-3 px-4 text-sm font-bold text-neon-purple flex items-center gap-1">
                      <Newspaper size={14} /> NEWS
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-white">{log.asset}</td>
                    <td colSpan={3} className="py-3 px-4 text-sm text-gray-300 italic truncate max-w-[200px]">
                      {log.title}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                        BROADCAST
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-sm font-mono text-gray-400">{log.time}</td>
                    <td className="py-3 px-4 text-sm font-bold">
                      <span className={`flex items-center gap-1 ${log.action === 'BUY' ? 'text-emerald-400' : log.action === 'SELL' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {log.action === 'BUY' ? <TrendingUp size={14} /> : log.action === 'SELL' ? <TrendingDown size={14} /> : <Minus size={14} />}
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-white">
                      {log.asset}
                      <span className="text-xs text-gray-600 ml-1">({log.assetType})</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{log.amount}</td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-400">${Number(log.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">
                      {log.confidence ? (
                        <span className="flex items-center gap-1 text-neon-cyan">
                          <Brain size={13} />
                          {log.confidence}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border ${
                        log.status === 'EXECUTED' 
                        ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20' 
                        : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {log.status === 'EXECUTED' && <Power size={12} />}
                        {log.status}
                      </span>
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
