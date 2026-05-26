import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle, AlertTriangle, Target, Mountain, MoreVertical, Pencil, Trash2 } from 'lucide-react';

export const TodaySchedule = ({ 
  displayTasks, 
  weeklyGoals, 
  longTermGoals, 
  selectedDate = new Date(), 
  onTaskToggle,
  onEdit,
  onDelete
}: { 
  displayTasks: any[], 
  weeklyGoals?: any[], 
  longTermGoals?: any[], 
  selectedDate?: Date, 
  onTaskToggle?: (taskId: string, currentStatus: string) => void,
  onEdit?: (task: any) => void,
  onDelete?: (id: string, type: 'task' | 'weekly' | 'long-term') => void
}) => {
  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const dateLabel = isToday ? "Today's Schedule" : `Schedule`;
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  return (
    <div className={`lg:col-span-2 rounded-2xl glass-card transition-all ${activeMenuId ? 'relative z-50' : 'relative z-10'}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          {dateLabel}
        </h3>
        <span className="text-[10px] text-slate-500 font-poppins">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {displayTasks.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm font-poppins">No tasks scheduled for this day.</div>
        ) : (
          displayTasks.map((task, i) => {
            const linkedWG = weeklyGoals?.find(wg => wg.id === task.weekly_goal_id);
            const linkedLTG = longTermGoals?.find(ltg => ltg.id === task.long_term_goal_id);
            
            return (
              <motion.div
                key={task.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group relative overflow-visible transition-all ${activeMenuId === task.id ? 'z-30' : 'z-10'}`}
              >
                {/* Completion glow effect */}
                {task.status === 'done' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 0.1, scale: 1 }} 
                    className="absolute inset-0 bg-emerald-500/20 z-0 pointer-events-none"
                  />
                )}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(onTaskToggle) onTaskToggle(task.id, task.status);
                  }}
                  className="shrink-0 relative z-10 hover:scale-110 active:scale-95 transition-transform"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  ) : task.status === 'in-progress' ? (
                    <Circle className="w-5 h-5 text-blue-400 fill-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse-slow" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 group-hover:text-emerald-500/50 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0 relative z-10 pr-6">
                  <p className={`text-[13px] font-medium font-poppins transition-all ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-[11px] text-slate-500 font-poppins">{task.time}</p>
                    {linkedWG && (
                      <span className="text-[9px] flex items-center gap-1 text-rose-400/80 bg-rose-500/10 px-1.5 py-0.5 rounded-md font-poppins">
                        <Target className="w-2.5 h-2.5" />
                        {linkedWG.goal || linkedWG.title}
                      </span>
                    )}
                    {linkedLTG && (
                      <span className="text-[9px] flex items-center gap-1 text-purple-400/80 bg-purple-500/10 px-1.5 py-0.5 rounded-md font-poppins">
                        <Mountain className="w-2.5 h-2.5" />
                        {linkedLTG.title}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status Badge & Priority */}
                <div className="flex items-center gap-2 shrink-0 relative z-10 mr-6">
                  {task.priority === 'high' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-[10px] font-medium font-poppins px-2 py-0.5 rounded-md transition-colors ${
                    task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                    task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-white/[0.04] text-slate-500'
                  }`}>
                    {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>

                {/* 3-Dot Action Menu */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === task.id ? null : task.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === task.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-8 w-28 bg-[#0f172a]/95 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-xl py-1 z-40 font-poppins">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) onEdit(task);
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
                            if (onDelete) onDelete(task.id, 'task');
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
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
