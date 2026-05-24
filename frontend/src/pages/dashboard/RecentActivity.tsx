import { motion } from 'framer-motion';
import { BarChart3, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const RecentActivity = ({ displayActivity, isLoading }: { displayActivity: any[], isLoading: boolean }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary-glow" />
          Recent Activity
        </h3>
        <button 
          onClick={() => navigate('/app/feed')}
          className="text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins flex items-center gap-1 transition-colors"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {isLoading ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm font-poppins">Loading activity...</div>
        ) : displayActivity.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm font-poppins">No recent activity.</div>
        ) : (
          displayActivity.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${item.color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 font-poppins group-hover:text-white transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-poppins mt-0.5">{item.subtitle}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-poppins shrink-0">{item.time}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
