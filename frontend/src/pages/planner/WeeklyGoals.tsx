import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export const WeeklyGoals = ({ goals }: { goals: any[] }) => {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" />
          Weekly Goals
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {goals.length === 0 ? (
          <div className="text-center text-slate-500 text-xs font-poppins">No weekly goals set.</div>
        ) : (
          goals.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-300 font-poppins">{item.goal}</span>
                <span className="text-[10px] text-slate-400 font-poppins font-semibold">{item.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${item.color || 'bg-primary'} rounded-full`}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
