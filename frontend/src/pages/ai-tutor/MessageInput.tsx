import { Sparkles, Send, Loader2, Paperclip, X, FileText, MoreHorizontal, Brain, Globe } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MessageInput = ({
  input,
  setInput,
  handleSend,
  isTyping = false,
  attachedFiles = [],
  onFileAttach,
  onFileRemove,
  isFastResearch,
  setIsFastResearch,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isTyping?: boolean;
  attachedFiles?: File[];
  onFileAttach?: (files: FileList) => void;
  onFileRemove?: (index: number) => void;
  isFastResearch?: boolean;
  setIsFastResearch?: (val: boolean) => void;
}) => {
  const canSend = (input.trim() || attachedFiles.length > 0) && !isTyping;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Consider typing active if there's text OR if a file is attached (so we see the files pushed right)
  const isActiveTyping = input.length > 0 || attachedFiles.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileAttach) {
      onFileAttach(e.target.files);
    }
    // Reset so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.more-options-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // The floating tools menu component
  const ToolsButtons = ({ isTop }: { isTop: boolean }) => (
    <motion.div 
      layoutId="tools-group"
      className={`flex items-center gap-1 md:gap-1.5 shrink-0 transition-opacity duration-300 ${isTop ? 'opacity-40 hover:opacity-100 z-10' : 'opacity-100 z-20'} relative`}
    >
      <div className="relative more-options-menu">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-colors border ${
            showMenu || isFastResearch
              ? 'bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 shadow-lg'
          }`}
          title="More Options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-3 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden py-1.5 flex flex-col z-50"
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

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isTyping}
        title="Attach Context File"
        className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-colors border bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 shadow-lg disabled:opacity-50"
      >
        <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </motion.div>
  );

  return (
    <div className="shrink-0 px-2 pb-2 md:px-6 md:pb-6 relative z-20">
      <motion.div layout className="max-w-4xl mx-auto flex flex-col gap-1.5 md:gap-2">
        
        {/* Top Row: Holds the tools (when typing) and file attachments */}
        <motion.div layout className="flex items-end gap-2 min-h-[1px]">
          {isActiveTyping && <ToolsButtons isTop={true} />}
          
          <motion.div layout className="flex flex-wrap items-center gap-2 z-10">
            <AnimatePresence>
              {attachedFiles.map((file, idx) => (
                <motion.div 
                  key={`${file.name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-white/[0.08] px-3 py-1.5 rounded-xl shadow-lg w-fit max-w-[200px]"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-medium truncate min-w-0">{file.name}</span>
                  <button
                    onClick={() => onFileRemove && onFileRemove(idx)}
                    className="text-slate-400 hover:text-rose-400 transition-colors ml-1 shrink-0 p-1 rounded-md hover:bg-white/5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Bottom Row: Holds tools (when NOT typing) and input field */}
        <motion.div layout className="flex items-end gap-1.5 md:gap-2">
          {!isActiveTyping && <ToolsButtons isTop={false} />}

          <motion.div 
            layout
            className={`flex-1 bg-slate-900/90 backdrop-blur-2xl border rounded-[24px] p-1 md:p-1.5 shadow-2xl flex items-end gap-1 md:gap-1.5 transition-colors relative min-w-0 ${
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
              multiple
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
              placeholder={isTyping ? 'Processing...' : isFastResearch ? 'Fast Research active: Ask anything...' : 'Ask anything...'}
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
        </motion.div>
        
        {/* Hidden on mobile to save vertical space! */}
        <p className="hidden text-[10px] text-slate-500 font-poppins mt-2 text-center px-2 leading-tight w-full absolute -bottom-5">
          UniMind AI can make mistakes. Verify important academic information.
        </p>
      </motion.div>
    </div>
  );
};
