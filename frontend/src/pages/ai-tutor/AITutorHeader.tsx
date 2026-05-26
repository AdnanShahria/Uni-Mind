import { Brain, RotateCcw } from 'lucide-react';

export const AITutorHeader = ({ onNewChat }: { onNewChat: () => void }) => {
  return (
    <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r from-purple-500/[0.04] to-primary/[0.04]">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              AI Tutor
              <span className="text-[9px] text-primary-glow font-bold uppercase tracking-wider font-poppins bg-primary/10 px-2 py-0.5 rounded-full">
                Beta
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-poppins">Powered by advanced language models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-xs text-slate-300 font-poppins transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
};
