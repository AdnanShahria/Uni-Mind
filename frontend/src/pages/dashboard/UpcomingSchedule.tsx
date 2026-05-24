import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
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
      className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          Upcoming
        </h3>
        <button 
          onClick={() => navigate('/app/planner')}
          className="text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins transition-colors"
        >
          Planner
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        {upcomingTasks.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-poppins">No upcoming tasks.</div>
        ) : (
          upcomingTasks.map((task, i) => (
            <motion.div
              key={task.id || i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              onClick={() => navigate('/app/planner')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full ${task.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-200 font-poppins truncate">{task.title}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-poppins shrink-0">{task.date}</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
