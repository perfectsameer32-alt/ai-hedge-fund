import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, BarChart2, TrendingUp, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock chart data generator
const generateChartData = () => {
  return Array.from({ length: 40 }).map((_, i) => 
    50 + Math.sin(i / 3) * 20 + Math.random() * 15
  );
};

export default function Dashboard() {
  const [data, setData] = useState(generateChartData());

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const lastVal = newData[newData.length - 1];
        newData.push(lastVal + (Math.random() - 0.5) * 8);
        return newData;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data);

  return (
    <section id="platform" className="py-24 relative overflow-hidden">
      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-dark-border to-transparent bottom-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold">
                Institutional Grade <span className="text-gradient">Interface</span>
              </h2>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Direct access to our proprietary execution algorithms. Visualize portfolio volatility, real-time capital allocation, and predictive modeling metrics with millisecond latency.
              </p>
              
              <ul className="space-y-4 pt-6">
                {[
                  "Real-time order book reconstruction",
                  "AI-driven portfolio rebalancing",
                  "Macro-economic indicator overlay",
                  "Risk metric visualization (VaR, Drawdown)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="p-1 rounded-full bg-neon-blue/20 text-neon-blue">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <button className="mt-8 px-6 py-3 rounded-xl border border-neon-blue/50 text-neon-blue hover:bg-neon-blue hover:text-dark-bg font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]">
                Request Platform Demo
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 perspective-1000"
          >
            {/* The Dashboard Mockup */}
            <div className="glass-panel p-6 rounded-3xl w-full h-[500px] flex flex-col relative overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-2xl bg-dark-bg/60">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 relative z-10">
                  <Activity className="w-6 h-6 text-neon-blue" />
                  <div>
                    <h4 className="text-white font-semibold">Nexus Alpha Fund</h4>
                    <p className="text-xs text-gray-400">Live Execution Environment</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Filter className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
                  <div className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    System Normal
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "AUM", val: "$1.24B", up: true },
                  { label: "Daily Alpha", val: "+0.42%", up: true },
                  { label: "Sharpe Ratio", val: "3.4", up: true }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-white font-mono">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="flex-1 relative border border-white/5 rounded-xl bg-dark-bg/40 p-4">
                <div className="absolute top-4 left-4 flex gap-2">
                  <BarChart2 className="w-5 h-5 text-gray-500" />
                  <TrendingUp className="w-5 h-5 text-neon-purple" />
                </div>
                
                {/* SVG Chart */}
                <svg className="w-full h-full pt-8" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="3"
                    points={data.map((val, i) => `${(i / (data.length - 1)) * 100}%, ${(1 - val / (maxValue * 1.2)) * 100}%`).join(' ')}
                    style={{ transition: 'all 1s linear' }}
                  />
                  {/* Fill gradient below line */}
                  <polygon
                    fill="url(#gradient)"
                    opacity="0.2"
                    points={`0,100% ${data.map((val, i) => `${(i / (data.length - 1)) * 100}%, ${(1 - val / (maxValue * 1.2)) * 100}%`).join(' ')} 100%,100%`}
                    style={{ transition: 'all 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
                      <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pt-12 pb-4 opacity-10">
                  <div className="w-full border-b border-white"></div>
                  <div className="w-full border-b border-white"></div>
                  <div className="w-full border-b border-white"></div>
                  <div className="w-full border-b border-white"></div>
                </div>
              </div>
              
              {/* Blur orb behind dashboard */}
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-purple/20 -translate-x-1/2 -translate-y-1/2 blur-[80px] -z-10 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
