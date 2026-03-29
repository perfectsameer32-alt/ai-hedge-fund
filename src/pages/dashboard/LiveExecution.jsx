import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Brain, WifiOff } from 'lucide-react';
import { fetchMarketData, fetchAllSignals, fetchNews } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function LiveExecution() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoTrade, setIsAutoTrade] = useState(false);
  
  // Refs
  const assetsRef = useRef({});
  const signalsRef = useRef({});
  const newsRef = useRef([]);
  const isAutoTradeRef = useRef(isAutoTrade);

  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => { isAutoTradeRef.current = isAutoTrade; }, [isAutoTrade]);

  // ── Load live market data + Portfolio ──────────────
  const loadLiveData = useCallback(async () => {
    // 1. Load Market
    const marketRes = await fetchMarketData();
    setIsOffline(marketRes.offline);
    if (marketRes.data?.assets) {
      const assetMap = {};
      marketRes.data.assets.forEach((a) => {
        assetMap[a.symbol] = a;
      });
      setAssets(assetMap);
    }

    // 2. Load Signals
    const signalsRes = await fetchAllSignals();
    if (signalsRes.data?.signals) {
      const sigMap = {};
      signalsRes.data.signals.forEach((s) => {
        sigMap[s.symbol] = s;
      });
      signalsRef.current = sigMap;
    }
    // 3. Load News
    const newsRes = await fetchNews();
    if (newsRes.data?.news) {
      newsRef.current = newsRes.data.news;
    }

    setIsLoading(false);
  }, []);
  // ── Generate Logs (Simulated Auto Trade) ───────────────
  const generateTradeFromRealData = useCallback(() => {
    const currentAssets = assetsRef.current;
    const currentSignals = signalsRef.current;
    const currentAutoTrade = isAutoTradeRef.current;
    
    const symbols = ["BTC", "ETH", "SOL", "XRP", "AAPL"]; 
    if (!symbols.every(s => currentAssets[s])) return null;

    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const asset = currentAssets[symbol];
    const signal = currentSignals[symbol];

    let action = signal && signal.signal !== "HOLD" ? signal.signal : (Math.random() > 0.45 ? "BUY" : "SELL");

    const priceVariance = asset.price * (Math.random() * 0.002 - 0.001);
    const tradePrice = asset.price + priceVariance;
    const amount = asset.type === "crypto"
      ? (Math.random() * (symbol === "BTC" ? 0.05 : 2)).toFixed(4)
      : Math.floor(Math.random() * 50 + 5);

    return {
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
  }, []);

  // Polling & Intervals
  useEffect(() => {
    loadLiveData();
    const dataInterval = setInterval(loadLiveData, 5000);
    return () => clearInterval(dataInterval);
  }, [loadLiveData]);

  useEffect(() => {
    const terminalInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        const trade = generateTradeFromRealData();
        if (trade) setLogs((prev) => [trade, ...prev].slice(0, 50));
      }
    }, 2000);
    return () => clearInterval(terminalInterval);
  }, [generateTradeFromRealData]);

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

  const headerAssets = ["BTC", "ETH", "SOL", "XRP", "AAPL"].filter((s) => assets[s]);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="absolute top-0 left-0 w-[500px] h-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg w-max">
          <WifiOff size={14} /> Backend offline — using cached data
        </div>
      )}

      {/* Top Header / Price Ticker */}
      <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="text-neon-cyan" /> Live Execution & Paper Trading
          </h2>
          <p className="text-gray-400 text-sm font-light">
            Simulate trades in real-time or watch AI bots autonomously execute.
          </p>
        </div>
        
        <div className="flex gap-3">
            {headerAssets.map((sym) => {
              const a = assets[sym];
              const isUp = a.change_24h >= 0;
              return (
                <div key={sym} className="bg-dark-bg/50 border border-white/5 py-1.5 px-3 rounded-lg flex flex-col items-center">
                  <p className="text-[10px] text-gray-500 uppercase">{sym}</p>
                  <p className={`text-xs font-mono font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    ${a.price.toLocaleString()}
                  </p>
                </div>
              );
            })}
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
          {/* AI Log Terminal */}
          <motion.div 
             initial={{opacity:0, x:20}} animate={{opacity:1, x:0}}
             className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col max-h-[700px]"
          >
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <h3 className="font-bold flex items-center gap-2 text-white">
                      <Brain size={18} className="text-neon-cyan" />
                      Institutional AI Feed
                  </h3>
                  
                  {/* AUTO TRADE TOGGLE */}
                  <div className="flex items-center gap-3 bg-dark-bg/80 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isAutoTrade ? 'text-neon-cyan' : 'text-gray-500'}`}>
                      AI Auto-Trading Logs
                    </span>
                    <button
                      onClick={() => setIsAutoTrade(!isAutoTrade)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                        isAutoTrade ? 'bg-neon-cyan' : 'bg-gray-700'
                      }`}
                    >
                      <span className={`inline-block h-2 lg:h-3 w-2 lg:w-3 transform rounded-full bg-white transition-transform ${isAutoTrade ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
              </div>

              {/* Terminal Table */}
              <div className="flex-1 overflow-auto rounded-lg custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 bg-dark-bg/95 backdrop-blur z-10">
                    <tr>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Time</th>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Action</th>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Asset</th>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Size</th>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Price</th>
                      <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <motion.tr
                        initial={{ opacity: 0, scale: 0.98, backgroundColor: isAutoTrade ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}
                        animate={{ opacity: 1, scale: 1, backgroundColor: 'transparent' }}
                        transition={{ duration: 0.5 }}
                        key={log.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                         <td className="py-2.5 px-3 text-[11px] font-mono text-gray-500">{log.time}</td>
                         <td className="py-2.5 px-3 text-[11px] font-bold">
                           <span className={`flex items-center gap-1 ${log.action === 'BUY' ? 'text-emerald-400' : log.action === 'SELL' ? 'text-rose-400' : 'text-amber-400'}`}>
                             {log.action}
                           </span>
                         </td>
                         <td className="py-2.5 px-3 text-[11px] font-bold text-white">{log.asset}</td>
                         <td className="py-2.5 px-3 text-[11px] text-gray-300 font-mono">{log.amount}</td>
                         <td className="py-2.5 px-3 text-[11px] font-mono text-gray-400">${Number(log.price).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-[11px] text-right">
                            <span className={`inline-flex py-0.5 px-2 rounded text-[10px] border ${log.status === 'EXECUTED' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                              {log.status}
                            </span>
                          </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </motion.div>
      </div>
    </div>
  );
}
