import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mountain, MoreVertical, Pencil, Trash2, Clock } from 'lucide-react';

export const LongTermGoals = ({ 
  longTermGoals,
  tasks = [],
  weeklyGoals = [],
  onEdit,
  onDelete
}: { 
  longTermGoals: any[],
  tasks?: any[],
  weeklyGoals?: any[],
  onEdit?: (ltg: any) => void,
  onDelete?: (id: string, type: 'task' | 'weekly' | 'long-term') => void
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Helper to find all direct and indirect tasks linked to a Long Term Goal
  const getLtgTasks = (ltgId: string) => {
    const linkedWgIds = weeklyGoals.filter(wg => wg.long_term_goal_id === ltgId).map(wg => wg.id);
    return tasks.filter(t => t.long_term_goal_id === ltgId || (t.weekly_goal_id && linkedWgIds.includes(t.weekly_goal_id)));
  };

  // Helper to format timespan of tasks linked to LTG
  const formatTimespan = (ltgId: string) => {
    const ltgTasks = getLtgTasks(ltgId);
    if (ltgTasks.length === 0) return 'No tasks scheduled';

    const dates = ltgTasks.map(t => new Date(t.date).getTime()).sort((a, b) => a - b);
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (start.toDateString() === end.toDateString()) {
      return fmt(start);
    }
    return `${fmt(start)} - ${fmt(end)}`;
  };

  // Helper to calculate total hours for LTG tasks
  const getLtgHours = (ltgId: string) => {
    const ltgTasks = getLtgTasks(ltgId);
    return ltgTasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
  };

  return (
    <div className={`rounded-2xl glass-card transition-all ${activeMenuId ? 'relative z-50' : 'relative z-10'} mt-6 lg:mt-0`}>
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Mountain className="w-4 h-4 text-purple-400" />
          Long-Term Goals
        </h3>
      </div>
      <div className="p-4 space-y-5">
        {longTermGoals.length === 0 ? (
          <div className="text-center text-slate-500 text-xs font-poppins">No long-term goals set.</div>
        ) : (
          longTermGoals.map((item, i) => {
            const timespanText = formatTimespan(item.id);
            const totalHours = getLtgHours(item.id);

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`relative group overflow-visible transition-all ${activeMenuId === item.id ? 'z-30' : 'z-10'}`}
              >
                <div className="flex items-center justify-between mb-0.5 pr-8">
                  <span className="text-sm text-slate-200 font-poppins font-medium">{item.title}</span>
                  <span className="text-xs text-purple-400 font-poppins font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">{item.progress || 0}%</span>
                </div>

                {/* Timespan Calculation Row */}
                <div className="flex items-center gap-1.5 mt-0.5 mb-2.5 text-[9px] text-slate-400 font-poppins">
                  <Clock className="w-3 h-3 text-purple-400/80 shrink-0" />
                  <span>Timespan: {timespanText}</span>
                  {totalHours > 0 && (
                    <>
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-purple-400/90 font-bold bg-purple-500/10 px-1 rounded">{totalHours} hrs est.</span>
                    </>
                  )}
                </div>

                {/* 3-Dot Action Menu */}
                <div className="absolute right-0 top-0 z-20 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === item.id ? null : item.id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === item.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-7 w-28 bg-[#0f172a]/95 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-xl py-1 z-40 font-poppins">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) onEdit(item);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-2"
                        >
                          <Pencil className="w-3 h-3 text-primary-400" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete(item.id, 'long-term');
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative w-full h-3 bg-[#0f172a]/50 border border-white/[0.04] rounded-full overflow-hidden shadow-inner">
                  {/* Glow effect for progress bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress || 0}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 1, type: 'spring' }}
                    className={`relative h-full ${item.color || 'bg-gradient-to-r from-purple-500 to-indigo-500'} rounded-full`}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
