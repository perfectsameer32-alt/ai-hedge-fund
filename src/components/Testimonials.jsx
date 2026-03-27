import { motion } from 'framer-motion';

const statements = [
  {
    quote: "The speed at which the neural networks adapt to macro volatility events is frankly unprecedented in traditional algorithmic trading circles.",
    author: "Global Fintech Journal",
    role: "Editorial Review"
  },
  {
    quote: "Combining multi-agent reinforcement learning with hard mathematical risk-limits represents the frontier of institutional capital management.",
    author: "Quantitative Horizon",
    role: "Industry Analysis"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden bg-dark-bg/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-medium text-gray-300"
          >
            Recognized by <span className="text-white font-bold">Industry Leaders</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {statements.map((stmt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="p-8 border border-dark-border bg-dark-card rounded-2xl relative"
            >
              <div className="absolute top-4 left-4 text-neon-blue/20 text-6xl font-serif">"</div>
              <p className="text-lg text-gray-300 italic mb-6 relative z-10 font-light">
                {stmt.quote}
              </p>
              <div>
                <p className="text-white font-semibold">{stmt.author}</p>
                <p className="text-neon-purple text-sm">{stmt.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
