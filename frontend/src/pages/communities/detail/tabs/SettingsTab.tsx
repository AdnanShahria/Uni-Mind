import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Loader2, Smile, Users, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import {
  ROLE_HIERARCHY,
  ROLES_ORDERED,
  getAssignableRoles,
  type CommunityRole,
} from '../../../../utils/communityRoles';

const ICON_OPTIONS = [
  '📚','⚛️','🔬','💻','🎓','🏆','🌍','🤝','🔭','📐','🧬','🎭',
  '🏛️','🌿','⚡','🧩','🎯','🦁','🌊','🎸','🔥','💡','🚀','🎨',
  '🧠','🦋','🏅','🌸','🧪','📡','🎻','🏗️',
];

interface SettingsTabProps {
  editName: string;
  setEditName: (n: string) => void;
  editDesc: string;
  setEditDesc: (d: string) => void;
  editVisibility: string;
  setEditVisibility: (v: string) => void;
  editIcon: string;
  setEditIcon: (i: string) => void;
  autoModEnabled: boolean;
  setAutoModEnabled: (v: boolean) => void;
  isUpdating: boolean;
  handleUpdateSettings: () => void;
  userRole: string | null;
  handleDisbandCommunity: () => void;
  members: any[];
  handleUpdateMemberRole: (userId: string, newRole: CommunityRole) => Promise<void>;
}

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-2.5 pb-3 border-b border-white/[0.05]">
    <div className="mt-0.5 text-primary-glow">{icon}</div>
    <div>
      <h4 className="text-[13px] font-bold text-white font-poppins">{title}</h4>
      {subtitle && <p className="text-[10px] text-slate-500 font-poppins mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const SettingsTab = ({
  editName,
  setEditName,
  editDesc,
  setEditDesc,
  editVisibility,
  setEditVisibility,
  editIcon,
  setEditIcon,
  autoModEnabled,
  setAutoModEnabled,
  isUpdating,
  handleUpdateSettings,
  userRole,
  handleDisbandCommunity,
  members,
  handleUpdateMemberRole,
}: SettingsTabProps) => {
  const [openRoleUserId, setOpenRoleUserId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const canManageMembers = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator' || userRole === 'elder';

  const handleRoleChange = async (userId: string, newRole: CommunityRole) => {
    setUpdatingRoleId(userId);
    await handleUpdateMemberRole(userId, newRole);
    setUpdatingRoleId(null);
    setOpenRoleUserId(null);
  };

  return (
    <motion.div
      key="settings-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* ── Community Identity ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#090d16] p-4 md:p-5 space-y-4">
        <SectionHeader
          icon={<Settings className="w-3.5 h-3.5" />}
          title="Community Identity"
          subtitle="Name, description, and icon"
        />

        {/* Icon Picker */}
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 font-semibold font-poppins flex items-center gap-1.5">
            <Smile className="w-3 h-3" /> Community Icon
          </label>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
            {ICON_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setEditIcon(emoji)}
                className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                  editIcon === emoji
                    ? 'bg-primary/20 border border-primary/40 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.25)]'
                    : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-semibold font-poppins">Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Theoretical Physics Club"
            className="w-full bg-black/25 border border-white/[0.07] focus:border-primary/30 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-all font-poppins"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-semibold font-poppins">Description</label>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Objectives, topics, meeting times..."
            rows={3}
            className="w-full bg-black/25 border border-white/[0.07] focus:border-primary/30 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-all font-poppins resize-none"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-semibold font-poppins">Privacy</label>
          <div className="flex gap-3">
            {['public', 'private'].map((vis) => (
              <label key={vis} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={vis}
                  checked={editVisibility === vis}
                  onChange={(e) => setEditVisibility(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-[12px] text-slate-300 font-poppins capitalize">{vis}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI Moderation */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <div>
            <p className="text-[11px] text-amber-400 font-semibold font-poppins flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> AI Auto-Moderation
            </p>
            <p className="text-[10px] text-slate-500 font-poppins mt-0.5">Block spam, profanity, and off-topic posts.</p>
          </div>
          <button
            onClick={() => setAutoModEnabled(!autoModEnabled)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${autoModEnabled ? 'bg-emerald-500/80' : 'bg-slate-700'}`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ x: autoModEnabled ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Save + Disband */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          {userRole === 'owner' && (
            <button
              onClick={handleDisbandCommunity}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[11px] font-semibold font-poppins transition-all"
            >
              <Trash2 className="w-3 h-3" /> Disband
            </button>
          )}
          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating || !editName.trim()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-[11px] font-bold font-poppins transition-all shadow-[0_0_14px_rgba(59,130,246,0.25)] disabled:opacity-50"
          >
            {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Member Role Management ── */}
      {canManageMembers && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#090d16] p-4 md:p-5 space-y-4">
          <SectionHeader
            icon={<Users className="w-3.5 h-3.5" />}
            title="Member Roles"
            subtitle="Promote or reassign members up to your own rank"
          />

          {/* Hierarchy legend */}
          <div className="flex flex-wrap gap-1.5">
            {ROLES_ORDERED.map((role) => {
              const meta = ROLE_HIERARCHY[role];
              return (
                <span key={role} className={`flex items-center gap-1 text-[9px] font-bold font-poppins px-2 py-0.5 rounded-lg border ${meta.badgeClass}`}>
                  {meta.emoji} {meta.label}
                </span>
              );
            })}
          </div>

          {/* Role hierarchy arrow */}
          <div className="flex items-center gap-1 text-[9px] text-slate-600 font-poppins">
            <AlertTriangle className="w-3 h-3 text-amber-600/60" />
            You can only assign roles up to your own rank. Owner cannot be assigned.
          </div>

          {/* Member list */}
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {members.map((member) => {
              const memberMeta = ROLE_HIERARCHY[member.role as CommunityRole] || ROLE_HIERARCHY.member;
              const assignable = getAssignableRoles(userRole, member.role);
              const isUpdating = updatingRoleId === member.user_id;
              const isOpen = openRoleUserId === member.user_id;

              return (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] transition-all"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden shrink-0 border border-white/[0.07]">
                    {member.avatar_url
                      ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                      : member.name?.substring(0, 2)
                    }
                  </div>

                  {/* Name + current role */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-200 font-poppins truncate">{member.name}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold font-poppins px-1.5 py-0.5 rounded border ${memberMeta.badgeClass}`}>
                      {memberMeta.emoji} {memberMeta.label}
                    </span>
                  </div>

                  {/* Role change dropdown (only if actor can manage this member) */}
                  {assignable.length > 0 && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenRoleUserId(isOpen ? null : member.user_id)}
                        disabled={isUpdating}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-lg text-[10px] text-slate-300 font-poppins transition-all"
                      >
                        {isUpdating
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <>Set Role <ChevronDown className="w-3 h-3" /></>
                        }
                      </button>

                      {isOpen && (
                        <div className="absolute right-0 top-full mt-1 z-20 bg-[#0d1628] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
                          {assignable.map((role) => {
                            const meta = ROLE_HIERARCHY[role];
                            return (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(member.user_id, role)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold font-poppins hover:bg-white/[0.06] transition-colors text-left ${
                                  member.role === role ? 'text-primary-glow bg-primary/10' : 'text-slate-300'
                                }`}
                              >
                                <span>{meta.emoji}</span>
                                <span>{meta.label}</span>
                                {member.role === role && <span className="ml-auto text-[8px] text-primary-glow">current</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {members.length === 0 && (
              <p className="text-center text-[11px] text-slate-600 font-poppins py-4">No members yet.</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
