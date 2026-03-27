import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Settings, User, LogOut, ShieldCheck } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      toast.success("Successfully logged out.", { style: { background: '#12121A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
      navigate('/');
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  // The base dashboard route is /dashboard, mapped to Overview.
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", path: "/dashboard" },
    { icon: <Activity size={18} />, label: "Live Execution", path: "/dashboard/execution" },
    { icon: <User size={18} />, label: "Profile", path: "/dashboard/profile" },
    { icon: <Settings size={18} />, label: "Settings", path: "/dashboard/settings" },
  ];

  // Helper to generate initials from email or name
  const getInitials = () => {
    if (userProfile?.role === "admin") return "AI";
    if (userProfile?.displayName) {
        return userProfile.displayName.substring(0, 2).toUpperCase();
    }
    if (currentUser?.email) {
        return currentUser.email.substring(0, 2).toUpperCase();
    }
    return "UI";
  };

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
                  {getInitials()}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {userProfile?.displayName || "Institutional Acct"}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-neon-cyan mt-0.5">
                    <ShieldCheck size={12} />
                    <span className="truncate">{currentUser?.email}</span>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item, i) => (
                  <Link 
                    key={i} 
                    to={item.path} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                      ? "bg-neon-blue/10 text-neon-blue font-medium border border-neon-blue/20" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-12 pt-4 border-t border-white/10">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left">
                  <LogOut size={18} />
                  Secure Logout
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area - Rendered via Outlet */}
          <div className="flex-1">
             <Outlet />
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
