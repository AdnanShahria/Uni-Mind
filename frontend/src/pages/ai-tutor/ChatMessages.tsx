import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check, Lightbulb, BookOpen, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

export const ChatMessages = ({
  messages,
  isTyping,
  userName,
  messagesEndRef,
  onAction
}: {
  messages: any[];
  isTyping: boolean;
  userName: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onAction?: (prompt: string) => void;
}) => {
  const [copiedId, setCopiedId] = useState<any>(null);
  const [likedId, setLikedId] = useState<any>(null);

  const handleCopy = (id: any, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const actionButtons = [
    { label: 'Quiz Me', icon: <Lightbulb className="w-3.5 h-3.5 mr-1" />, prompt: 'Can you give me a short quiz based on what you just explained?' },
    { label: 'Explain Simpler', icon: <BookOpen className="w-3.5 h-3.5 mr-1" />, prompt: 'Can you explain this again, but much simpler, like I am 5 years old?' },
    { label: 'Summarize', icon: <FileText className="w-3.5 h-3.5 mr-1" />, prompt: 'Can you provide a bulleted summary of this for my notes?' }
  ];

  return (
    <>
      {messages.map((msg, index) => {
        const isLastAiMessage = (msg.role === 'ai' || msg.role === 'assistant') && index === messages.length - 1;

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {(msg.role === 'ai' || msg.role === 'assistant') ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
            ) : null}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-2xl px-5 py-4 font-poppins ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-md'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-none text-[14px]">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="rounded-md overflow-hidden my-4 border border-white/[0.1]">
                              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.05] border-b border-white/[0.05] text-xs font-mono text-slate-400">
                                <span>{match[1]}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                  className="hover:text-white transition-colors flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" /> Copy
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, '')}
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.3)' }}
                              />
                            </div>
                          ) : (
                            <code {...props} className="bg-black/30 text-emerald-300 px-1.5 py-0.5 rounded text-[12px] font-mono">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {(msg.role === 'ai' || msg.role === 'assistant') && (
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy response"
                      className={`w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors ${
                        copiedId === msg.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setLikedId(msg.id); toast.success('Feedback noted!'); }}
                      className={`w-7 h-7 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center transition-colors ${
                        likedId === msg.id ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Interactive Learning Buttons for the latest message */}
                  {isLastAiMessage && !isTyping && onAction && (
                    <div className="flex flex-wrap gap-2 ml-1 mt-1">
                      {actionButtons.map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => onAction(btn.prompt)}
                          className="flex items-center px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full text-xs text-primary-glow font-medium transition-colors shadow-sm"
                        >
                          {btn.icon}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold font-poppins shrink-0 mt-1">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
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

      <div ref={messagesEndRef} className="h-4" />
    </>
  );
};
