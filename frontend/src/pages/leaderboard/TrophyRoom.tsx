import { motion } from 'framer-motion';
import { Award, Brain, Zap, FileText, CheckCircle, Flame, BookOpen, Users } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  unlocked: boolean;
  date?: string;
}

const ALL_BADGES: Badge[] = [
  { id: 'first_login', name: 'Early Bird', description: 'Joined UniMind in the first week.', icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', unlocked: true, date: 'May 20, 2026' },
  { id: 'note_ninja', name: 'Note Ninja', description: 'Uploaded 10 study notes.', icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', unlocked: true, date: 'May 25, 2026' },
  { id: 'streak_7', name: '7-Day Streak', description: 'Studied for 7 consecutive days.', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/10', unlocked: true, date: 'May 27, 2026' },
  { id: 'ai_scholar', name: 'AI Scholar', description: 'Generated 50 AI summaries.', icon: Brain, color: 'text-purple-400', bgColor: 'bg-purple-400/10', unlocked: false },
  { id: 'collaborator', name: 'Collaborator', description: 'Joined 5 active communities.', icon: Users, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', unlocked: false },
  { id: 'bookworm', name: 'Deep Work', description: 'Spent 100 hours in study mode.', icon: BookOpen, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10', unlocked: false },
];

export const TrophyRoom = ({ earnedBadgeIds }: { earnedBadgeIds: string[] }) => {
  // Sync locked/unlocked state based on user's DB array
  // If earnedBadgeIds is empty, we just use the mocked ALL_BADGES unlocked states for demo
  const badges = earnedBadgeIds.length > 0 
    ? ALL_BADGES.map(b => ({ ...b, unlocked: earnedBadgeIds.includes(b.id) }))
    : ALL_BADGES;

  return (
    <div className="bg-[#0A0D1A]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Trophy Room</h2>
          <p className="text-xs text-slate-400">Unlock badges to show off on your profile</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl border relative overflow-hidden group ${
              badge.unlocked 
                ? 'bg-white/[0.03] border-white/10 hover:border-white/20' 
                : 'bg-black/20 border-white/5 opacity-60 grayscale'
            }`}
            title={badge.description}
          >
            {badge.unlocked && (
              <div className={`absolute top-0 right-0 w-24 h-24 ${badge.bgColor} rounded-full blur-[40px] -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
            )}
            
            <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center relative z-10 ${
              badge.unlocked ? badge.bgColor : 'bg-white/5'
            }`}>
              <badge.icon className={`w-6 h-6 ${badge.unlocked ? badge.color : 'text-slate-500'}`} />
            </div>
            
            <h3 className="text-sm font-bold text-white mb-1 relative z-10">{badge.name}</h3>
            <p className="text-[10px] text-slate-400 line-clamp-2 relative z-10">{badge.description}</p>
            
            {badge.unlocked && badge.date && (
              <div className="absolute top-3 right-3 text-[9px] text-slate-500 font-semibold bg-black/40 px-1.5 py-0.5 rounded">
                {badge.date}
              </div>
            )}
            
            {badge.unlocked && (
              <div className="absolute bottom-3 right-3 text-emerald-400 bg-emerald-500/10 rounded-full p-1 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
