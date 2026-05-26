import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// ─── Simple Markdown Renderer ──────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2 heading
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={key++} className="text-sm font-bold text-white font-outfit mt-3 mb-1">
          {line.slice(3)}
        </h3>
      );
      i++; continue;
    }
    // H3 heading
    if (line.startsWith('### ')) {
      nodes.push(
        <h4 key={key++} className="text-xs font-bold text-slate-200 font-outfit mt-2 mb-0.5">
          {line.slice(4)}
        </h4>
      );
      i++; continue;
    }
    // Horizontal rule
    if (line.trim() === '---') {
      nodes.push(<hr key={key++} className="border-white/[0.06] my-2" />);
      i++; continue;
    }
    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^(\d+)\.\s(.+)/)) {
        const m = lines[i].match(/^(\d+)\.\s(.+)/);
        listItems.push(
          <li key={i} className="flex gap-2 text-slate-300 text-[12.5px]">
            <span className="text-primary-glow font-bold shrink-0">{m![1]}.</span>
            <span>{inlineMarkdown(m![2])}</span>
          </li>
        );
        i++;
      }
      nodes.push(<ol key={key++} className="space-y-1 my-1.5 pl-1">{listItems}</ol>);
      continue;
    }
    // Bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        const content = lines[i].slice(2);
        listItems.push(
          <li key={i} className="flex gap-2 text-slate-300 text-[12.5px]">
            <span className="text-primary-glow mt-1 shrink-0">•</span>
            <span>{inlineMarkdown(content)}</span>
          </li>
        );
        i++;
      }
      nodes.push(<ul key={key++} className="space-y-1 my-1.5 pl-1">{listItems}</ul>);
      continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={key++} className="border-l-2 border-primary/40 pl-3 my-1.5 text-slate-400 text-[12px] italic">
          {inlineMarkdown(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }
    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre key={key++} className="bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 my-2 text-[11.5px] text-emerald-300 font-mono overflow-x-auto">
          {codeLines.join('\n')}
        </pre>
      );
      i++; continue;
    }
    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }
    // Paragraph
    nodes.push(
      <p key={key++} className="text-slate-200 text-[13px] leading-relaxed">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

function inlineMarkdown(text: string): React.ReactNode {
  // Split by ** for bold, * for italic, ` for code
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-black/30 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-slate-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// ─── Component ────────────────────────────────────────────────────────────
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
  const [copiedId, setCopiedId] = useState<any>(null);
  const [likedId, setLikedId] = useState<any>(null);

  const handleCopy = (id: any, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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
          {(msg.role === 'ai' || msg.role === 'assistant') ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-primary/20 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
          ) : null}

          <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
            <div
              className={`rounded-2xl px-5 py-4 font-poppins ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-md'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="space-y-1">
                  {renderMarkdown(msg.content)}
                </div>
              )}
            </div>

            {(msg.role === 'ai' || msg.role === 'assistant') && (
              <div className="flex items-center gap-1 mt-2 ml-1">
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
