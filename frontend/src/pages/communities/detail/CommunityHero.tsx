import { Users, MessageSquare, Globe, Lock, LogOut, Sparkles, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROLE_HIERARCHY, type CommunityRole } from '../../../utils/communityRoles';

interface CommunityHeroProps {
  community: any;
  membersCount: number;
  postsCount: number;
  userRole: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onBack: () => void;
}

export const CommunityHero = ({
  community,
  membersCount,
  postsCount,
  userRole,
  onJoin,
  onLeave,
  onBack,
}: CommunityHeroProps) => {
  const roleMeta = userRole ? ROLE_HIERARCHY[userRole as CommunityRole] : null;
  const isOwner = userRole === 'owner';

  return (
    <div className="pt-2 md:pt-3 pb-0 px-4 md:px-0">
      {/* ── Breadcrumb row ── */}
      <div className="flex items-center gap-1.5 mb-2 md:mb-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-poppins transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Communities</span>
          <span className="sm:hidden">Back</span>
        </button>
        <span className="text-[10px] text-slate-600 hidden sm:inline">/</span>
        <span className="text-[11px] text-slate-300 font-poppins font-medium truncate max-w-[150px] md:max-w-[180px]">
          {community.name}
        </span>
      </div>

      {/* ── Compact hero strip ── */}
      <div className={`relative rounded-xl md:rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-r ${community.color || 'from-violet-600/20 to-indigo-600/20'}`}>
        {/* Subtle noise/grain overlay */}
        <div className="absolute inset-0 bg-[#090d16]/60 pointer-events-none" />

        {/* Left colored accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${community.color || 'from-violet-500 to-indigo-500'} opacity-70`} />

        {/* Content */}
        <div className="relative flex items-center gap-2.5 md:gap-4 px-3 py-2.5 md:px-4 md:py-3.5 pr-3">
          {/* Community Icon */}
          <div className="shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-lg md:text-2xl shadow-inner overflow-hidden">
            {(community.icon?.startsWith('http') || community.icon?.startsWith('data:')) ? (
              <img src={community.icon} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              community.icon || '📚'
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center flex-wrap gap-1.5 mb-0.5 md:mb-1 lg:mb-0">
              <h1 className="text-[14px] md:text-[17px] font-bold font-outfit text-white leading-none truncate">
                {community.name}
              </h1>
              {/* Type badge */}
              <span className="hidden sm:inline text-[9px] text-white/60 bg-white/[0.07] px-1.5 py-0.5 rounded font-poppins uppercase tracking-wider border border-white/[0.07]">
                {community.type}
              </span>
              {/* Visibility */}
              {community.visibility === 'private' ? (
                <span className="flex items-center gap-0.5 text-[9px] md:text-[10px] text-rose-300/80 font-poppins">
                  <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">Private</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[9px] md:text-[10px] text-emerald-400/70 font-poppins">
                  <Globe className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">Public</span>
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-400 font-poppins">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5" /> {membersCount}
              </span>
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-400 font-poppins">
                <MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5" /> {postsCount}
              </span>
              {/* Role badge */}
              {roleMeta && (
                <span className={`flex items-center gap-1 text-[8.5px] md:text-[9px] font-bold font-poppins px-1.5 py-0.5 rounded border ${roleMeta.badgeClass}`}>
                  {roleMeta.emoji} {roleMeta.label}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {userRole ? (
              !isOwner && (
                <motion.button
                  onClick={onLeave}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2 py-1.5 md:px-2.5 md:py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-semibold font-poppins rounded-lg transition-all"
                >
                  <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span className="hidden sm:inline">Leave</span>
                </motion.button>
              )
            ) : (
              <motion.button
                onClick={onJoin}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3 md:py-1.5 bg-primary hover:bg-primary-glow text-white text-[10px] md:text-[11px] font-bold font-poppins rounded-lg transition-all shadow-[0_0_14px_rgba(59,130,246,0.3)]"
              >
                <Sparkles className="w-3 h-3" /> <span className="hidden sm:inline">Join</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

