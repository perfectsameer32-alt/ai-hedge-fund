import { motion } from 'framer-motion';
import { Menu, X, Hexagon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About AI', path: '/about' },
  { name: 'Features', path: '/features' },
  { name: 'Platform', path: '/platform' },
  { name: 'Founder', path: '/founder' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 left-0 border-b border-dark-border bg-dark-bg/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Hexagon className="w-8 h-8 text-neon-blue" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-display font-bold text-white tracking-wide"
            >
              NEXUS<span className="text-neon-cyan">.AI</span>
            </motion.span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:text-white hover:text-shadow-neon transition-all duration-300 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link to="/access">
                  <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-dark-bg font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
                    Access Portal
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-dark-bg border-b border-dark-border"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-card"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/access"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neon-cyan hover:text-white hover:bg-dark-card"
            >
              Access Portal
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
