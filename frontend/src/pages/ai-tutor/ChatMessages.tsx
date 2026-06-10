import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check, Lightbulb, BookOpen, FileText, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!chart) return;
    let isCancelled = false;
    const renderChart = async () => {
      try {
        await mermaid.parse(chart);
        if (isCancelled) return;
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
        if (!isCancelled) {
          setSvgContent(svg);
          setError('');
        }
      } catch (e: any) {
        if (!isCancelled) {
          setError(e.message || String(e));
          setSvgContent('');
        }
      }
    };
    renderChart();
    return () => { isCancelled = true; };
  }, [chart]);

  return (
    <>
      <div className="relative group my-6">
        {!isTyping && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex z-10">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/10 hover:bg-slate-700 rounded-lg shadow-xl text-xs font-medium text-slate-300 transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
              Zoom
            </button>
          </div>
        )}
        <div className="flex justify-center bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl overflow-x-auto overflow-y-hidden min-h-[80px]">
          {error ? (
            isTyping ? (
               <div className="animate-pulse text-primary/70 text-sm p-4 flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary/50 border-t-primary animate-spin"></div> Drawing diagram...</div>
            ) : (
               <pre className="text-rose-400 text-xs p-4 overflow-auto">Invalid Diagram Syntax:{"\n"}{error}</pre>
            )
          ) : (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="mermaid-wrapper" />
          )}
        </div>
      </div>

      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" 
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="relative w-full max-w-6xl max-h-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900 shrink-0">
                  <h3 className="text-sm font-medium text-slate-200">Visual Diagram</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800 border border-white/10 rounded-lg overflow-hidden">
                      <button onClick={() => setZoom(z => z + 0.2)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold"><ZoomIn className="w-4 h-4" /></button>
                      <button onClick={() => setZoom(1)} className="px-2 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 text-[10px] font-bold border-x border-white/5">{Math.round(zoom * 100)}%</button>
                      <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold"><ZoomOut className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 bg-[#0a0a0a] flex items-center justify-center min-h-[50vh] cursor-grab active:cursor-grabbing custom-scrollbar">
                   <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}>
                      <div dangerouslySetInnerHTML={{ __html: svgContent }} className="mermaid-wrapper-large" />
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </>
  );
};

const ModernTable = ({ children, isTyping, ...props }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const TableContent = () => (
    <table className="w-full text-left border-collapse text-sm whitespace-nowrap md:whitespace-normal" {...props}>
      {children}
    </table>
  );

  return (
    <>
      <div className="relative group my-6">
        {!isTyping && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex z-10">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/10 hover:bg-slate-700 rounded-lg shadow-xl text-xs font-medium text-slate-300 transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
              Zoom
            </button>
          </div>
        )}
        <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] shadow-sm">
          <TableContent />
        </div>
      </div>

      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" 
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="relative w-full max-w-6xl max-h-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900 shrink-0">
                  <h3 className="text-sm font-medium text-slate-200">Data Table</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800 border border-white/10 rounded-lg overflow-hidden">
                      <button onClick={() => setZoom(z => z + 0.2)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold"><ZoomIn className="w-4 h-4" /></button>
                      <button onClick={() => setZoom(1)} className="px-2 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 text-[10px] font-bold border-x border-white/5">{Math.round(zoom * 100)}%</button>
                      <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-300 font-bold"><ZoomOut className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 bg-[#0a0a0a] flex items-start justify-center min-h-[50vh] custom-scrollbar">
                   <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }} className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 shadow-lg min-w-max">
                      <TableContent />
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </>
  );
};

const UserMessageContent = ({ content }: { content: string }) => {
  const attachmentMatch = content.match(/^\*\(\s*Attached:\s*(.*?)\s*\)\*\n\n?/);
  
  if (attachmentMatch) {
    const fileNames = attachmentMatch[1].split(', ');
    const remainingText = content.replace(/^\*\(\s*Attached:\s*(.*?)\s*\)\*\n\n?/, '');
    
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 mb-1">
          {fileNames.map((name, i) => {
            const isImage = name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isPdf = name.match(/\.pdf$/i);
            return (
              <div key={i} className="flex items-center gap-1.5 bg-black/20 px-3 py-2 rounded-xl text-xs text-white/90 border border-white/10 shadow-sm backdrop-blur-sm">
                <FileText className={`w-4 h-4 ${isImage ? 'text-blue-400' : isPdf ? 'text-rose-400' : 'text-primary-glow'}`} />
                <span className="truncate max-w-[150px] md:max-w-[200px] font-medium">{name}</span>
              </div>
            );
          })}
        </div>
        {remainingText && (
          <p className="text-[13px] md:text-[14px] leading-snug whitespace-pre-wrap">{remainingText}</p>
        )}
      </div>
    );
  }

  return <p className="text-[13px] md:text-[14px] leading-snug whitespace-pre-wrap">{content}</p>;
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
                  <UserMessageContent content={msg.content} />
                ) : (
                  <div className="prose prose-invert prose-p:leading-snug prose-pre:p-0 prose-pre:bg-transparent prose-p:my-2 prose-headings:font-semibold prose-strong:font-medium prose-h1:text-lg prose-h2:text-base prose-h3:text-[15px] max-w-none text-[13px] md:text-[14px]">
                    {msg.content === '' && isTyping && isLastAiMessage ? (
                      <ThinkingIndicator />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          table({ children, ...props }: any) {
                            return <ModernTable isTyping={isTyping && isLastAiMessage} {...props}>{children}</ModernTable>;
                          },
                          th({ children, ...props }: any) {
                            return <th className="px-4 py-3 bg-white/[0.04] border-b border-white/[0.08] font-semibold text-slate-200 uppercase text-[11px] tracking-wider" {...props}>{children}</th>;
                          },
                          td({ children, ...props }: any) {
                            return <td className="px-4 py-3 border-b border-white/[0.04] text-slate-300 text-[13px]" {...props}>{children}</td>;
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
                        {(() => {
                          let text = msg.content;
                          const boldCount = (text.match(/\*\*/g) || []).length;
                          if (boldCount % 2 !== 0) {
                            text += '**';
                          }
                          return text + (isTyping && isLastAiMessage ? ' ▍' : '');
                        })()}
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
                  {isLastAiMessage && !isTyping && onAction && !msg.id?.toString().startsWith('welcome') && (
                    <div className="flex items-center gap-1 shrink-0 mt-1">
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
