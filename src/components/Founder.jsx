import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export default function Founder() {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation between -10 and 10 degrees based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXVal = ((y - centerY) / centerY) * -10;
    const rotateYVal = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section id="founder" className="py-32 relative overflow-hidden bg-dark-bg/80">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-neon-blue/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
             The <span className="text-gradient">Architect</span>
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
            Bridging the gap between deep learning and modern finance.
          </p>
        </motion.div>

        {/* Founder Card with 3D Tilt Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="perspective-1000 w-full max-w-sm"
        >
          <motion.div
            className="glass-panel p-8 rounded-3xl relative preserve-3d cursor-crosshair border border-white/10 overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)' 
            }}
          >
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
            
            <div className="flex flex-col items-center translate-z-10 z-10 relative">
              {/* Avatar Ring */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full absolute -inset-2 bg-gradient-to-tr from-neon-blue to-neon-purple opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                <div className="w-32 h-32 rounded-full border border-white/20 p-1 relative z-10 bg-dark-bg/80 backdrop-blur-sm shadow-xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                    <img 
                      src="/founder.png" 
                      alt="Sameer Kumar" 
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center w-full h-full">
                      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                      <span className="text-4xl font-display font-bold text-white tracking-tighter opacity-80 backdrop-blur-sm z-10">
                        SK
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-white tracking-wide mb-1">
                Sameer Kumar
              </h3>
              <p className="text-neon-cyan text-sm font-semibold tracking-widest uppercase mb-6">
                Founder & CEO
              </p>

              <p className="text-center text-gray-300 text-sm leading-relaxed mb-8 font-light">
                Building the future of AI-driven capital markets. Passionate about technology, finance, and intelligent systems.
              </p>

              <div className="flex items-center gap-4 mb-8">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-blue hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-purple hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                  <TwitterIcon className="w-4 h-4" />
                </a>
              </div>

              <button className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2 group/btn">
                Follow Journey
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
