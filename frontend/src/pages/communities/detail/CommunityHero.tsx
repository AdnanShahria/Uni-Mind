
import { Users, MessageSquare, Shield, Lock, Globe, ArrowLeft, LogOut } from 'lucide-react';

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
  onBack
}: CommunityHeroProps) => {
  const bgGradient = community.color || 'from-purple-500 to-indigo-500';

  return (
    <div className={`relative rounded-b-3xl md:rounded-3xl bg-gradient-to-br ${bgGradient} p-6 pt-12 md:p-10 overflow-hidden border-b md:border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-full -mx-4 md:mx-0 px-4 md:px-10`}>
      {/* Abstract blur effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Overlay Back Button & Visibility Badge (Mobile First) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <button
          onClick={onBack}
          className="w-8 h-8 md:w-auto md:px-4 md:py-2 flex items-center justify-center md:justify-start gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold font-poppins bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full md:rounded-xl border border-white/[0.1]"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Communities</span>
        </button>
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.1]">
          {community.visibility === 'private' ? (
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider font-poppins flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          ) : (
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider font-poppins flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mt-8 md:mt-4">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-4 md:gap-6 w-full md:w-auto">
          <div className="w-20 h-20 md:w-20 md:h-20 rounded-2xl bg-white/[0.1] border border-white/[0.15] backdrop-blur-md flex items-center justify-center text-4xl shadow-xl shrink-0">
            {community.icon || '📚'}
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-[10px] text-white/90 bg-white/[0.15] px-2.5 py-0.5 rounded-lg font-poppins font-medium uppercase tracking-wider backdrop-blur-sm border border-white/[0.05]">
                {community.type}
              </span>
              {userRole && (
                <span className="text-[10px] text-yellow-300 bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-0.5 rounded-lg font-poppins font-medium uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm">
                  <Shield className="w-3 h-3" /> {userRole}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white leading-tight mt-3 shadow-sm">
              {community.name}
            </h1>
            <p className="text-white/80 text-xs md:text-sm font-poppins mt-2 max-w-2xl leading-relaxed">
              {community.description || 'Welcome to this prestigious academic community. Connect, collaborate, and excel.'}
            </p>
            
            {/* Mobile inline stats */}
            <div className="flex md:hidden items-center justify-center gap-3 mt-4 text-xs font-semibold text-white/90 font-poppins bg-black/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/[0.06] w-fit mx-auto">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {membersCount}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {postsCount}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-white/90 font-poppins bg-black/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/[0.06]">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {membersCount} members</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {postsCount} posts</span>
          </div>

          {userRole ? (
            userRole !== 'owner' && (
              <button
                onClick={onLeave}
                className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-3 md:py-2 bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-white hover:bg-rose-500 rounded-xl text-sm md:text-xs font-semibold font-poppins transition-all backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" /> Leave Community
              </button>
            )
          ) : (
            <button
              onClick={onJoin}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.98] md:hover:scale-105 md:active:scale-95 text-sm md:text-xs font-bold font-poppins rounded-xl transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
            >
              Join Community
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
