import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Map string icon names from DB to actual lucide components
const iconMap: Record<string, any> = {
  BookOpen,
  Zap,
  Users
};

export const AISuggestions = ({ suggestions }: { suggestions: any[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl bg-gradient-to-br from-primary/[0.06] via-secondary/[0.04] to-accent/[0.04] border border-primary/[0.12] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-glow" />
          AI Suggestions
        </h3>
        <span className="text-[9px] text-primary-glow font-bold uppercase tracking-wider font-poppins bg-primary/10 px-2 py-0.5 rounded-full">
          Smart
        </span>
      </div>
      <div className="p-3 space-y-2">
        {suggestions.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-poppins">No suggestions available.</div>
        ) : (
          suggestions.map((item, i) => {
            const Icon = iconMap[item.icon] || Sparkles;
            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => navigate(item.path)}
                className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-glow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-slate-200 font-poppins leading-snug">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-poppins mt-0.5">{item.reason}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-[10px] font-semibold text-primary-glow hover:text-white bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors font-poppins">
                    {item.action}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
