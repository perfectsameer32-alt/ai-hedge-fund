import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Briefcase, WifiOff, RefreshCw, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchMarketData } from '../../api/client';
import { getUserPortfolio, executePaperTrade, getTradeHistory } from '../../api/trading';
import toast from 'react-hot-toast';

export default function PaperTrading() {
  const [assets, setAssets] = useState({});
  const [portfolio, setPortfolio] = useState({ usdBalance: 10000, positions: {} });
  const [tradeHistory, setTradeHistory] = useState([]);
  
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Paper manual trading state
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [tradeAction, setTradeAction] = useState("BUY");
  const [tradeQty, setTradeQty] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  
  // ── Load live market data + Portfolio + Trade History ──────────────
  const loadData = useCallback(async () => {
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
    
    // 2. Load Portfolio (paper trading balance)
    const port = await getUserPortfolio();
    if (port) setPortfolio(port);

    // 3. Load Trade History
    const trades = await getTradeHistory(30);
    setTradeHistory(trades);

    setIsLoading(false);
  }, []);

  // ── Handle Manual Trade ─────────────────────────────────
  const handleManualTrade = async () => {
      const qty = parseFloat(tradeQty);
      if (isNaN(qty) || qty <= 0) {
          toast.error("Please enter a valid quantity.", { style: { background: '#12121A', color: '#fff' } });
          return;
      }
      
      const currentPrice = assets[selectedAsset]?.price;
      if (!currentPrice) {
          toast.error("Live price not available.");
          return;
      }

      setIsTrading(true);
      try {
          const newPortfolio = await executePaperTrade(selectedAsset, tradeAction, qty, currentPrice);
          setPortfolio(newPortfolio);
          toast.success(`${tradeAction} executed for ${qty} ${selectedAsset}`, { style: { background: '#12121A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
          setTradeQty(""); // Reset input
          // Refresh trade history
          const trades = await getTradeHistory(30);
          setTradeHistory(trades);
      } catch (err) {
          toast.error(err.message || "Trade failed");
      }
      setIsTrading(false);
  };

  // Polling
  useEffect(() => {
    loadData();
    const dataInterval = setInterval(loadData, 5000);
    return () => clearInterval(dataInterval);
  }, [loadData]);

  // ── Helpers ─────────────────────────────────────────
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Calculate total portfolio value
  const totalPortfolioValue = (() => {
    let total = portfolio.usdBalance;
    for (const [sym, qty] of Object.entries(portfolio.positions || {})) {
      if (qty > 0 && assets[sym]) {
        total += assets[sym].price * qty;
      }
    }
    return total;
  })();

  const totalPnl = totalPortfolioValue - 10000;
  const totalPnlPct = (totalPnl / 10000) * 100;

  if (isLoading) {
    return (
      <div className="glass-panel p-6 sm:p-8 rounded-2xl h-[80vh] flex items-center justify-center animate-pulse">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Connecting to live market simulator...</p>
        </div>
      </div>
    );
  }

  const currentAssetPrice = assets[selectedAsset]?.price || 0;
  const currentAssetQty = portfolio.positions[selectedAsset] || 0;
  const estimatedCost = parseFloat(tradeQty || 0) * currentAssetPrice;

  const holdingEntries = Object.entries(portfolio.positions || {}).filter(([, qty]) => qty > 0);

  return (
    <div className="flex flex-col gap-6 relative max-w-4xl mx-auto w-full">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg w-max">
          <WifiOff size={14} /> Backend offline — using cached data
        </div>
      )}

      {/* Header */}
      <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
        <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
          <Briefcase className="text-emerald-400" /> Paper Trading Simulator
        </h2>
        <p className="text-gray-400 text-sm font-light">
          Hone your strategies with zero risk using live market data.
        </p>
      </motion.div>

      {/* ── Portfolio Summary Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.05}}
          className="glass p-5 rounded-xl border-l-[3px] border-l-emerald-400"
        >
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Total Value</p>
          <p className="text-xl font-mono font-bold text-white">{formatCurrency(totalPortfolioValue)}</p>
        </motion.div>
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}}
          className="glass p-5 rounded-xl border-l-[3px] border-l-neon-cyan"
        >
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Cash Balance</p>
          <p className="text-xl font-mono font-bold text-emerald-400">{formatCurrency(portfolio.usdBalance)}</p>
        </motion.div>
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.15}}
          className={`glass p-5 rounded-xl border-l-[3px] ${totalPnl >= 0 ? 'border-l-emerald-400' : 'border-l-rose-400'}`}
        >
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Total P&L</p>
          <p className={`text-xl font-mono font-bold flex items-center gap-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {formatCurrency(totalPnl)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
          </p>
        </motion.div>
      </div>

      {/* ── Main Trade Terminal ──────────────────────────── */}
      <motion.div 
        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} 
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5"
      >
          <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  Execute Trade
              </h3>
              <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Purchasing Power</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 rounded flex items-center gap-1 justify-end">
                      <DollarSign size={16} />
                      {portfolio.usdBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col: Asset Selection & Market Info */}
            <div className="space-y-6">
                <div>
                    <label className="block text-xs text-gray-400 mb-3 uppercase tracking-wide">Select Asset</label>
                    <div className="flex flex-wrap gap-2">
                        {["BTC", "ETH", "SOL", "XRP", "AAPL", "TSLA"].map(sym => (
                            <button 
                            key={sym}
                            onClick={() => setSelectedAsset(sym)}
                            className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors border ${
                                selectedAsset === sym 
                                ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" 
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                            }`}
                            >
                                {sym}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-dark-bg/60 p-5 rounded-xl border border-white/5 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Live Ask Price:</span>
                        <span className="font-mono text-lg text-white">${currentAssetPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                    </div>
                    <div className="h-px w-full bg-white/5" />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Current Position:</span>
                        <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">{currentAssetQty} <span className="text-xs text-gray-500">{selectedAsset}</span></span>
                    </div>
                    {assets[selectedAsset] && (
                      <>
                        <div className="h-px w-full bg-white/5" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">24h Change:</span>
                            <span className={`font-mono text-sm flex items-center gap-1 ${assets[selectedAsset].change_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {assets[selectedAsset].change_24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              {assets[selectedAsset].change_24h?.toFixed(2)}%
                            </span>
                        </div>
                      </>
                    )}
                </div>
            </div>

            {/* Right Col: Order Form */}
            <div className="space-y-6">
                {/* Action Toggle */}
                <div className="flex bg-dark-bg/80 p-1 rounded-xl border border-white/10 shadow-inner">
                    <button 
                        onClick={() => setTradeAction("BUY")}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${tradeAction === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm" : "text-gray-500 hover:text-white"}`}
                    >
                        BUY
                    </button>
                    <button 
                        onClick={() => setTradeAction("SELL")}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${tradeAction === "SELL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm" : "text-gray-500 hover:text-white"}`}
                    >
                        SELL
                    </button>
                </div>

                {/* Qty Input */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="block text-xs text-gray-400 uppercase tracking-wide">Quantity</label>
                        {tradeAction === "SELL" && currentAssetQty > 0 && (
                            <button 
                                onClick={() => setTradeQty(String(currentAssetQty))}
                                className="text-[10px] text-emerald-400 hover:underline"
                            >
                                Max: {currentAssetQty}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input 
                            type="number"
                            min="0"
                            step="0.0001"
                            value={tradeQty}
                            onChange={(e) => setTradeQty(e.target.value)}
                            disabled={isTrading}
                            placeholder="0.00"
                            className="w-full bg-dark-bg border border-white/10 rounded-xl py-4 px-5 text-lg text-white font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600 disabled:opacity-50"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono pointer-events-none">
                            {selectedAsset}
                        </div>
                    </div>
                </div>
                
                {/* Estimated Cost/Proceeds */}
                <div className="flex justify-between items-center px-2 bg-dark-bg/40 py-3 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-400">{tradeAction === "BUY" ? "Estimated Cost" : "Estimated Proceeds"}</span>
                    <span className={`font-mono text-lg font-bold ${tradeAction === "BUY" ? "text-white" : "text-emerald-400"}`}>
                        ${estimatedCost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                    </span>
                </div>

                {/* Execute Button */}
                <button 
                    onClick={handleManualTrade}
                    disabled={isTrading || estimatedCost === 0}
                    className={`w-full py-4 mt-2 rounded-xl font-bold text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2
                    ${isTrading || estimatedCost === 0 ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50" 
                        : tradeAction === "BUY" ? "bg-emerald-500 text-dark-bg hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        : "bg-rose-500 text-white hover:bg-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    }
                    `}
                >
                    {isTrading ? (
                        <div className="w-6 h-6 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                    ) : (
                    `Execute ${tradeAction} Order`
                    )}
                </button>
            </div>
          </div>
      </motion.div>

      {/* ── Portfolio Holdings ──────────────────────────── */}
      <motion.div 
        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5"
      >
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Briefcase size={20} className="text-neon-cyan" />
          Portfolio Holdings
        </h3>
        
        {holdingEntries.length > 0 ? (
          <div className="overflow-auto rounded-lg">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Asset</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Quantity</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Price</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdingEntries.map(([symbol, qty]) => {
                  const price = assets[symbol]?.price || 0;
                  const value = price * qty;
                  const change = assets[symbol]?.change_24h || 0;
                  return (
                    <motion.tr 
                      key={symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-white text-sm">{symbol}</span>
                        <span className={`ml-2 text-[10px] font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-sm text-gray-300">{qty}</td>
                      <td className="py-3 px-3 font-mono text-sm text-gray-400">{formatCurrency(price)}</td>
                      <td className="py-3 px-3 font-mono text-sm text-white font-bold text-right">{formatCurrency(value)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center flex-col gap-2 border border-dashed border-white/10 rounded-xl">
            <Briefcase className="text-gray-600 w-8 h-8" />
            <p className="text-sm text-gray-500">No holdings yet. Make your first trade above!</p>
          </div>
        )}
      </motion.div>

      {/* ── Trade History ──────────────────────────── */}
      <motion.div 
        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5"
      >
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Clock size={20} className="text-neon-purple" />
          Trade History
        </h3>
        
        {tradeHistory.length > 0 ? (
          <div className="overflow-auto rounded-lg max-h-[400px] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="sticky top-0 bg-dark-bg/95 backdrop-blur z-10">
                <tr className="border-b border-white/10">
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Time</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Action</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Asset</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Qty</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">Price</th>
                  <th className="py-3 px-3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tradeHistory.map((trade) => (
                  <motion.tr 
                    key={trade.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-[11px] font-mono text-gray-500">{formatTime(trade.timestamp)}</td>
                    <td className="py-2.5 px-3 text-[11px] font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        trade.action === 'BUY' 
                          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                          : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                      }`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-bold text-white font-mono">{trade.symbol}</td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-300 font-mono">{trade.quantity}</td>
                    <td className="py-2.5 px-3 text-[11px] font-mono text-gray-400">{formatCurrency(trade.price)}</td>
                    <td className={`py-2.5 px-3 text-[11px] font-mono font-bold text-right ${
                      trade.action === 'BUY' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {trade.action === 'BUY' ? '-' : '+'}{formatCurrency(Math.abs(trade.cost || trade.price * trade.quantity))}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center flex-col gap-2 border border-dashed border-white/10 rounded-xl">
            <Clock className="text-gray-600 w-8 h-8" />
            <p className="text-sm text-gray-500">No trades yet. Your transaction history will appear here.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
