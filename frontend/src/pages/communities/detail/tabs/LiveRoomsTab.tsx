import { motion } from 'framer-motion';
import { Plus, Radio, Headphones } from 'lucide-react';

export const LiveRoomsTab = () => {
  return (
    <motion.div
      key="live-rooms-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] md:text-base font-bold text-white font-poppins flex items-center gap-2">
            <Radio className="w-4 h-4 md:w-5 md:h-5 text-rose-500 animate-pulse" /> Active Audio Rooms
          </h3>
          <p className="text-[10px] md:text-xs text-slate-400 font-poppins mt-0.5">Join real-time voice discussions</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full md:rounded-xl text-[11px] md:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Start Room</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mock Room 1 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] hover:border-rose-500/30 transition-colors group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] md:text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Study Group</span>
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-400"><Headphones className="w-3 h-3" /> 12 listening</span>
          </div>
          <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins mb-1 leading-tight">Late Night Physics Prep 🌌</h4>
          <p className="text-[11px] text-slate-400 font-poppins mb-4 line-clamp-2">Discussing quantum mechanics chapter 4 & 5.</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#090d16] flex items-center justify-center overflow-hidden">
                  <span className="text-[8px] text-white font-bold uppercase">U{i}</span>
                </div>
              ))}
            </div>
            <button className="bg-white/5 hover:bg-rose-500 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-semibold font-poppins transition-colors">
              Join Voice
            </button>
          </div>
        </div>

        {/* Mock Room 2 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] hover:border-indigo-500/30 transition-colors group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] md:text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Casual</span>
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-400"><Headphones className="w-3 h-3" /> 5 listening</span>
          </div>
          <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins mb-1 leading-tight">Coffee Chat & Networking ☕</h4>
          <p className="text-[11px] text-slate-400 font-poppins mb-4 line-clamp-2">Taking a break! Come say hi and introduce yourself.</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex -space-x-2">
              {[5,6].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#090d16] flex items-center justify-center overflow-hidden">
                  <span className="text-[8px] text-white font-bold uppercase">U{i}</span>
                </div>
              ))}
            </div>
            <button className="bg-white/5 hover:bg-indigo-500 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-semibold font-poppins transition-colors">
              Join Voice
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
