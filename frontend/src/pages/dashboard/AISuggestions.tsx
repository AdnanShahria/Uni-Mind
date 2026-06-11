import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

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
        <span className="text-[9px] text-primary-glow font-bold uppercase tracking-wider font-poppins bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          Smart
        </span>
      </div>
      <div className="p-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-poppins">No suggestions available.</div>
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
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-primary/25 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary-glow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-200 font-poppins leading-snug group-hover:text-white transition-colors">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-poppins mt-1 leading-relaxed">{item.reason}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="text-[11px] font-semibold text-primary-glow hover:text-white bg-primary/10 hover:bg-primary/25 px-3 py-1.5 rounded-lg transition-all font-poppins border border-primary/10 hover:border-primary/30">
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
