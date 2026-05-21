
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden glass-panel border-primary/30 p-12 md:p-20 text-center"
        >
          {/* Animated Background Gradient inside card */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
              <Rocket className="w-8 h-8 text-primary-glow" />
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold font-outfit mb-6 text-white">
              Join the Future of <span className="text-gradient">Learning</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl">
              Become part of the most advanced academic ecosystem. Experience AI-powered notes, global collaboration, and intelligent study tools today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <button className="px-8 py-4 bg-primary hover:bg-primary-glow text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-1">
                Join Beta
              </button>
              <button className="px-8 py-4 glass-panel text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-all border border-white/20">
                Contact Team
              </button>
              <button className="px-8 py-4 glass-panel text-primary-glow font-bold rounded-xl text-lg hover:bg-primary/10 transition-all border border-primary/30">
                Become Campus Ambassador
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
