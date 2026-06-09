import { Brain, RotateCcw, PanelLeft } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const AITutorHeader = ({ onNewChat, isSidebarOpen, toggleSidebar }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl transition-all ${isSidebarOpen ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              UniTutor
              <span className="text-[9px] text-primary-glow font-bold uppercase tracking-wider font-poppins bg-primary/10 px-2 py-0.5 rounded-full">
                Beta
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-poppins hidden sm:block">Powered by advanced language models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-xs text-slate-300 font-poppins transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
    </div>
  );
};
