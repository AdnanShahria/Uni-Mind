import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface MembersTabProps {
  members: any[];
  searchMemberQuery: string;
  setSearchMemberQuery: (q: string) => void;
}

export const MembersTab = ({ members, searchMemberQuery, setSearchMemberQuery }: MembersTabProps) => {
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    (m.major && m.major.toLowerCase().includes(searchMemberQuery.toLowerCase())) ||
    (m.institution && m.institution.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  return (
    <motion.div
      key="members-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search members by name or major..."
          value={searchMemberQuery}
          onChange={(e) => setSearchMemberQuery(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-[13px] text-slate-200 placeholder-slate-500 focus:border-primary/30 focus:shadow-[0_0_15px_rgba(59,130,246,0.05)] outline-none transition-all font-poppins"
        />
      </div>

      {/* Members Roster Card List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 font-poppins text-sm bg-[#090d16] rounded-2xl border border-white/[0.06]">
            No roster members match your search criteria.
          </div>
        ) : (
          filteredMembers.map((member, idx) => (
            <div key={idx} className="rounded-xl md:rounded-2xl glass-card p-3 md:p-4 border border-white/[0.06] bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-sm text-white uppercase overflow-hidden shrink-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    member.name.substring(0, 2)
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] md:text-[13px] font-semibold text-slate-200 font-poppins truncate">{member.name}</span>
                    <span className={`text-[8.5px] font-bold font-poppins px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${member.role === 'owner' ? 'bg-amber-500/10 text-amber-400' :
                        member.role === 'moderator' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-blue-500/10 text-blue-400'
                      }`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-poppins mt-0.5 truncate">{member.major || 'Deep Work'} · {member.institution || 'UniMind Labs'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 text-right hidden sm:flex">
                <span className="text-[9px] text-slate-500 font-poppins">Joined:</span>
                <span className="text-[9.5px] text-slate-400 font-poppins font-medium">{new Date(member.joined_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
