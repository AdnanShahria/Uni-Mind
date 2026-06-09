import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const MessagesSidebar = ({
  isLoading,
  conversations,
  activeConv,
  setActiveConv
}: {
  isLoading: boolean;
  conversations: any[];
  activeConv: any;
  setActiveConv: (conv: any) => void;
}) => {
  return (
    <div className="w-full border-r-0 md:border-r border-white/[0.06] flex flex-col bg-[#050810]/50 shrink-0">

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input type="text" placeholder="Search messages..." className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none font-poppins" />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-slate-500 font-poppins text-xs">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500 font-poppins text-xs">No conversations yet</div>
        ) : (
          conversations.map((conv, i) => (
            <motion.div
              key={conv.id || i}
              onClick={() => setActiveConv(conv)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                activeConv?.id === conv.id ? 'bg-primary/[0.08] border-r-2 border-primary' : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-xs font-bold font-poppins`}>
                  {conv.avatar}
                </div>
                {conv.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#050810]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-white font-poppins truncate">{conv.name}</p>
                  <span className="text-[10px] text-slate-500 font-poppins shrink-0">{conv.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-poppins truncate mt-0.5">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center font-poppins shrink-0">
                  {conv.unread}
                </span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
