import { motion } from 'framer-motion';
import { Phone, Video, Pin, MessageCircle, Paperclip, Image, Smile, Send, CheckCheck } from 'lucide-react';

export const ChatArea = ({ activeConv, messages }: { activeConv: any; messages: any[] }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {activeConv ? (
        <>
          {/* Chat Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeConv.color || 'from-emerald-500 to-teal-500'} flex items-center justify-center text-white text-xs font-bold font-poppins`}>
                {activeConv.avatar || 'DM'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-poppins">{activeConv.name}</p>
                <p className="text-[10px] text-emerald-400 font-poppins flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[65%] ${msg.isOwn ? 'order-last' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-[13px] font-poppins leading-relaxed ${
                    msg.isOwn
                      ? 'bg-primary/20 border border-primary/20 text-slate-100 rounded-br-md'
                      : 'bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-500 font-poppins">{msg.time}</span>
                    {msg.isOwn && msg.read && <CheckCheck className="w-3.5 h-3.5 text-primary-glow" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-[#050810]/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <Image className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center focus-within:border-primary/30 transition-all">
                <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins" />
                <button className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-glow flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Send className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
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
