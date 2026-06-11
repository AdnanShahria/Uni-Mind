import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Users, ChevronDown } from 'lucide-react';
import { ROLE_HIERARCHY, type CommunityRole } from '../../../utils/communityRoles';

interface CommunitySidebarProps {
  members: any[];
  onViewAllMembers: () => void;
}

export const CommunitySidebar = ({ members, onViewAllMembers }: CommunitySidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="space-y-3">
      {/* Community Rules */}
      <div className="rounded-xl p-4 border border-white/[0.06] bg-[#090d16] space-y-3">
        <h3 className="text-[10px] font-bold text-white font-poppins flex items-center gap-1.5 uppercase tracking-widest">
          <UserCheck className="w-3 h-3 text-primary-glow" /> Community Rules
        </h3>
        <div className="space-y-2">
          {[
            { num: '01', text: 'Respect all members — no discrimination or hostility.' },
            { num: '02', text: 'Academic honesty — no direct exam answers.' },
            { num: '03', text: 'Stay on topic — relevant posts only.' },
          ].map((rule) => (
            <div key={rule.num} className="flex gap-2 items-start">
              <span className="shrink-0 text-[8px] font-black text-primary-glow/50 font-poppins bg-primary/10 w-4 h-4 rounded flex items-center justify-center mt-0.5">
                {rule.num}
              </span>
              <p className="text-[10.5px] text-slate-400 font-poppins leading-snug">{rule.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Members */}
      <div className="rounded-xl p-4 border border-white/[0.06] bg-[#090d16] space-y-3">
        <h3 className="text-[10px] font-bold text-white font-poppins flex items-center gap-1.5 uppercase tracking-widest">
          <Users className="w-3 h-3 text-emerald-400" /> Members
        </h3>
        <div className="space-y-2">
          {members.slice(0, 6).map((member, idx) => {
            const meta = ROLE_HIERARCHY[member.role as CommunityRole] || ROLE_HIERARCHY.member;
            return (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[9px] font-bold text-white uppercase overflow-hidden border border-white/[0.06] shrink-0">
                  {member.avatar_url
                    ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (member.name || 'S').substring(0, 2)
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-200 font-poppins truncate">{member.name}</p>
                </div>
                <span className={`shrink-0 flex items-center gap-0.5 text-[8px] font-bold font-poppins px-1.5 py-0.5 rounded border ${meta.badgeClass}`}>
                  {meta.emoji}
                </span>
              </div>
            );
          })}
        </div>

        {members.length > 6 && (
          <button
            onClick={onViewAllMembers}
            className="w-full py-1.5 bg-white/[0.03] hover:bg-primary/10 border border-white/[0.05] hover:border-primary/20 rounded-lg text-[10px] text-primary-glow font-semibold font-poppins transition-all"
          >
            View all {members.length} →
          </button>
        )}
        {members.length === 0 && (
          <p className="text-center text-[10px] text-slate-600 font-poppins py-1">No members yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#090d16] border border-white/[0.06] text-[11px] font-semibold text-white font-poppins"
      >
        <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
          <Users className="w-3 h-3 text-primary-glow" /> Community Info
        </span>
        <motion.div animate={{ rotate: isMobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block">{sidebarContent}</div>
    </div>
  );
};
