import { motion } from 'framer-motion';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check, Lightbulb, BookOpen, FileText } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Poppins, sans-serif'
});

const ThinkingIndicator = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = ['Gathering information...', 'Analyzing query...', 'Checking knowledgebase...', 'Synthesizing response...'];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }, 2500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex flex-col gap-2 py-1 min-h-[40px] justify-center">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <div className="text-[11px] text-primary/70 font-medium italic animate-pulse">
        {steps[stepIndex]}
      </div>
    </div>
  );
};

const MermaidDiagram = ({ chart, isTyping }: { chart: string, isTyping: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    if (!chart) return;
    
    let isCancelled = false;

    const renderChart = async () => {
      try {
        await mermaid.parse(chart);
        if (isCancelled) return;
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
        if (ref.current && !isCancelled) {
          ref.current.innerHTML = svg;
        }
      } catch (e: any) {
        if (isCancelled) return;
        if (ref.current) {
          if (isTyping) {
            ref.current.innerHTML = `<div class="animate-pulse text-primary/70 text-sm p-4 flex items-center gap-2"><div class="w-4 h-4 rounded-full border-2 border-primary/50 border-t-primary animate-spin"></div> Drawing diagram...</div>`;
          } else {
            ref.current.innerHTML = `<pre class="text-rose-400 text-xs p-4 overflow-auto">Invalid Diagram Syntax:\n${e.message || String(e)}</pre>`;
          }
        }
      }
    };

    renderChart();

    return () => {
      isCancelled = true;
    };
  }, [chart, isTyping]);
  
  return (
    <div className="relative group my-6">
       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-slate-800 border border-white/10 rounded-lg overflow-hidden shadow-xl z-10">
         <button onClick={() => setZoom(z => z + 0.2)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold">+</button>
         <button onClick={() => setZoom(1)} className="px-2 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 text-[10px] font-bold border-x border-white/5">100%</button>
         <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold">-</button>
       </div>
       <div className="flex justify-center bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl overflow-x-auto overflow-y-hidden min-h-[80px]">
         <div ref={ref} style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }} />
       </div>
    </div>
  );
};

export const ChatMessages = ({
  messages,
  isTyping,
  userName,
  onAction
}: {
  messages: any[];
  isTyping: boolean;
  userName: string;
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
    { label: 'Quiz Me', icon: <Lightbulb className="w-3.5 h-3.5 mr-1" />, prompt: 'Can you give me a short quiz based on what you just explained about ... ?' },
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
              <div className="hidden md:flex w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
            ) : null}

            <div className={`max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 font-poppins ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md md:rounded-br-md rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl md:rounded-bl-md'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-md md:rounded-bl-md rounded-tr-2xl rounded-tl-2xl rounded-br-2xl md:rounded-br-md'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-[13px] md:text-[14px] leading-snug whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-p:leading-snug prose-pre:p-0 prose-pre:bg-transparent prose-p:my-2 max-w-none text-[13px] md:text-[14px]">
                    {msg.content === '' && isTyping && isLastAiMessage ? (
                      <ThinkingIndicator />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          table({ children, ...props }: any) {
                            return (
                              <div className="overflow-x-auto my-6 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                                <table className="w-full text-left border-collapse text-sm" {...props}>
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children, ...props }: any) {
                            return <th className="px-4 py-3 bg-white/[0.04] border-b border-white/[0.08] font-semibold text-slate-200" {...props}>{children}</th>;
                          },
                          td({ children, ...props }: any) {
                            return <td className="px-4 py-3 border-b border-white/[0.04] text-slate-300" {...props}>{children}</td>;
                          },
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          code({ node: _node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            
                            if (!inline && language === 'mermaid') {
                              return <MermaidDiagram chart={String(children)} isTyping={isTyping && isLastAiMessage} />;
                            }

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
                        {msg.content + (isTyping && isLastAiMessage ? ' ▍' : '')}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>

              {(msg.role === 'ai' || msg.role === 'assistant') && (
                <div className="mt-1 md:mt-1.5 flex items-center gap-1.5 md:gap-3 ml-1 overflow-x-auto scrollbar-none pb-0.5 w-full">
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy response"
                      className={`w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center transition-colors ${
                        copiedId === msg.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => { setLikedId(msg.id); toast.success('Feedback noted!'); }}
                      className={`w-6 h-6 rounded-md hover:bg-emerald-500/10 flex items-center justify-center transition-colors ${
                        likedId === msg.id ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      className="w-6 h-6 rounded-md hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Interactive Learning Buttons for the latest message */}
                  {isLastAiMessage && !isTyping && onAction && (
                    <div className="flex items-center gap-1 shrink-0">
                      {actionButtons.map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => onAction(btn.prompt)}
                          className="flex items-center px-1.5 py-0.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded text-[9px] md:text-[10px] text-primary-glow transition-colors whitespace-nowrap"
                        >
                          {React.cloneElement(btn.icon as React.ReactElement, { className: 'w-2.5 h-2.5 mr-0.5' })}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="hidden md:flex w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary items-center justify-center text-white text-xs font-bold font-poppins shrink-0 mt-1">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Typing indicator removed as it's now handled inline inside the empty message bubble */}
    </>
  );
};
