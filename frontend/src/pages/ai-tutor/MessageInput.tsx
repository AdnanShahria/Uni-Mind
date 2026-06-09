import { Sparkles, Send, Loader2, Paperclip, X, FileText } from 'lucide-react';
import React, { useRef, useEffect } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileAttach) {
      onFileAttach(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="shrink-0 px-4 pb-4 md:px-6 md:pb-6 relative z-10">
      <div className="max-w-4xl mx-auto relative">
        {/* Attached file indicator */}
        {attachedFileName && (
          <div className="absolute -top-10 left-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-white/[0.08] px-3 py-1.5 rounded-lg shadow-lg">
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

        {/* Floating Action Bar (Fast Research) */}
        {setIsFastResearch && (
          <div className="absolute -top-10 right-4 flex items-center">
            <button 
              onClick={() => setIsFastResearch(!isFastResearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border shadow-lg ${
                isFastResearch 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]' 
                  : 'bg-slate-800/90 text-slate-400 border-white/10 hover:text-slate-200 backdrop-blur-xl'
              }`}
              title="Toggle Fast Research mode to search all your notes"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isFastResearch ? 'text-purple-400' : 'text-slate-500'}`} />
              Fast Research
            </button>
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-1 shadow-2xl flex items-end gap-1.5 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
          
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
            className="p-2.5 text-slate-400 hover:text-primary-glow transition-colors rounded-full hover:bg-white/5 shrink-0 disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) handleSend();
              }
            }}
            placeholder={isTyping ? 'AI is thinking...' : 'Ask anything about your studies...'}
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm md:text-base text-slate-100 placeholder-slate-500 outline-none font-poppins py-2.5 max-h-[200px] resize-none overflow-y-auto custom-scrollbar leading-relaxed"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all shrink-0 ${
              canSend
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-primary-glow hover:scale-105 active:scale-95'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 font-poppins mt-3 text-center px-4">
          UniMind AI can make mistakes. Verify important academic information.
        </p>
      </div>
    </div>
  );
};
