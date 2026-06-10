import { motion } from 'framer-motion';
import { Users, MessageSquare, UserPlus, Lock, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommunitiesGrid = ({ 
  displayCommunities, 
  isLoading, 
  onJoin
}: { 
  displayCommunities: any[], 
  isLoading: boolean; 
  onJoin?: (communityId: string) => void; 
}) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? (
        <div className="col-span-full py-8 text-center text-slate-500 font-poppins text-sm">Loading communities...</div>
      ) : displayCommunities.length === 0 ? (
        <div className="col-span-full py-8 text-center text-slate-500 font-poppins text-sm">No communities found.</div>
      ) : (
        displayCommunities.map((community, i) => (
          <motion.div
            key={community.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            onClick={() => {
              navigate(`/app/communities/${community.id}`);
            }}
            className={`rounded-2xl bg-gradient-to-br ${community.color} border ${community.border} p-5 cursor-pointer group transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 w-full">
                {community.logo_url ? (
                  <img src={community.logo_url} alt={community.name} className="w-10 h-10 rounded-xl object-cover bg-white/[0.08] border border-white/[0.1]" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-xl shrink-0">
                    {community.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2">
                  <h3 className="text-base font-semibold text-white font-poppins truncate group-hover:text-primary-glow transition-colors">
                    {community.name}
                  </h3>
                  <span className="text-[9px] text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-lg font-poppins font-medium uppercase tracking-wider shrink-0">
                    {community.type}
                  </span>
                </div>
              </div>
              {community.visibility === 'private' && (
                <span title="Private Community" className="ml-2 mt-1 shrink-0">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap justify-between gap-3 mt-auto">
              <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-400 font-poppins">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.members} members</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {community.posts} posts</span>
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-medium">{community.active} online</span>
                </div>
              </div>
              
              {community.myRole ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-purple-400 font-poppins font-medium px-2 py-1 bg-purple-500/10 rounded-lg flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {community.myRole}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/communities/${community.id}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-glow text-[11px] text-white font-poppins font-medium transition-all"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin?.(community.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-primary/20 border border-white/[0.08] hover:border-primary/30 text-[11px] text-slate-300 hover:text-white font-poppins font-medium transition-all"
                >
                  <UserPlus className="w-3 h-3" /> Join
                </button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};
