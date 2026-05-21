import { motion } from 'framer-motion';

export const FutureVision = () => {
  return (
    <section className="py-32 relative z-10 overflow-hidden text-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold font-outfit mb-8"
        >
          Building the <span className="text-gradient">Future of Education</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-300 leading-relaxed mb-12"
        >
          We are not just creating another app. We are building an intelligent, interconnected global ecosystem where AI-powered universities, smart learning tools, and global researcher networks merge to accelerate human knowledge.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-10 py-5 bg-white text-slate-900 font-bold rounded-xl text-lg hover:bg-slate-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Join the Next Generation
          </button>
          <button className="px-10 py-5 glass-panel text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-colors border border-white/20">
            Explore Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};
