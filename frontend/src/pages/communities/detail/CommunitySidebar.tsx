import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Users, ChevronDown } from 'lucide-react';

interface CommunitySidebarProps {
  members: any[];
  onViewAllMembers: () => void;
}

export const CommunitySidebar = ({ members, onViewAllMembers }: CommunitySidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Accordion Toggle */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden w-full flex items-center justify-between p-4 rounded-xl bg-[#090d16] border border-white/[0.06] text-sm font-semibold text-white font-poppins"
      >
        <span>About this Community</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar Content - Collapsed on mobile, visible on desktop */}
      <AnimatePresence>
        {(isMobileOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 md:space-y-6 overflow-hidden md:!h-auto md:!opacity-100"
          >
            {/* Rules/Info Card */}
            <div className="rounded-2xl glass-card p-5 md:p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
              <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Community Rules
              </h3>
              <div className="space-y-2.5 text-xs text-slate-400 font-poppins leading-relaxed">
                <p>• **Respect and Support**: Foster a cooperative academic environment. No discrimination or hostility will be tolerated.</p>
                <p>• **Academic Honesty**: Share summaries, papers, or homework suggestions, but avoid posting direct exam answers.</p>
                <p>• **No Spamming**: Only post resources relevant to the community's subject area or general university updates.</p>
              </div>
            </div>

            {/* Roster Quick Summary list */}
            <div className="rounded-2xl glass-card p-5 md:p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
              <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Active Members
              </h3>
              <div className="space-y-3">
                {members.slice(0, 5).map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden shrink-0">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        member.name.substring(0, 2)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-200 font-poppins truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 font-poppins truncate capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
                {members.length > 5 && (
                  <button 
                    onClick={onViewAllMembers} 
                    className="w-full mt-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl text-[11px] text-primary-glow font-semibold font-poppins transition-colors"
                  >
                    View All {members.length} Members
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
