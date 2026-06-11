import { motion } from 'framer-motion';
import { Users, MessageSquare, UserPlus, Lock, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_META: Record<string, { gradient: string; accent: string; pill: string }> = {
  'Department':     { gradient: 'from-blue-600/30 via-cyan-500/20 to-transparent',    accent: 'bg-blue-500',    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  'Batch':          { gradient: 'from-emerald-600/30 via-teal-500/20 to-transparent',  accent: 'bg-emerald-500', pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  'Research Group': { gradient: 'from-violet-600/30 via-purple-500/20 to-transparent', accent: 'bg-violet-500',  pill: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  'Interest Group': { gradient: 'from-amber-600/30 via-orange-500/20 to-transparent',  accent: 'bg-amber-500',   pill: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
};

const fallbackMeta = {
  gradient: 'from-slate-600/30 via-slate-500/20 to-transparent',
  accent: 'bg-slate-500',
  pill: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

export const CommunitiesGrid = ({
  displayCommunities,
  isLoading,
  onJoin,
}: {
  displayCommunities: any[];
  isLoading: boolean;
  onJoin?: (communityId: string) => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-60 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        ))
      ) : displayCommunities.length === 0 ? (
        <div className="col-span-full py-20 text-center text-slate-500 font-poppins text-sm">
          No communities found.
        </div>
      ) : (
        displayCommunities.map((community, i) => {
          const meta = TYPE_META[community.type] ?? fallbackMeta;
          return (
            <motion.div
              key={community.id || i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: 'easeOut' }}
              whileHover={{ y: -5, transition: { duration: 0.22 } }}
              onClick={() => navigate(`/app/communities/${community.id}`)}
              className="group relative flex flex-col rounded-2xl bg-[#111827] border border-white/[0.07] overflow-hidden cursor-pointer shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 hover:border-white/[0.13] transition-all duration-300"
            >
              {/* ── Gradient Banner ── */}
              <div className={`relative h-12 flex-shrink-0 bg-gradient-to-br ${meta.gradient}`}>
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${meta.accent} opacity-70`} />
                {/* Private badge */}
                {community.visibility === 'private' && (
                  <div className="absolute top-2.5 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-[9px] text-slate-400 font-poppins font-medium">Private</span>
                  </div>
                )}
              </div>

              {/* ── Body ── */}
              <div className="flex flex-col flex-1 px-4 pb-3.5 gap-2.5">

                {/* Logo + name row — logo uses -mt to straddle the banner */}
                <div className="flex items-end gap-3 -mt-8">
                  {/* Logo */}
                  <div className="shrink-0 z-10">
                    {community.logo_url ? (
                      <img
                        src={community.logo_url}
                        alt={community.name}
                        className="w-12 h-12 rounded-xl object-cover border-[3px] border-[#111827] shadow-lg ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#1e293b] border-[3px] border-[#111827] shadow-lg ring-1 ring-white/10 flex items-center justify-center text-xl">
                        {community.icon}
                      </div>
                    )}
                  </div>

                  {/* Name + type pill — aligned to bottom of logo */}
                  <div className="flex-1 min-w-0 pb-0.5">
                    <h3 className="text-[14px] font-bold text-white font-poppins leading-snug line-clamp-1 group-hover:text-primary-glow transition-colors">
                      {community.name}
                    </h3>
                    <span className={`inline-block mt-0.5 text-[8.5px] font-poppins font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.pill}`}>
                      {community.type}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {community.description && (
                  <p className="text-[11px] text-slate-500 font-poppins leading-relaxed line-clamp-2">
                    {community.description}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.05]">
                  <span className="flex items-center gap-1 text-[11px] font-poppins text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-300">{community.members}</span>
                    <span className="text-slate-600">members</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-poppins text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-300">{community.posts}</span>
                    <span className="text-slate-600">posts</span>
                  </span>
                  <span className="flex items-center gap-1 ml-auto text-[11px] font-poppins text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    {community.active} online
                  </span>
                </div>

                {/* Action button */}
                <div>
                  {community.myRole ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-purple-400 font-poppins font-semibold px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <Shield className="w-3 h-3" />
                        {community.myRole}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/communities/${community.id}`); }}
                        className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-glow text-[11px] text-white font-poppins font-semibold transition-all shadow-sm shadow-primary/30 hover:shadow-primary/50"
                      >
                        Open <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onJoin?.(community.id); }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-primary/20 border border-white/[0.08] hover:border-primary/40 text-[11px] text-slate-300 hover:text-white font-poppins font-semibold transition-all duration-200"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Join Community
                    </button>
                  )}
                </div>
              </div>

              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/[0.015] via-transparent to-transparent" />
            </motion.div>
          );
        })
      )}
    </div>
  );
};
