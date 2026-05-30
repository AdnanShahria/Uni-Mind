import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const WelcomeHeader = ({ userName }: { userName: string }) => {
  return (
    <motion.div variants={fadeIn} className="mb-4 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold font-outfit text-white tracking-tight">
            Welcome back, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-poppins mt-0.5 sm:mt-1">
            Here's what's happening in your academic workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs text-slate-400 font-poppins">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
