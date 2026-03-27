import { motion } from 'framer-motion';
import { Cpu, Network, Zap, ShieldAlert } from 'lucide-react';

const concepts = [
  {
    icon: <Cpu className="w-8 h-8 text-neon-blue" />,
    title: "Deep Reinforcement Learning",
    description: "Our models continuously learn from market environments, adapting strategies in real-time to optimize risk-adjusted returns."
  },
  {
    icon: <Network className="w-8 h-8 text-neon-purple" />,
    title: "Neural Sentiment Analysis",
    description: "Processing millions of news articles, earnings calls, and social media posts milliseconds after publication to gauge market emotion."
  },
  {
    icon: <Zap className="w-8 h-8 text-neon-cyan" />,
    title: "High-Frequency Execution",
    description: "Proprietary low-latency infrastructure executing complex multi-leg trades faster than traditional human-operated desks."
  },
  {
    icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
    title: "Predictive Risk Modeling",
    description: "Simulating thousands of black-swan scenarios daily to construct portfolios resilient to unexpected macroeconomic shocks."
  }
];

export default function About() {
  return (
    <section id="about-ai" className="py-24 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-bold mb-6"
          >
            The Evolution of <span className="text-gradient">Investing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl text-gray-400 font-light"
          >
            We've removed human emotion from the equation. Nexus.AI is built on pure math, vast data processing, and predictive intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {concepts.map((concept, index) => (
            <motion.div
              key={concept.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-8 rounded-2xl hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 group"
            >
              <div className="mb-6 p-4 rounded-xl bg-dark-bg/50 inline-block border border-dark-border group-hover:border-neon-blue/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all">
                {concept.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-neon-cyan transition-colors">
                {concept.title}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors">
                {concept.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
