import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Settings, User, LogOut, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

export default function ClientDashboard() {
  return (
    <PageTransition className="pt-24 pb-12 min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 flex-shrink-0"
          >
            <div className="glass-panel p-6 rounded-2xl sticky top-28 h-auto">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center font-bold text-dark-bg">
                  SK
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Institutional Acct</h3>
                  <p className="text-xs text-gray-400">ID: NXB-8432</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { icon: <LayoutDashboard size={18} />, label: "Overview", active: true },
                  { icon: <Activity size={18} />, label: "Live Execution" },
                  { icon: <User size={18} />, label: "Profile" },
                  { icon: <Settings size={18} />, label: "Settings" },
                ].map((item, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      item.active 
                      ? "bg-neon-blue/10 text-neon-blue font-medium border border-neon-blue/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-12 pt-4 border-t border-white/10">
                <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                  <LogOut size={18} />
                  Secure Logout
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-display font-bold text-white mb-2">Welcome Back, Partner</h1>
              <p className="text-gray-400 font-light">Your portfolio is currently being actively managed by 4 unique strategies.</p>
            </motion.div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Net Asset Value", value: "$42,150,000.00", change: "+1.2%", period: "Today" },
                { title: "Active Positions", value: "3,402", change: "+14", period: "Since open" },
                { title: "Sharpe Ratio (30D)", value: "2.84", change: "+0.1", period: "Week over week" }
              ].map((metric, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  key={i} 
                  className="glass p-6 rounded-xl border-l-[3px] border-l-neon-cyan"
                >
                  <p className="text-sm text-gray-400 mb-1 font-medium">{metric.title}</p>
                  <h3 className="text-2xl font-bold font-mono text-white mb-3">{metric.value}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      <ArrowUpRight size={12} className="mr-1" />
                      {metric.change}
                    </span>
                    <span className="text-gray-500">{metric.period}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart Placeholder Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-6 rounded-2xl h-96 flex items-center justify-center flex-col relative overflow-hidden"
            >
              <Activity className="w-12 h-12 text-gray-600 mb-4 animate-pulse" />
              <p className="text-gray-400 font-display">Initializing live performance terminal...</p>
              
              <div className="absolute bottom-0 w-full h-1 bg-dark-bg">
                <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple w-1/3 animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
