import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import BackgroundEffects from './components/BackgroundEffects';

import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PlatformPage from './pages/PlatformPage';
import FounderPage from './pages/FounderPage';
import AccessPortal from './pages/AccessPortal';
import Signup from './pages/Signup';
import ClientDashboard from './pages/ClientDashboard';

import Overview from './pages/dashboard/Overview';
import LiveExecution from './pages/dashboard/LiveExecution';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';

import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/access" />;
  return children;
};

function AppContent() {
  const location = useLocation();
  const isPortal = location.pathname === '/access' || location.pathname === '/signup' || location.pathname.startsWith('/dashboard');

  return (
    <div className="relative min-h-screen bg-dark-bg text-white selection:bg-neon-cyan/30 selection:text-white flex flex-col font-sans">
      <CustomCursor />
      <BackgroundEffects />
      
      {/* Global Toaster for notifications */}
      <Toaster position="top-right" />

      {!isPortal && <Navbar />}

      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/founder" element={<FounderPage />} />
            <Route path="/access" element={<AccessPortal />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }>
               {/* Nested Routes rendered inside ClientDashboard Outlet */}
               <Route index element={<Overview />} />
               <Route path="execution" element={<LiveExecution />} />
               <Route path="profile" element={<Profile />} />
               <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>

      {!isPortal && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
