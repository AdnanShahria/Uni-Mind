import { motion } from 'framer-motion';
import { Search, Crown } from 'lucide-react';
import { ROLE_HIERARCHY, ROLES_ORDERED, type CommunityRole } from '../../../../utils/communityRoles';

interface MembersTabProps {
  members: any[];
  searchMemberQuery: string;
  setSearchMemberQuery: (q: string) => void;
}

export const MembersTab = ({ members, searchMemberQuery, setSearchMemberQuery }: MembersTabProps) => {
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    (m.major && m.major.toLowerCase().includes(searchMemberQuery.toLowerCase())) ||
    (m.institution && m.institution.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  // Sort by role level descending, then name
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const aLevel = ROLE_HIERARCHY[a.role as CommunityRole]?.level ?? 1;
    const bLevel = ROLE_HIERARCHY[b.role as CommunityRole]?.level ?? 1;
    if (bLevel !== aLevel) return bLevel - aLevel;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Group by role for optional section headers
  const grouped = ROLES_ORDERED.reduce<Record<CommunityRole, any[]>>((acc, role) => {
    acc[role] = sortedMembers.filter(m => m.role === role);
    return acc;
  }, {} as Record<CommunityRole, any[]>);

  return (
    <motion.div
      key="members-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500 font-poppins">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </p>
        {/* Role legend */}
        <div className="hidden sm:flex items-center gap-1">
          {ROLES_ORDERED.map((role) => {
            const meta = ROLE_HIERARCHY[role];
            return (
              <span key={role} title={meta.label} className={`text-[10px] px-1.5 py-0.5 rounded font-poppins border ${meta.badgeClass}`}>
                {meta.emoji}
              </span>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchMemberQuery}
          onChange={(e) => setSearchMemberQuery(e.target.value)}
          className="w-full bg-[#090d16] border border-white/[0.07] focus:border-primary/30 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-slate-200 placeholder-slate-600 outline-none transition-all font-poppins"
        />
      </div>

      {/* Members — grouped by role */}
      {filteredMembers.length === 0 ? (
        <div className="py-10 text-center text-slate-500 font-poppins text-sm bg-[#090d16] rounded-2xl border border-white/[0.06]">
          No members match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {ROLES_ORDERED.map((role) => {
            const group = grouped[role];
            if (group.length === 0) return null;
            const meta = ROLE_HIERARCHY[role];

            return (
              <div key={role}>
                {/* Role group header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`flex items-center gap-1 text-[9px] font-bold font-poppins px-2 py-0.5 rounded-lg border ${meta.badgeClass}`}>
                    {meta.emoji} {meta.label}s
                  </span>
                  <span className="text-[9px] text-slate-600 font-poppins">· {group.length}</span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>

                {/* Member cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.map((member, idx) => (
                    <motion.div
                      key={member.user_id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      className="group flex items-center gap-3 rounded-xl p-3 border border-white/[0.05] hover:border-white/[0.10] bg-[#090d16] hover:bg-white/[0.02] transition-all"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden border border-white/[0.07]">
                          {member.avatar_url
                            ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                            : (member.name || 'S').substring(0, 2)
                          }
                        </div>
                        {role === 'owner' && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-slate-200 font-poppins truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-500 font-poppins truncate">
                          {member.major || 'Scholar'}{member.institution ? ` · ${member.institution}` : ''}
                        </p>
                      </div>

                      {/* Joined date */}
                      <div className="hidden sm:flex flex-col items-end shrink-0">
                        <span className="text-[9px] text-slate-600 font-poppins">Joined</span>
                        <span className="text-[9.5px] text-slate-400 font-poppins font-medium">
                          {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
