import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';

interface PodiumUser {
  id: string;
  name: string;
  score: number;
  avatar: string | null;
  rank: number;
  color: string;
}

export const Podium = ({ topUsers }: { topUsers: PodiumUser[] }) => {
  // Reorder for 2 - 1 - 3 display
  const ordered = [
    topUsers.find(u => u.rank === 2),
    topUsers.find(u => u.rank === 1),
    topUsers.find(u => u.rank === 3),
  ].filter(Boolean) as PodiumUser[];

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 pb-8 pt-16 relative">
      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/20 blur-[100px] pointer-events-none" />

      {ordered.map((user) => {
        const isFirst = user.rank === 1;
        const height = isFirst ? 'h-48' : user.rank === 2 ? 'h-36' : 'h-28';
        const delay = isFirst ? 0.2 : user.rank === 2 ? 0.4 : 0.6;
        
        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay }}
            className="flex flex-col items-center relative z-10 w-24 md:w-32"
          >
            {/* User Avatar & Info */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: delay + 0.3 }}
              className="flex flex-col items-center mb-4 relative z-20"
            >
              {isFirst && (
                <Crown className="w-8 h-8 text-yellow-400 absolute -top-8 animate-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              )}
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 shadow-xl flex items-center justify-center font-bold text-xl md:text-2xl text-white ${
                isFirst ? 'border-yellow-400 bg-gradient-to-br from-yellow-500 to-amber-600' :
                user.rank === 2 ? 'border-slate-300 bg-gradient-to-br from-slate-400 to-slate-600' :
                'border-amber-700 bg-gradient-to-br from-amber-700 to-amber-900'
              }`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <h3 className="text-white font-bold text-sm md:text-base mt-3 text-center truncate w-full px-2">{user.name}</h3>
              <div className="flex items-center gap-1 text-primary-glow text-xs md:text-sm font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1 border border-primary/20">
                <Star className="w-3 h-3 md:w-4 md:h-4" />
                {user.score.toLocaleString()}
              </div>
            </motion.div>

            {/* Podium Block */}
            <div className={`w-full ${height} rounded-t-xl border-t-4 border-l border-r border-white/5 relative overflow-hidden flex justify-center ${
              isFirst ? 'bg-gradient-to-t from-primary/5 to-primary/30 border-t-primary/50' :
              user.rank === 2 ? 'bg-gradient-to-t from-blue-500/5 to-blue-500/20 border-t-blue-400/50' :
              'bg-gradient-to-t from-emerald-500/5 to-emerald-500/20 border-t-emerald-400/50'
            }`}>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
              <div className="mt-4 text-4xl md:text-5xl font-black text-white/20">{user.rank}</div>
              
              {/* Animated highlight line */}
              <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: user.rank * 0.5 }}
                className="absolute left-0 w-full h-[1px] bg-white/30 blur-[1px]"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
