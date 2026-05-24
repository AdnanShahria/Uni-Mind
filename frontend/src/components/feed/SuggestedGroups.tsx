import { motion } from 'framer-motion';
import { Users, Plus, Check } from 'lucide-react';
import { useState } from 'react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const suggestedGroups = [
  { name: 'Quantum Computing Lab', members: '342 members', color: 'from-primary/20 to-secondary/20' },
  { name: 'AI Ethics Discussion', members: '128 members', color: 'from-emerald-500/20 to-teal-500/20' },
  { name: 'Research Paper Writing', members: '256 members', color: 'from-amber-500/20 to-orange-500/20' },
];

export const SuggestedGroups = () => {
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const toggleJoin = (groupName: string) => {
    setJoinedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Suggested Groups
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {suggestedGroups.map((group, i) => {
          const isJoined = joinedGroups.includes(group.name);
          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                  <Users className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200 font-poppins">{group.name}</p>
                  <p className="text-[10px] text-slate-500 font-poppins">{group.members}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleJoin(group.name)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                  isJoined 
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400' 
                    : 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary-glow'
                }`}
              >
                {isJoined ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
