import { Sparkles, Send, Loader2, Paperclip, X, FileText } from 'lucide-react';
import React, { useRef } from 'react';

export const MessageInput = ({
  input,
  setInput,
  handleSend,
  isTyping = false,
  attachedFileName,
  onFileAttach,
  onFileRemove,
  isFastResearch,
  setIsFastResearch,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isTyping?: boolean;
  attachedFileName?: string | null;
  onFileAttach?: (file: File) => void;
  onFileRemove?: () => void;
  isFastResearch?: boolean;
  setIsFastResearch?: (val: boolean) => void;
}) => {
  const canSend = (input.trim() || attachedFileName) && !isTyping;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileAttach) {
      onFileAttach(e.target.files[0]);
    }
  };

  return (
    <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#050810]/90 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto">
        {attachedFileName && (
          <div className="flex items-center gap-2 mb-3 bg-white/[0.04] border border-white/[0.08] w-fit px-3 py-1.5 rounded-lg">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-200 font-medium truncate max-w-[200px]">{attachedFileName}</span>
            <button
              onClick={onFileRemove}
              className="text-slate-400 hover:text-rose-400 transition-colors ml-2"
              title="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-primary/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                <span className="text-[9px] text-slate-500 font-poppins uppercase tracking-wider font-semibold">
                  {isTyping ? 'AI is thinking...' : 'AI-Powered Response'}
                </span>
              </div>
              
              {setIsFastResearch && (
                <button 
                  onClick={() => setIsFastResearch(!isFastResearch)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                    isFastResearch 
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                      : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
                  }`}
                  title="Toggle Fast Research mode to search all your notes"
                >
                  <Sparkles className="w-3 h-3" />
                  Fast Research
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && canSend && handleSend()}
                placeholder={isTyping ? 'Waiting for response...' : 'Ask anything about your studies...'}
                disabled={isTyping}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins disabled:opacity-50"
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.csv,.json,.pdf,.docx,image/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                title="Attach Context File (Text, PDF, Word, Image)"
                className="text-slate-500 hover:text-primary-glow transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              canSend
                ? 'bg-primary hover:bg-primary-glow text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(96,165,250,0.5)] hover:scale-105 active:scale-95'
                : 'bg-white/[0.04] text-slate-600 cursor-not-allowed'
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 font-poppins mt-2 text-center">
          UniMind AI can make mistakes. Verify important academic information.
        </p>
      </div>
    </div>
  );
};
