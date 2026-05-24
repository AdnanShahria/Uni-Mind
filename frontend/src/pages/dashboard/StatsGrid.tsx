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
    <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} overflow-hidden group cursor-pointer`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full" />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white font-outfit">{stat.value}</p>
            <p className="text-[11px] text-slate-400 font-poppins mt-0.5">{stat.label}</p>
            <p className={`text-[10px] ${stat.changeColor} font-semibold font-poppins mt-2`}>{stat.change}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
