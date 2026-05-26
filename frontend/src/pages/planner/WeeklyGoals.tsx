import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Layers, MoreVertical, Pencil, Trash2, Clock, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export const WeeklyGoals = ({ 
  goals, 
  longTermGoals,
  tasks = [],
  selectedDate = new Date(),
  onEdit,
  onDelete,
  onAIRebalance
}: { 
  goals: any[], 
  longTermGoals?: any[],
  tasks?: any[],
  selectedDate?: Date,
  onEdit?: (wg: any) => void,
  onDelete?: (id: string, type: 'task' | 'weekly' | 'long-term') => void,
  onAIRebalance?: () => void
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [viewSection, setViewSection] = useState<'all' | 'active-week'>('all');

  // Calculate Monday of the selected week
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(selectedDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Filter tasks for this week
  const thisWeekTasks = tasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate >= startOfWeek && taskDate <= new Date(endOfWeek.getTime() + 86400000);
  });

  const totalTasksForWeek = thisWeekTasks.length;
  const totalHoursForWeek = thisWeekTasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);

  // Helper to format task timespan range
  const formatTimespan = (wgId: string) => {
    const linkedTasks = tasks.filter(t => t.weekly_goal_id === wgId);
    if (linkedTasks.length === 0) return 'No tasks scheduled';

    const dates = linkedTasks.map(t => new Date(t.date).getTime()).sort((a, b) => a - b);
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (start.toDateString() === end.toDateString()) {
      return fmt(start);
    }
    return `${fmt(start)} - ${fmt(end)}`;
  };

  // Helper to get total hours for a weekly goal
  const getWeeklyGoalHours = (wgId: string) => {
    return tasks
      .filter(t => t.weekly_goal_id === wgId)
      .reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
  };

  const handleClearCompleted = async () => {
    const confirm = window.confirm("Are you sure you want to clear all completed goals?");
    if (!confirm) return;
    const completedGoals = goals.filter(wg => {
      const progressPct = wg.target_segments > 0 
        ? Math.round((wg.completed_segments / wg.target_segments) * 100) 
        : wg.progress || 0;
      return progressPct >= 100;
    });

    for (const wg of completedGoals) {
      await supabase.from('weekly_goals').delete().eq('id', wg.id);
    }
    window.location.reload(); // Refresh to sync
  };

  // Filter goals depending on view section selected
  const displayedGoals = viewSection === 'all' 
    ? goals 
    : goals.filter(wg => {
        // If weekly goals are tied to a date or tasks this week, show them in Active Week
        const goalTasks = tasks.filter(t => t.weekly_goal_id === wg.id);
        if (goalTasks.length === 0) return false;
        return goalTasks.some(t => {
          const taskDate = new Date(t.date);
          return taskDate >= startOfWeek && taskDate <= new Date(endOfWeek.getTime() + 86400000);
        });
      });

  return (
    <div className={`rounded-2xl glass-card transition-all ${activeMenuId || headerMenuOpen ? 'relative z-50' : 'relative z-10'}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between relative">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" />
          Weekly Goals
        </h3>
        
        {/* Card Level 3-Dot Action Menu */}
        <div className="flex items-center gap-2 relative z-20">
          <button
            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
          
          {headerMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setHeaderMenuOpen(false)} />
              <div className="absolute right-0 top-7 w-48 bg-[#0f172a]/95 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-xl py-1 z-40 font-poppins">
                <button
                  onClick={() => { setHeaderMenuOpen(false); if (onAIRebalance) onAIRebalance(); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  AI Optimize Week
                </button>
                <button
                  onClick={() => { setHeaderMenuOpen(false); handleClearCompleted(); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05] transition-colors flex items-center gap-2"
                >
                  Clear Completed Goals
                </button>
                <button
                  onClick={() => { setHeaderMenuOpen(false); setViewSection(viewSection === 'all' ? 'active-week' : 'all'); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05] transition-colors flex items-center gap-2 border-t border-white/[0.04]"
                >
                  Toggle: {viewSection === 'all' ? 'Active Week Plan' : 'All Goals'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sections & Filters */}
      <div className="px-5 py-2.5 bg-white/[0.01] border-b border-white/[0.04] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            {viewSection === 'all' ? 'All Weekly Goals' : 'Active Week Plan'}
          </span>
          <div className="flex items-center gap-1 bg-rose-500/5 border border-rose-500/10 rounded-lg px-2 py-0.5 text-[9px] text-rose-400 font-medium">
             <CalendarIcon className="w-3 h-3 text-rose-400/80" />
             Week of: {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        {/* Weekly Stats Sub-section */}
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <div className="bg-slate-950/40 border border-white/[0.03] p-1.5 rounded-xl text-center">
            <p className="text-[8px] text-slate-500 font-bold uppercase font-poppins tracking-wider">Week Tasks</p>
            <p className="text-xs font-extrabold text-slate-200 mt-0.5">{totalTasksForWeek}</p>
          </div>
          <div className="bg-slate-950/40 border border-white/[0.03] p-1.5 rounded-xl text-center">
            <p className="text-[8px] text-slate-500 font-bold uppercase font-poppins tracking-wider">Est. Hours</p>
            <p className="text-xs font-extrabold text-rose-400 mt-0.5">{totalHoursForWeek} hrs</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-4 space-y-4">
        {displayedGoals.length === 0 ? (
          <div className="text-center text-slate-500 text-xs font-poppins py-4">No goals found for this view.</div>
        ) : (
          displayedGoals.map((item, i) => {
            const progressPct = item.target_segments > 0 
              ? Math.round((item.completed_segments / item.target_segments) * 100) 
              : item.progress || 0;
            const linkedLTG = longTermGoals?.find(ltg => ltg.id === item.long_term_goal_id);
            const timespanText = formatTimespan(item.id);
            const goalHours = getWeeklyGoalHours(item.id);

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`group relative overflow-visible transition-all ${activeMenuId === item.id ? 'z-30' : 'z-10'}`}
              >
                <div className="flex items-start justify-between mb-1 pr-8">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-slate-200 font-poppins font-medium leading-tight">{item.goal || item.title}</span>
                    {linkedLTG && (
                      <span className="text-[9px] text-purple-400/80 font-poppins flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        Part of: {linkedLTG.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[11px] text-rose-400 font-poppins font-bold">{progressPct}%</span>
                    {(item.target_segments > 0) && (
                      <span className="text-[8px] text-slate-500 font-poppins bg-white/[0.03] px-1 rounded">
                        {item.completed_segments}/{item.target_segments} segments
                      </span>
                    )}
                  </div>
                </div>

                {/* Timespan Calculation Row */}
                <div className="flex items-center gap-1.5 mt-0.5 mb-2 text-[9px] text-slate-400 font-poppins">
                  <Clock className="w-3 h-3 text-rose-400/80 shrink-0" />
                  <span>Timespan: {timespanText}</span>
                  {goalHours > 0 && (
                    <>
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-rose-400/90 font-bold bg-rose-500/10 px-1 rounded">{goalHours} hrs est.</span>
                    </>
                  )}
                </div>

                {/* 3-Dot Row-Level Menu */}
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
                            if (onDelete) onDelete(item.id, 'weekly');
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

                <div className="relative w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className={`absolute inset-y-0 left-0 ${item.color || 'bg-rose-500'} rounded-full group-hover:brightness-110 transition-all`}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
