import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, RefreshCw, WifiOff, Filter } from 'lucide-react';
import { fetchNews } from '../../api/client';

export default function NewsPanel() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Relative time helper
  const timeAgo = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  // Fetch news data
  const loadNews = useCallback(async () => {
    const newsRes = await fetchNews();
    if (newsRes.data?.news) {
      setNews(newsRes.data.news);
    }
    setIsOffline(newsRes.offline);
    setIsLoading(false);
  }, []);

  // Initial load + auto-refresh every 60 seconds
  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 60000);
    return () => clearInterval(interval);
  }, [loadNews]);

  // Filter logic
  const filters = ["All", "Crypto", "Stocks", "Bullish", "Bearish", "Neutral"];
  const filteredNews = news.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Bullish" || activeFilter === "Bearish" || activeFilter === "Neutral") {
      return item.sentiment === activeFilter;
    }
    // Category filter
    return item.category === activeFilter;
  });

  if (isLoading && news.length === 0) {
    return (
      <div className="glass-panel p-6 sm:p-8 rounded-2xl h-[80vh] flex items-center justify-center animate-pulse">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Connecting to global news feed...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg w-max">
          <WifiOff size={14} /> Backend offline — using cached news data
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <Newspaper className="text-neon-purple" size={28} /> 
            Live Global News
          </h2>
          <p className="text-gray-400 text-sm font-light">
            Real-time financial intelligence sorted by AI sentiment engines.
          </p>
        </div>
        <button
          onClick={loadNews}
          className="flex items-center gap-2 text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-3 py-1.5 rounded-lg hover:bg-neon-cyan/20 transition-colors w-max"
        >
          <RefreshCw size={12} /> Refresh Now
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              activeFilter === filter
                ? filter === "Bullish"
                  ? "bg-emerald-400/15 text-emerald-400 border-emerald-400/30"
                  : filter === "Bearish"
                  ? "bg-rose-400/15 text-rose-400 border-rose-400/30"
                  : "bg-neon-purple/15 text-neon-purple border-neon-purple/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <Filter size={10} className="inline mr-1.5 -mt-0.5" />
            {filter}
            {filter !== "All" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({filter === "Bullish" || filter === "Bearish" || filter === "Neutral"
                  ? news.filter(n => n.sentiment === filter).length
                  : news.filter(n => n.category === filter).length
                })
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length > 0 ? (
          filteredNews.map((item, idx) => (
            <motion.a
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              key={idx}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    item.sentiment === 'Bullish' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                    item.sentiment === 'Bearish' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                    'border-gray-500/30 text-gray-400 bg-gray-500/10'
                  }`}>
                    {item.sentiment}
                  </span>
                  <span className="text-xs text-gray-500">{timeAgo(item.date)}</span>
                </div>
                
                <h3 className="text-base font-medium text-white mb-2 group-hover:text-neon-cyan transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-400 italic font-light mb-4 line-clamp-2 border-l-2 border-neon-purple/30 pl-3">
                  {item.explanation}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mt-2 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-dark-bg px-2 py-1 rounded">{item.source || 'News API'}</span>
                  {item.category && (
                    <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{item.category}</span>
                  )}
                </div>
                <ExternalLink size={14} className="group-hover:text-neon-cyan transition-colors" />
              </div>
            </motion.a>
          ))
        ) : (
          <div className="col-span-full h-40 flex items-center justify-center flex-col gap-3 text-center border border-dashed border-white/10 rounded-2xl">
            <Newspaper className="text-gray-600 w-8 h-8 mb-1" />
            <p className="text-sm text-gray-500">
              {activeFilter !== "All" 
                ? `No ${activeFilter.toLowerCase()} news found. Try a different filter.`
                : "No active news feeds found at this time."
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
