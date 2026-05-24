import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

export const FinalCTA = ({ onOpenAuth }: { onOpenAuth: (tab: 'login' | 'register') => void }) => {
  return (
    <section className="py-12 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[24px] overflow-hidden glass-panel border-primary/30 p-8 md:p-10 text-center bg-slate-950/20 backdrop-blur-xl"
        >
          {/* Animated Background Gradient inside card */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <Rocket className="w-6 h-6 text-primary-glow" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4 text-white tracking-tight">
              Join the Future of <span className="text-gradient">Learning</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-xl font-light">
              Become part of the most advanced academic ecosystem. Experience AI-powered notes, global collaboration, and intelligent study tools today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => onOpenAuth('register')}
                className="px-5 py-2.5 bg-primary hover:bg-primary-glow text-white font-bold rounded-lg text-xs md:text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] transform hover:-translate-y-0.5"
              >
                Join Beta
              </button>
              <button className="px-5 py-2.5 glass-panel text-white font-bold rounded-lg text-xs md:text-sm hover:bg-white/10 transition-all border border-white/20">
                Contact Team
              </button>
              <button className="px-5 py-2.5 glass-panel text-primary-glow font-bold rounded-lg text-xs md:text-sm hover:bg-primary/10 transition-all border border-primary/30">
                Become Campus Ambassador
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
