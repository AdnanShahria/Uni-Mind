import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Pin, MessageCircle, Paperclip, Image as ImageIcon, Smile, Send, CheckCheck, Sparkles, Reply, X, ThumbsUp, Heart, ArrowLeft, Download, FileText } from 'lucide-react';
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
  const [attachments, setAttachments] = useState<{ type: string, name: string, url: string }[]>([]);
  const [activeViewAttachment, setActiveViewAttachment] = useState<{ type: string, name: string, url: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, smartReplies, replyToMsg, attachments]);

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAttachmentClick = (att: any) => {
    setActiveViewAttachment(att);
  };

  const handleDownloadAttachment = (att: { name: string, url: string }) => {
    const link = document.createElement('a');
    link.href = att.url;
    link.download = att.name || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async (overrideContent?: string) => {
    const content = overrideContent || inputValue;
    if ((!content.trim() && attachments.length === 0) || isSending) return;
    
    setIsSending(true);
    setInputValue(''); // Optimistic clear
    
    const metadata: any = {};
    if (replyToMsg) {
      metadata.replyTo = { id: replyToMsg.id, sender: replyToMsg.sender, content: replyToMsg.content };
      setReplyToMsg(null);
    }
    if (attachments.length > 0) {
      metadata.attachments = attachments;
      setAttachments([]);
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      // For small demo purposes, we'll read it as a Data URL (base64)
      // In production, this should upload to a real cloud storage bucket
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAttachments(prev => [...prev, {
          type: isImage ? 'image' : isPdf ? 'pdf' : 'file',
          name: file.name,
          url: url
        }]);
      };
      reader.readAsDataURL(file);
    });
    
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
                        <div 
                          onClick={() => handleAttachmentClick({ type: msg.metadata.attachment.type, name: 'Attachment', url: msg.metadata.attachment.url })}
                          className="mb-2 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {msg.metadata.attachment.type === 'image' ? (
                            <img src={msg.metadata.attachment.url} alt="attachment" className="max-w-full h-auto object-cover max-h-48" />
                          ) : (
                            <div className="p-3 bg-black/20 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-emerald-400" />
                                <span className="truncate max-w-[150px]">{msg.metadata.attachment.url}</span>
                              </div>
                              <Download className="w-4 h-4 text-slate-400 hover:text-white shrink-0" />
                            </div>
                          )}
                        </div>
                      )}

                      {msg.metadata?.attachments && msg.metadata.attachments.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {msg.metadata.attachments.map((att: any, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => handleAttachmentClick(att)}
                              className="rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              {att.type === 'image' ? (
                                <img src={att.url} alt="attachment" className="max-w-full h-auto object-cover max-h-48" />
                              ) : (
                                <div className="p-3 bg-black/20 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 truncate">
                                    <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="truncate max-w-[150px]">{att.name || 'Attachment'}</span>
                                  </div>
                                  <Download className="w-4 h-4 text-slate-400 hover:text-white shrink-0" />
                                </div>
                              )}
                            </div>
                          ))}
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
              {attachments.length > 0 && (
                <div className="absolute bottom-[calc(100%+10px)] left-6 flex flex-wrap gap-2 max-w-[calc(100%-48px)] max-h-40 overflow-y-auto p-2 bg-[#121826] border border-white/10 rounded-xl shadow-xl z-50">
                  {attachments.map((att, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="relative p-2 bg-[#1a2336] border border-white/10 rounded-lg flex items-center gap-3 pr-8"
                    >
                      {att.type === 'image' ? (
                        <img src={att.url} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                          <Paperclip className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                      <span className="text-[10px] text-slate-300 max-w-[100px] truncate">{att.name}</span>
                      <button onClick={() => removeAttachment(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
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
                multiple
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
                disabled={(!inputValue.trim() && attachments.length === 0) || isSending}
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

      {/* File Viewer Modal */}
      <AnimatePresence>
        {activeViewAttachment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveViewAttachment(null)}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#0b1324] border border-white/[0.08] rounded-2xl p-4 shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2 text-white font-poppins text-sm font-semibold truncate max-w-[70%]">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{activeViewAttachment.name || 'File'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAttachment(activeViewAttachment)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveViewAttachment(null)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-0">
                {activeViewAttachment.type === 'image' ? (
                  <img 
                    src={activeViewAttachment.url} 
                    alt={activeViewAttachment.name} 
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" 
                  />
                ) : activeViewAttachment.type === 'pdf' || activeViewAttachment.url.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={activeViewAttachment.url} 
                    title={activeViewAttachment.name}
                    className="w-full h-[70vh] rounded-lg border border-white/10 bg-white" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-400 font-poppins">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-sm font-medium text-white mb-2">{activeViewAttachment.name}</p>
                    <p className="text-xs text-slate-500 mb-6">This file type cannot be previewed directly. You can download it to view it on your device.</p>
                    <button
                      onClick={() => handleDownloadAttachment(activeViewAttachment)}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
