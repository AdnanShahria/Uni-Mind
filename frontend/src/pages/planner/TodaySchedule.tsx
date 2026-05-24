import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

export const TodaySchedule = ({ displayTasks }: { displayTasks: any[] }) => {
  return (
    <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          Today's Schedule
        </h3>
        <span className="text-[10px] text-slate-500 font-poppins">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {displayTasks.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm font-poppins">No tasks scheduled for today.</div>
        ) : (
          displayTasks.map((task, i) => (
            <motion.div
              key={task.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <button className="shrink-0">
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : task.status === 'in-progress' ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium font-poppins ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {task.title}
                </p>
                <p className="text-[11px] text-slate-500 font-poppins mt-0.5">{task.time}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.priority === 'high' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                <span className={`text-[10px] font-medium font-poppins px-2 py-0.5 rounded-md ${
                  task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                  task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-white/[0.04] text-slate-500'
                }`}>
                  {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
