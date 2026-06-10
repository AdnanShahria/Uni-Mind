import { motion } from 'framer-motion';
import { Settings, Shield, Loader2 } from 'lucide-react';

interface SettingsTabProps {
  editName: string;
  setEditName: (n: string) => void;
  editDesc: string;
  setEditDesc: (d: string) => void;
  editVisibility: string;
  setEditVisibility: (v: string) => void;
  autoModEnabled: boolean;
  setAutoModEnabled: (v: boolean) => void;
  isUpdating: boolean;
  handleUpdateSettings: () => void;
  userRole: string | null;
  handleDisbandCommunity: () => void;
}

export const SettingsTab = ({
  editName,
  setEditName,
  editDesc,
  setEditDesc,
  editVisibility,
  setEditVisibility,
  autoModEnabled,
  setAutoModEnabled,
  isUpdating,
  handleUpdateSettings,
  userRole,
  handleDisbandCommunity
}: SettingsTabProps) => {
  return (
    <motion.div
      key="settings-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl glass-card p-5 md:p-6 border border-white/[0.06] bg-[#090d16] space-y-6"
    >
      <div className="border-b border-white/[0.06] pb-3">
        <h3 className="text-[14px] md:text-base font-bold text-white font-poppins flex items-center gap-2">
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Community Settings Panel
        </h3>
        <p className="text-[10px] md:text-xs text-slate-400 font-poppins mt-0.5">Edit details, visibility, or manage lifecycle</p>
      </div>

      <div className="space-y-4">
        {/* Name field */}
        <div className="space-y-1.5">
          <label className="text-[11px] md:text-xs text-slate-400 font-semibold font-poppins">Community Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Theoretical Physics Club"
            className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-[12px] md:text-[13px] text-slate-200 focus:border-primary/30 outline-none transition-all font-poppins"
          />
        </div>

        {/* Description field */}
        <div className="space-y-1.5">
          <label className="text-[11px] md:text-xs text-slate-400 font-semibold font-poppins">Description & Objectives</label>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Objectives, rules, resources, or meeting times..."
            rows={4}
            className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-[12px] md:text-[13px] text-slate-200 focus:border-primary/30 outline-none transition-all font-poppins resize-none"
          />
        </div>

        {/* Privacy Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] md:text-xs text-slate-400 font-semibold font-poppins">Privacy Settings</label>
          <div className="flex gap-4">
            {['public', 'private'].map((vis) => (
              <label key={vis} className="flex items-center gap-2 cursor-pointer font-poppins text-[11px] md:text-xs text-slate-300">
                <input
                  type="radio"
                  name="visibility"
                  value={vis}
                  checked={editVisibility === vis}
                  onChange={(e) => setEditVisibility(e.target.value)}
                  className="text-primary focus:ring-transparent bg-transparent border-white/[0.08]"
                />
                <span className="capitalize">{vis}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Automated Moderation Toggle */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
          <div>
            <label className="text-[11px] md:text-xs text-amber-400 font-bold font-poppins flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" /> AI Automated Moderation
            </label>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-poppins">Automatically block profanity, spam, and off-topic posts.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAutoModEnabled(!autoModEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center ${autoModEnabled ? 'bg-emerald-500/80' : 'bg-slate-700'}`}
            >
              <motion.div 
                className="w-4 h-4 bg-white rounded-full shadow-md"
                animate={{ x: autoModEnabled ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className="text-[10px] md:text-[11px] font-semibold text-slate-300 font-poppins">{autoModEnabled ? 'Active' : 'Disabled'}</span>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          {userRole === 'owner' ? (
            <button
              onClick={handleDisbandCommunity}
              className="flex items-center justify-center gap-1.5 px-4 py-3 md:py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white text-[11px] md:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(244,63,94,0.05)]"
            >
              Disband Community
            </button>
          ) : (
            <div className="hidden md:block" />
          )}

          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating || !editName.trim()}
            className="flex items-center justify-center gap-1.5 px-5 py-3 md:py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-[11px] md:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Updates
          </button>
        </div>

      </div>
    </motion.div>
  );
};
