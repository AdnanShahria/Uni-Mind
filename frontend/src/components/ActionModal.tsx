import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Calendar, Tag, Flag } from 'lucide-react';
import { useState } from 'react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  actionText?: string;
  children?: React.ReactNode;
}

export const ActionModal = ({ isOpen, onClose, title, placeholder = "Enter details...", actionText = "Create", children }: ActionModalProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() && !children) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setContent('');
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030712]/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg relative group"
        >
          {/* Animated gradient border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-2xl opacity-50 blur-[2px] group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.5)_360deg)] opacity-50"
                  />
                  <Sparkles className="w-5 h-5 text-primary-400 relative z-10" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-outfit">
                  {title}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl hover:bg-white/[0.08] hover:scale-105 transition-all duration-300 text-slate-400 hover:text-white active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 relative">
              {/* Background ambient light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
              
              {children ? (
                children
              ) : (
                <div className="space-y-4 relative z-10">
                  <div className={`relative transition-all duration-300 rounded-xl p-[1px] ${isFocused ? 'bg-gradient-to-r from-primary/50 to-purple-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-white/[0.06]'}`}>
                    <textarea
                      placeholder={placeholder}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="w-full min-h-[140px] bg-[#0f172a]/90 backdrop-blur-sm rounded-xl px-5 py-4 text-sm text-slate-200 font-poppins placeholder-slate-500 resize-none outline-none transition-all"
                    />
                  </div>
                  
                  {/* Action Bar (Tags, Dates, etc - UI Only) */}
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-xs text-slate-400 hover:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-primary-400" />
                      Today
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-xs text-slate-400 hover:text-slate-200">
                      <Flag className="w-3.5 h-3.5 text-orange-400" />
                      Priority
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-xs text-slate-400 hover:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-purple-400" />
                      Tags
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/[0.06] bg-black/20 flex items-center justify-end gap-3 relative z-10">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && !children)}
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary-400 hover:to-purple-500 text-white text-sm font-semibold font-poppins transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-4 h-4 relative z-10" />
                )}
                <span className="relative z-10">{isSubmitting ? 'Processing...' : actionText}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
