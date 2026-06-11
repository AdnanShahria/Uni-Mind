import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const StatsGrid = ({ stats }: { stats: any[] }) => {
  const navigate = useNavigate();

  if (stats.length === 0) {
    return (
      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-5 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => navigate(stat.path)}
            className={`relative p-3 lg:p-4 rounded-xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} overflow-hidden group cursor-pointer`}
          >
            {/* Decorative glow blob */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/[0.03] rounded-full blur-xl group-hover:bg-white/[0.06] transition-all duration-500" />

            <div className="relative z-10 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.1] flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-poppins leading-tight">{stat.label}</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>

            <div className="relative z-10 flex items-baseline gap-2 mt-1">
              <p className="text-xl lg:text-2xl font-bold text-white font-outfit leading-none">{stat.value}</p>
              <p className={`text-[10px] sm:text-[11px] ${stat.changeColor} font-medium font-poppins`}>{stat.change}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
