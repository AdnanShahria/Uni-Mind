import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import React from 'react';

export const ChatMessages = ({
  messages,
  isTyping,
  userName,
  messagesEndRef
}: {
  messages: any[];
  isTyping: boolean;
  userName: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <>
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
        >
          {msg.role === 'ai' || msg.role === 'assistant' ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
          ) : null}
          <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
            <div
              className={`rounded-2xl px-5 py-4 text-[13px] font-poppins leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {(msg.role === 'ai' || msg.role === 'assistant') && (
              <div className="flex items-center gap-1 mt-2 ml-1">
                <button className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center text-slate-500 hover:text-emerald-400 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold font-poppins shrink-0 mt-1">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </motion.div>
      ))}

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </>
  );
};
