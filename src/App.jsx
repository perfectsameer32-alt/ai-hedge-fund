import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import ClientDashboard from './pages/ClientDashboard';

function App() {
  const location = useLocation();

  const isPortal = location.pathname === '/access' || location.pathname === '/dashboard';

  return (
    <div className="relative min-h-screen bg-dark-bg text-white selection:bg-neon-cyan/30 selection:text-white flex flex-col font-sans">
      <CustomCursor />
      <BackgroundEffects />
      
      {!isPortal && <Navbar />}

      <main className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/founder" element={<FounderPage />} />
            <Route path="/access" element={<AccessPortal />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isPortal && <Footer />}
    </div>
  );
}

export default App;
