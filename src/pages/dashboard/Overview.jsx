import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, Brain, WifiOff, RefreshCw, Newspaper, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchPortfolio, fetchAllSignals, fetchAssetDetail, fetchNews } from '../../api/client';

export default function Overview() {
  const { userProfile } = useAuth();

  // ── State ───────────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState(null);
  const [topSignal, setTopSignal] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [news, setNews] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartSymbol, setChartSymbol] = useState("AAPL");

  // ── Fetch all dashboard data ────────────────────────────────
  const loadData = useCallback(async () => {
    // Fetch portfolio
    const portfolioRes = await fetchPortfolio();
    if (portfolioRes.data) {
      setPortfolio(portfolioRes.data);
    }
    setIsOffline(portfolioRes.offline);

    // Fetch AI signals and pick the highest-confidence one
    const signalsRes = await fetchAllSignals();
    if (signalsRes.data?.signals?.length > 0) {
      const sorted = [...signalsRes.data.signals].sort((a, b) => b.confidence - a.confidence);
      setTopSignal(sorted[0]);
    }

    setIsLoading(false);
  }, []);

  // ── Fetch chart history & news for selected symbol ──────────
  const loadChartAndNews = useCallback(async () => {
    const res = await fetchAssetDetail(chartSymbol);
    if (res.data?.history?.length > 0) {
      setChartData(
        res.data.history.map((d) => ({
          date: d.date.slice(5), // "MM-DD"
          close: d.close,
        }))
      );
    }

    const newsRes = await fetchNews(chartSymbol);
    if (newsRes.data?.news) {
      setNews(newsRes.data.news);
    }
  }, [chartSymbol]);

  // ── Initial load + auto-refresh every 5 seconds ─────────────
  useEffect(() => {
    loadData();
    loadChartAndNews();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData, loadChartAndNews]);

  // Reload chart & news when symbol changes
  useEffect(() => {
    loadChartAndNews();
  }, [chartSymbol, loadChartAndNews]);

  // ── Helpers ─────────────────────────────────────────────────
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const pnlIsPositive = portfolio ? portfolio.total_pnl >= 0 : true;

  const signalColor = {
    BUY: "text-emerald-400",
    SELL: "text-rose-400",
    HOLD: "text-amber-400",
  };

  const signalBg = {
    BUY: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    SELL: "bg-rose-400/10 border-rose-400/20 text-rose-400",
    HOLD: "bg-amber-400/10 border-amber-400/20 text-amber-400",
  };

  // ── Skeleton loader ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-white/5 rounded-lg" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass p-6 rounded-xl h-28" />
          ))}
        </div>
        <div className="glass-panel p-6 rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-xl"
        >
          <WifiOff size={16} />
          Backend offline — showing cached data. Start the backend with <code className="font-mono bg-dark-bg px-1.5 py-0.5 rounded text-xs">uvicorn main:app --reload</code>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Welcome Back, {userProfile?.displayName || "Partner"}
        </h1>
        <p className="text-gray-400 font-light">
          Your portfolio is being actively managed across {portfolio?.active_positions || 0} positions.
        </p>
      </motion.div>

      {/* ── Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Net Asset Value",
            value: formatCurrency(portfolio?.nav || 0),
            change: `${pnlIsPositive ? "+" : ""}${(portfolio?.total_pnl_pct || 0).toFixed(2)}%`,
            period: "All time",
            positive: pnlIsPositive,
          },
          {
            title: "Active Positions",
            value: portfolio?.active_positions || 0,
            change: `${portfolio?.positions?.length || 0} assets`,
            period: "Currently held",
            positive: true,
          },
          {
            title: "Sharpe Ratio (30D)",
            value: portfolio?.sharpe_ratio || 0,
            change: portfolio?.sharpe_ratio > 2 ? "Excellent" : "Good",
            period: "Risk-adjusted",
            positive: (portfolio?.sharpe_ratio || 0) > 1.5,
          },
          {
            title: "Top AI Signal",
            value: topSignal ? `${topSignal.signal}` : "—",
            change: topSignal ? `${topSignal.confidence}% confidence` : "",
            period: topSignal ? topSignal.symbol : "",
            positive: topSignal?.signal === "BUY",
            isSignal: true,
          },
        ].map((metric, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            key={i}
            className="glass p-6 rounded-xl border-l-[3px] border-l-neon-cyan relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm text-gray-400 mb-1 font-medium relative z-10">{metric.title}</p>
            <h3 className={`text-2xl font-bold font-mono mb-3 relative z-10 ${
              metric.isSignal
                ? signalColor[metric.value] || "text-white"
                : "text-white"
            }`}>
              {metric.isSignal && topSignal && <Brain size={18} className="inline mr-2 mb-1" />}
              {metric.value}
            </h3>
            <div className="flex items-center gap-2 text-xs relative z-10">
              <span className={`flex items-center ${
                metric.positive ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
              } px-2 py-0.5 rounded-full`}>
                {metric.positive
                  ? <ArrowUpRight size={12} className="mr-1" />
                  : <ArrowDownRight size={12} className="mr-1" />
                }
                {metric.change}
              </span>
              <span className="text-gray-500">{metric.period}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Dashboard Details Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Chart & AI Explanation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Price History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="text-neon-cyan" size={20} />
                Price History — {chartSymbol}
              </h3>
              <div className="flex gap-2">
                {["AAPL", "TSLA", "BTC", "ETH", "NVDA"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setChartSymbol(sym)}
                    className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
                      chartSymbol === sym
                        ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full h-full min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={['dataMin - 5', 'dataMax + 5']}
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                      tickFormatter={(val) =>
                        val > 10000 ? `$${(val / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#12121A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#00f0ff' }}
                      formatter={(value) => [formatCurrency(value), "Close"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#00f0ff"
                      strokeWidth={2}
                      fill="url(#chartGradient)"
                      dot={false}
                      activeDot={{ r: 6, fill: '#00f0ff', stroke: '#12121A', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center flex-col gap-3">
                  <RefreshCw className="w-8 h-8 text-gray-600 animate-spin" />
                  <p className="text-gray-500 text-sm">Loading price history...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Explanation Insight Box */}
          {topSignal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl border flex gap-4 ${signalBg[topSignal.signal] || 'bg-white/5 border-white/10'}`}
            >
              <div className="mt-1">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  AI Intelligence Report
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {topSignal.symbol}
                  </span>
                </h3>
                <p className="text-sm opacity-90 leading-relaxed font-light">
                  {topSignal.explanation || "No explanation available from the intelligence engine."}
                </p>
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: News Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 rounded-2xl flex flex-col h-[525px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Newspaper className="text-neon-purple" size={20} />
              News Feed — {chartSymbol}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {news.length > 0 ? (
              news.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <h4 className="text-sm font-medium text-gray-200 mb-2 group-hover:text-neon-cyan transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))
            ) : (
              <div className="h-full flex items-center justify-center flex-col gap-3 text-center">
                <Newspaper className="text-gray-600 w-10 h-10 mb-2" />
                <p className="text-sm text-gray-500">No recent news found for {chartSymbol}.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </>
  );
}
