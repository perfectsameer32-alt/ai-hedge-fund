import { Hexagon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-bg text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-dark-border">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Hexagon className="w-6 h-6 text-neon-blue" />
              <span className="text-xl font-display font-bold text-white tracking-wide">
                NEXUS<span className="text-neon-cyan">.AI</span>
              </span>
            </div>
            <p className="text-sm font-light leading-relaxed mb-6">
              Autonomous intelligence driving smarter capital allocations in the digital age.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Neural Networks</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">High-Frequency Execution</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Risk Modeling</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Data Ingestion</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about-ai" className="hover:text-neon-purple transition-colors">About Us</a></li>
              <li><a href="#features" className="hover:text-neon-purple transition-colors">Platform</a></li>
              <li><a href="#founder" className="hover:text-neon-purple transition-colors">Founder</a></li>
              <li><a href="#" className="hover:text-neon-purple transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Regulatory Documentation</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-light">
          <p>&copy; {new Date().getFullYear()} Nexus.AI Capital Management. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <span>Built with precision.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
