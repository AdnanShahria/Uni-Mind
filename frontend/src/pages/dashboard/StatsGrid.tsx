import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const StatsGrid = ({ stats }: { stats: any[] }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => navigate(stat.path)}
            className={`relative p-3 sm:p-3.5 rounded-xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} overflow-hidden group cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/[0.01] to-transparent rounded-bl-full" />
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-poppins leading-tight">{stat.label}</p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-bold text-white font-outfit leading-tight">{stat.value}</span>
                  <span className={`text-[9px] sm:text-[10px] ${stat.changeColor} font-medium font-poppins`}>{stat.change}</span>
                </div>
              </div>
            </div>

            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 group-hover:text-white transition-colors shrink-0 absolute top-2.5 right-2.5 sm:static sm:self-start sm:mt-0.5" />
          </motion.div>
        );
      })}
    </motion.div>
  );
};
