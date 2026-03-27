import { motion } from 'framer-motion';
import { Database, ShieldCheck, Activity, Brain, Server, Fingerprint } from 'lucide-react';

const coreFeatures = [
  {
    icon: <Database className="w-10 h-10 mb-4 text-neon-cyan" />,
    title: "Alternative Data Lakes",
    description: "Ingesting terabytes of satellite imagery, credit card metrics, and supply chain data daily to secure an informational edge."
  },
  {
    icon: <ShieldCheck className="w-10 h-10 mb-4 text-emerald-400" />,
    title: "Quantum Encryption",
    description: "Our proprietary strategies and client data are secured using next-generation cryptographic models."
  },
  {
    icon: <Activity className="w-10 h-10 mb-4 text-neon-blue" />,
    title: "Market Microstructure",
    description: "Exploiting order book imbalances at the microscopic level for fractional but consistent spread capture."
  },
  {
    icon: <Brain className="w-10 h-10 mb-4 text-neon-purple" />,
    title: "LLM-Powered Analysis",
    description: "Custom fine-tuned large language models drafting research reports and analyzing central bank transcripts."
  },
  {
    icon: <Server className="w-10 h-10 mb-4 text-amber-400" />,
    title: "Distributed Computing",
    description: "A globally dispersed web of computational power ensuring zero-downtime strategy execution."
  },
  {
    icon: <Fingerprint className="w-10 h-10 mb-4 text-rose-400" />,
    title: "Biometric Authentication",
    description: "Institutional-grade secure portal requiring multi-factor biometrics for parameter adjustments."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-dark-bg/50">
      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-dark-border to-transparent top-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            System <span className="text-gradient">Capabilities</span>
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
            The technological foundation allowing us to outpace legacy hedge funds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-2xl relative group overflow-hidden"
            >
              {/* Hover gradient effect inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              <div className="relative z-10">
                {feature.icon}
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 font-light text-sm leading-relaxed max-w-[90%]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
