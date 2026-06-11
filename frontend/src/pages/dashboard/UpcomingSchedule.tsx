import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const UpcomingSchedule = ({ upcomingTasks }: { upcomingTasks: any[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          Upcoming
        </h3>
        <button
          onClick={() => navigate('/app/planner')}
          className="text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins flex items-center gap-1 transition-colors"
        >
          Planner <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-1">
        {upcomingTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-poppins">No upcoming tasks.</div>
        ) : (
          upcomingTasks.map((task, i) => (
            <motion.div
              key={task.id || i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              onClick={() => navigate('/app/planner')}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${task.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-200 font-poppins truncate group-hover:text-white transition-colors">{task.title}</p>
              </div>
              <span className="text-[11px] text-slate-500 font-poppins shrink-0 tabular-nums">{task.date}</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
