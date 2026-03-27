import { motion } from 'framer-motion';
import { Database, BrainCircuit, Activity, LineChart, MoveRight } from 'lucide-react';

const steps = [
  {
    icon: <Database className="w-8 h-8 text-neon-blue" />,
    title: "1. Data Ingestion",
    desc: "Aggregating alternative data globally. Petabytes per second."
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-neon-purple" />,
    title: "2. NLP & Deep Learning",
    desc: "Extracting signal from noise using transformer models."
  },
  {
    icon: <Activity className="w-8 h-8 text-neon-cyan" />,
    title: "3. Strategy Generation",
    desc: "Formulating risk-adjusted directional portfolios."
  },
  {
    icon: <LineChart className="w-8 h-8 leading-none" />,
    title: "4. Autonomous Execution",
    desc: "Algorithms slicing orders to minimize market impact."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden text-center bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            The <span className="text-gradient">Pipeline</span>
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
            A zero-human-intervention architecture spanning from information discovery to trade execution.
          </p>
        </motion.div>

        <div className="relative flex justify-center">
          
          <div className="hidden lg:block absolute top-[60px] w-full max-w-[80%] border-t-2 border-dashed border-dark-border opacity-50 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-10 w-full relative">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center bg-dark-bg/80 backdrop-blur-md p-6 rounded-2xl glass border border-white/5"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-6 relative">
                  {step.icon}
                  {/* Glowing orb accent */}
                  {idx === 3 && (
                    <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(0,240,255,0.4)] mix-blend-screen pointer-events-none"></div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold font-display text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">{step.desc}</p>
                
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
