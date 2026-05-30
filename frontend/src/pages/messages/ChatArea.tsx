import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Pin, MessageCircle, Paperclip, Image as ImageIcon, Smile, Send, CheckCheck, Sparkles, Reply, X, ThumbsUp, Heart, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatAreaProps {
  activeConv: any;
  messages: any[];
  onSendMessage: (content: string, metadata?: any) => Promise<void>;
  onSummarize: () => void;
  isSummarizing: boolean;
  smartReplies?: string[];
  onReact?: (messageId: string, emoji: string) => void;
  onBack?: () => void;
}

export const ChatArea = ({ activeConv, messages, onSendMessage, onSummarize, isSummarizing, smartReplies = [], onReact, onBack }: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyToMsg, setReplyToMsg] = useState<any>(null);
  const [attachment, setAttachment] = useState<{ type: string, url: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, smartReplies, replyToMsg, attachment]);

  const handleSend = async (overrideContent?: string) => {
    const content = overrideContent || inputValue;
    if ((!content.trim() && !attachment) || isSending) return;
    
    setIsSending(true);
    setInputValue(''); // Optimistic clear
    
    const metadata: any = {};
    if (replyToMsg) {
      metadata.replyTo = { id: replyToMsg.id, sender: replyToMsg.sender, content: replyToMsg.content };
      setReplyToMsg(null);
    }
    if (attachment) {
      metadata.attachment = attachment;
      setAttachment(null);
    }
    
    try {
      await onSendMessage(content, metadata);
    } catch (e) {
      console.error(e);
      if (!overrideContent) setInputValue(content); // Restore on fail
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    
    // For small demo purposes, we'll read it as a Data URL (base64)
    // In production, this should upload to a real cloud storage bucket
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setAttachment({
        type: isImage ? 'image' : 'file',
        url: isImage ? url : file.name
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = (acceptType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#050810]/30 relative">
      {activeConv ? (
        <>
          {/* Chat Header */}
          <div className="h-14 md:h-16 px-3 md:px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0 bg-[#090d16] z-10">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile back button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="md:hidden w-8 h-8 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeConv.color || 'from-emerald-500 to-teal-500'} flex items-center justify-center text-white text-xs font-bold font-poppins`}>
                {activeConv.avatar || 'DM'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-poppins">{activeConv.name}</p>
                <p className="text-[10px] text-emerald-400 font-poppins flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={onSummarize}
                  disabled={isSummarizing}
                  className="px-3 h-9 mr-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-[11px] transition-colors disabled:opacity-50"
                  title="Summarize this thread with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 sm:mr-1.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
                </button>
              )}
              <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Pin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-5 custom-scrollbar">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 > 0.3 ? 0 : i * 0.03 }}
                className={`flex group ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] md:max-w-[65%] flex flex-col relative ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name */}
                  {!msg.isOwn && <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.sender}</span>}
                  
                  <div className={`flex items-center gap-2 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Message Bubble Container */}
                    <div className={`rounded-2xl px-4 py-3 text-[13px] font-poppins leading-relaxed relative ${
                      msg.isOwn
                        ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md'
                        : 'bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-bl-md'
                    }`}>
                      
                      {/* Replied To Block */}
                      {msg.metadata?.replyTo && (
                        <div className={`mb-2 p-2 rounded-lg text-[11px] border-l-2 ${msg.isOwn ? 'bg-black/20 border-primary/50 text-slate-300' : 'bg-black/20 border-slate-500 text-slate-400'}`}>
                          <span className="font-semibold">{msg.metadata.replyTo.sender}</span>
                          <p className="truncate opacity-80">{msg.metadata.replyTo.content}</p>
                        </div>
                      )}

                      {/* Attachment Rendering */}
                      {msg.metadata?.attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                          {msg.metadata.attachment.type === 'image' ? (
                            <img src={msg.metadata.attachment.url} alt="attachment" className="max-w-full h-auto object-cover max-h-48" />
                          ) : (
                            <div className="p-3 bg-black/20 flex items-center gap-2 text-xs">
                              <Paperclip className="w-4 h-4 text-emerald-400" />
                              <span>{msg.metadata.attachment.url}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actual Content */}
                      {msg.content}
                    </div>

                    {/* Hover Actions (Reply, React) */}
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/80 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-sm`}>
                      <button onClick={() => setReplyToMsg(msg)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Reply">
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      {onReact && (
                        <>
                          <button onClick={() => onReact(msg.id, '👍')} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="React 👍">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onReact(msg.id, '❤️')} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="React ❤️">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Meta Row: Time & Reactions */}
                  <div className={`flex items-center gap-1.5 mt-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-500 font-poppins">{msg.time}</span>
                    {msg.isOwn && <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? 'text-primary-glow' : 'text-slate-500'}`} />}
                    
                    {/* Reactions Display */}
                    {msg.metadata?.reactions && msg.metadata.reactions.length > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        {msg.metadata.reactions.map((emoji: string, idx: number) => (
                          <span key={idx} className="bg-white/5 border border-white/10 text-[10px] px-1.5 py-0.5 rounded-full">
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Smart Replies Container */}
          <AnimatePresence>
            {smartReplies.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-6 pb-3 flex items-center gap-2 overflow-x-auto custom-scrollbar"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {smartReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium font-poppins whitespace-nowrap transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="px-3 md:px-6 py-3 md:py-4 border-t border-white/[0.06] bg-[#090d16] relative z-20">
            
            {/* Attachment Preview */}
            <AnimatePresence>
              {attachment && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-[calc(100%+10px)] left-6 p-2 bg-[#121826] border border-white/10 rounded-xl shadow-xl flex items-center gap-3"
                >
                  {attachment.type === 'image' ? (
                    <img src={attachment.url} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply Preview */}
            <AnimatePresence>
              {replyToMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-3 pl-3 border-l-2 border-primary/50 relative bg-primary/5 p-2 rounded-r-lg"
                >
                  <span className="text-[10px] text-primary-glow font-bold block mb-0.5">Replying to {replyToMsg.sender}</span>
                  <p className="text-xs text-slate-300 truncate pr-6">{replyToMsg.content}</p>
                  <button onClick={() => setReplyToMsg(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-1">
                <button onClick={() => triggerFileSelect('.pdf,.doc,.docx,.txt')} className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors" title="Attach file">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button onClick={() => triggerFileSelect('image/*')} className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors" title="Attach image">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-[44px] px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center focus-within:border-primary/30 transition-all">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins py-3" 
                />
                <button className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors ml-2">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={(!inputValue.trim() && !attachment) || isSending}
                className="w-11 h-11 shrink-0 rounded-xl bg-primary hover:bg-primary-glow flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-poppins">
          <MessageCircle className="w-12 h-12 mb-4 text-white/10" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};
