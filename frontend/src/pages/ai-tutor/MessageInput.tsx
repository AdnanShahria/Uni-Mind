import { Sparkles, Send, Loader2, Paperclip, X, FileText, MoreHorizontal, Brain, Globe } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showMenu, setShowMenu] = useState(false);

  // If the user has typed anything, we consider them "actively typing" 
  // to trigger the compact layout animation
  const isActiveTyping = input.length > 0;

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

  // Handle clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.more-options-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="shrink-0 px-2 pb-2 md:px-6 md:pb-6 relative z-20">
      <motion.div layout className="max-w-4xl mx-auto relative flex items-end gap-2">
        {/* Floating file indicator ONLY */}
        {attachedFileName && (
          <div className="absolute -top-10 left-0 flex items-center gap-2 mb-2 bg-slate-800/90 backdrop-blur-xl border border-white/[0.08] px-3 py-1.5 rounded-xl shadow-lg w-fit max-w-full">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200 font-medium truncate min-w-0">{attachedFileName}</span>
            <button
              onClick={onFileRemove}
              className="text-slate-400 hover:text-rose-400 transition-colors ml-1 shrink-0 p-1 rounded-md hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Outside Action Buttons: 3-Dot Menu & Attachment */}
        <motion.div 
          layout
          initial={false}
          animate={{
            y: isActiveTyping ? -50 : 0,
            x: isActiveTyping ? 5 : 0,
            scale: isActiveTyping ? 0.85 : 1,
            opacity: isActiveTyping ? 0.4 : 1,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`flex items-center gap-1.5 md:gap-2 shrink-0 hover:opacity-100 ${
            isActiveTyping ? 'absolute left-0 bottom-0 pointer-events-auto z-10' : 'relative mb-1'
          }`}
        >
          {/* 3-Dot Options Menu Button */}
          <div className="relative more-options-menu">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-colors border ${
                showMenu || isFastResearch
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 backdrop-blur-xl shadow-xl'
              }`}
              title="More Options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Options Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-3 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden py-1.5 flex flex-col"
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/[0.05] mb-1">
                    Tools
                  </div>
                  
                  {setIsFastResearch && (
                    <button
                      onClick={() => {
                        setIsFastResearch(!isFastResearch);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left group w-full"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isFastResearch ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400 group-hover:text-purple-400'}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium font-poppins ${isFastResearch ? 'text-purple-400' : 'text-slate-300 group-hover:text-white'}`}>Fast Research</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Search your local notes</p>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left group w-full"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-emerald-400 transition-colors">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium font-poppins text-slate-300 group-hover:text-white transition-colors">Expanded Thinking</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Deep analytical reasoning</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left group w-full"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium font-poppins text-slate-300 group-hover:text-white transition-colors">Web Search</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Search the internet live</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            title="Attach Context File"
            className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-colors border bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 backdrop-blur-xl shadow-xl disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </motion.div>

        {/* Input Bar */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`bg-slate-900/90 backdrop-blur-2xl border rounded-[24px] p-1 md:p-1.5 shadow-2xl flex items-end gap-1 md:gap-1.5 transition-colors relative min-w-0 ${
            isActiveTyping ? 'w-full' : 'flex-1'
          } ${
            isFastResearch 
              ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
              : 'border-white/[0.1] focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.csv,.json,.pdf,.docx,image/*"
          />
          
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
            placeholder={isTyping ? 'Thinking...' : isFastResearch ? 'Fast Research active: Ask anything...' : 'Ask anything...'}
            disabled={isTyping}
            className={`flex-1 bg-transparent text-[13px] md:text-base outline-none font-poppins py-2 md:py-2.5 px-3 max-h-[120px] md:max-h-[200px] resize-none overflow-y-auto custom-scrollbar leading-relaxed min-w-0 ${
              isFastResearch ? 'text-purple-100 placeholder-purple-400/50' : 'text-slate-100 placeholder-slate-500'
            }`}
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5 md:mb-0 ${
              canSend
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-primary-glow hover:scale-105 active:scale-95'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5 ml-[-2px] md:ml-[-1px]" />
            )}
          </button>
        </motion.div>
        
        {/* Hidden on mobile to save vertical space! */}
        <p className="hidden text-[10px] text-slate-500 font-poppins mt-2 text-center px-2 leading-tight w-full absolute -bottom-5">
          UniMind AI can make mistakes. Verify important academic information.
        </p>
      </motion.div>
    </div>
  );
};
