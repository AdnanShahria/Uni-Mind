import { motion } from 'framer-motion';
import { Flame, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface RankUser {
  id: string;
  name: string;
  score: number;
  streak: number;
  avatar: string | null;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export const RankList = ({ users, currentUserId }: { users: RankUser[], currentUserId: string }) => {
  return (
    <div className="bg-[#0A0D1A]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="grid grid-cols-[80px_1fr_120px_150px] gap-4 p-4 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <div className="text-center">Rank</div>
        <div>Scholar</div>
        <div className="text-center">Streak</div>
        <div className="text-right pr-4">Score</div>
      </div>
      
      <div className="divide-y divide-white/5">
        {users.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`grid grid-cols-[80px_1fr_120px_150px] gap-4 p-4 items-center transition-colors hover:bg-white/[0.02] ${
              user.id === currentUserId ? 'bg-primary/10 hover:bg-primary/15' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`text-lg font-bold ${user.id === currentUserId ? 'text-primary-glow' : 'text-slate-300'}`}>
                {user.rank}
              </span>
              {user.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500" />}
              {user.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
              {user.trend === 'same' && <Minus className="w-4 h-4 text-slate-600" />}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden border border-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className={`font-semibold text-sm ${user.id === currentUserId ? 'text-white' : 'text-slate-200'}`}>
                  {user.name}
                  {user.id === currentUserId && <span className="ml-2 text-[10px] bg-primary/20 text-primary-glow px-2 py-0.5 rounded-full border border-primary/30">You</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-orange-400 font-semibold bg-orange-500/10 py-1 px-3 rounded-full w-fit mx-auto border border-orange-500/20">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-sm">{user.streak}</span>
            </div>

            <div className="text-right pr-4 font-bold text-slate-200 text-lg">
              {user.score.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
