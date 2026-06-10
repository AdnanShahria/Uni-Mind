import { motion } from 'framer-motion';
import { Activity, LineChart, BarChart3 } from 'lucide-react';

interface AnalyticsTabProps {
  membersCount: number;
  postsCount: number;
  commentsCount: number;
  members: any[];
}

export const AnalyticsTab = ({ membersCount, postsCount, commentsCount, members }: AnalyticsTabProps) => {
  return (
    <motion.div
      key="analytics-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] md:text-base font-bold text-white font-poppins flex items-center gap-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" /> Community Analytics
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 font-poppins mt-0.5">Insights on engagement and activity trends</p>
        </div>
        <div className="px-2 md:px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded font-mono text-[9px] md:text-[10px] whitespace-nowrap">
          Last 30 Days
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="rounded-xl glass-card p-3 md:p-4 border border-white/[0.06] bg-[#090d16]">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-poppins mb-1 uppercase tracking-wider">Total Members</p>
          <p className="text-xl md:text-2xl font-outfit font-bold text-white">{membersCount}</p>
          <p className="text-[9px] md:text-[10px] text-emerald-400 font-poppins mt-1 flex items-center gap-1">↑ 12%</p>
        </div>
        <div className="rounded-xl glass-card p-3 md:p-4 border border-white/[0.06] bg-[#090d16]">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-poppins mb-1 uppercase tracking-wider">Posts Created</p>
          <p className="text-xl md:text-2xl font-outfit font-bold text-white">{postsCount}</p>
          <p className="text-[9px] md:text-[10px] text-emerald-400 font-poppins mt-1 flex items-center gap-1">↑ 5%</p>
        </div>
        <div className="rounded-xl glass-card p-3 md:p-4 border border-white/[0.06] bg-[#090d16]">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-poppins mb-1 uppercase tracking-wider">Comments</p>
          <p className="text-xl md:text-2xl font-outfit font-bold text-white">{commentsCount * 3 + 12}</p>
          <p className="text-[9px] md:text-[10px] text-rose-400 font-poppins mt-1 flex items-center gap-1">↓ 2%</p>
        </div>
        <div className="rounded-xl glass-card p-3 md:p-4 border border-white/[0.06] bg-[#090d16]">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-poppins mb-1 uppercase tracking-wider">Engagement</p>
          <p className="text-xl md:text-2xl font-outfit font-bold text-indigo-400">A-</p>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-poppins mt-1">Highly Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Mock Activity Chart */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16]">
          <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins flex items-center gap-2 mb-4">
            <LineChart className="w-4 h-4 text-slate-400" /> Activity Over Time
          </h4>
          <div className="h-32 md:h-40 flex items-end gap-1.5 md:gap-2 justify-between">
            {/* Fake bars for chart */}
            {[40, 20, 60, 80, 50, 90, 30, 70, 100, 45, 65, 85].map((h, i) => (
              <div key={i} className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[8px] md:text-[9px] text-slate-500 font-mono">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* Mock Top Contributors */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16]">
          <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-400" /> Top Contributors
          </h4>
          <div className="space-y-3">
            {members.slice(0, 3).map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex justify-center items-center text-[8px] font-bold text-white overflow-hidden shrink-0">
                  {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full rounded-full object-cover"/> : member.name.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-white font-poppins truncate pr-2">{member.name}</span>
                    <span className="text-[9px] md:text-[10px] text-indigo-400 font-mono shrink-0">{150 - i * 30} pts</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${100 - i * 20}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-[11px] text-slate-500 font-poppins text-center py-4">No active contributors yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
