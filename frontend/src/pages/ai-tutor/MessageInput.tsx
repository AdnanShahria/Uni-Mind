import { Sparkles, Wand2, Send } from 'lucide-react';

export const MessageInput = ({
  input,
  setInput,
  handleSend
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
}) => {
  return (
    <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#050810]/90 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-primary/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
              <span className="text-[9px] text-slate-500 font-poppins uppercase tracking-wider font-semibold">AI-Powered Response</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything about your studies..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins"
              />
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-purple-400 transition-colors">
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              input.trim()
                ? 'bg-primary hover:bg-primary-glow text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(96,165,250,0.5)]'
                : 'bg-white/[0.04] text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 font-poppins mt-2 text-center">
          UniMind AI can make mistakes. Verify important academic information.
        </p>
      </div>
    </div>
  );
};
