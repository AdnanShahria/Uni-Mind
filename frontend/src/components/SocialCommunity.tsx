import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users2, 
  Globe2, 
  Shapes, 
  Heart, 
  Share2, 
  Bookmark, 
  Sparkles, 
  Send, 
  MoreHorizontal, 
  Smile, 
  Paperclip
} from 'lucide-react';

export const SocialCommunity = () => {
  return (
    <section id="communities" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel mb-6 border-secondary/30">
            <Globe2 className="w-4 h-4 text-secondary-glow" />
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-glow">Social Ecosystem</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6 leading-tight">
            Facebook for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-glow to-primary-glow">Education + AI</span>
          </h2>
          
          <p className="text-lg text-slate-400 mb-8">
            Connect seamlessly with peers, join department groups, and form global research communities. Real-time messenger, study rooms, and a student feed tailored to your academic life.
          </p>

          <ul className="space-y-4">
            {[
              { icon: Users2, text: 'Department & University Groups' },
              { icon: MessageSquare, text: 'Real-time Study Rooms & Messenger' },
              { icon: Shapes, text: 'Global Research Collaboration' }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <item.icon className="w-4 h-4 text-secondary-glow" />
                </div>
                <span className="font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Mockups */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[500px]"
        >
          {/* Main Feed Mockup */}
          <div className="absolute top-0 right-10 w-[320px] h-[425px] glass-card rounded-2xl p-4 shadow-2xl border-secondary/20 z-20 hover:scale-105 transition-all duration-300">
            {/* Post Header */}
            <div className="h-10 w-full flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-[10px] font-bold text-white shadow-lg border border-white/10">
                  SJ
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white font-poppins leading-none">Sarah Jenkins</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active now"></div>
                  </div>
                  <div className="text-[9px] text-slate-400 font-poppins font-light leading-none mt-1">Stanford • Physics Dept</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-500 font-poppins">15m ago</span>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
              </div>
            </div>

            {/* Post Content */}
            <p className="text-[10.5px] text-slate-300 font-poppins font-light leading-relaxed mb-3">
              Uploaded our group's <span className="text-secondary-glow font-medium">Quantum Coherence model</span>. The AI successfully synthesized state vector correlations! Check the topology map below:
            </p>

            {/* Visual Media Graphic (Sleek vector/topology node map) */}
            <div className="h-40 w-full bg-[#070b16] border border-white/5 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              
              {/* Gradient glows */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>

              {/* Graphic Elements (Interactive looking network graph) */}
              <svg className="w-full h-full p-3 absolute inset-0 z-10" viewBox="0 0 200 120">
                {/* Connecting Lines */}
                <line x1="40" y1="70" x2="100" y2="40" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="100" y1="40" x2="160" y2="80" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="40" y1="70" x2="160" y2="80" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
                <line x1="100" y1="40" x2="100" y2="95" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
                
                {/* Node A (Primary) */}
                <circle cx="40" cy="70" r="6" fill="#3b82f6" className="animate-pulse" />
                <circle cx="40" cy="70" r="10" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.4" />
                <text x="25" y="85" fill="#60a5fa" fontSize="6" fontFamily="Poppins" fontWeight="bold">|ψ_A⟩</text>

                {/* Node B (Secondary) */}
                <circle cx="100" cy="40" r="8" fill="#8b5cf6" />
                <circle cx="100" cy="40" r="13" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
                <text x="88" y="24" fill="#a78bfa" fontSize="6" fontFamily="Poppins" fontWeight="bold">Quantum OS</text>

                {/* Node C (Accent) */}
                <circle cx="160" cy="80" r="5" fill="#06b6d4" />
                <circle cx="160" cy="80" r="8" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
                <text x="145" y="94" fill="#22d3ee" fontSize="6" fontFamily="Poppins" fontWeight="bold">|ψ_B⟩</text>

                {/* Node D (Center Detail) */}
                <circle cx="100" cy="95" r="4" fill="#10b981" />
                <text x="110" y="98" fill="#34d399" fontSize="5" fontFamily="Poppins">Coherence: 98%</text>
              </svg>

              {/* Status bar */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-md px-2 py-1 flex items-center justify-between z-25">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-secondary-glow animate-pulse" />
                  <span className="text-[7.5px] text-slate-300 font-poppins font-medium">AI-Synthesized Topology</span>
                </div>
                <span className="text-[7.5px] text-emerald-400 font-poppins font-semibold">Ready</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              <span className="text-[8.5px] font-poppins text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium">#Quantum</span>
              <span className="text-[8.5px] font-poppins text-secondary-glow bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full font-medium">#Physics</span>
              <span className="text-[8.5px] font-poppins text-accent-glow bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full font-medium">#Research</span>
            </div>

            {/* Reactions Footer */}
            <div className="flex items-center justify-between text-slate-500 border-t border-white/5 pt-2.5 text-[9.5px]">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 hover:text-red-400 transition-colors group">
                  <Heart className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>42</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary-glow transition-colors group">
                  <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>15</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="hover:text-slate-300 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="hover:text-slate-300 transition-colors">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messenger Mockup */}
          <div className="absolute bottom-0 left-0 w-[270px] h-[310px] bg-[#0b0f19]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-primary/20 z-30 transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
             <div className="flex flex-col h-full">
                {/* Chat Partner Header */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md">
                      AR
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0b0f19]"></div>
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-semibold text-white font-poppins leading-none">Alex Rivera</h5>
                    <span className="text-[7.5px] text-emerald-400 font-poppins font-medium mt-1 block">Physics study group host</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto mb-3 pr-1">
                   <div className="self-end bg-primary/10 border border-primary/25 p-2 px-3 text-[10px] text-slate-100 rounded-2xl rounded-tr-sm w-[85%] font-poppins font-light leading-relaxed">
                     Hey, want to join the physics study room?
                   </div>
                   <div className="self-start bg-white/5 border border-white/10 p-2 px-3 text-[10px] text-slate-200 rounded-2xl rounded-tl-sm w-[85%] font-poppins font-light leading-relaxed">
                     <span className="font-semibold text-secondary-glow block text-[8px] mb-0.5">Alex</span>
                     Sure! Let's review chapter 4.
                   </div>
                   <div className="self-end bg-primary/10 border border-primary/25 p-2 px-3 text-[10px] text-slate-100 rounded-2xl rounded-tr-sm w-[80%] font-poppins font-light leading-relaxed">
                     <div className="flex items-center justify-between gap-1 mb-1">
                       <span className="text-[8.5px] text-primary-glow font-medium">Study Room Link</span>
                       <Sparkles className="w-2.5 h-2.5 text-primary-glow" />
                     </div>
                     Sending the invite now...
                   </div>
                </div>

                {/* Chat Input */}
                <div className="mt-auto h-8 bg-white/5 rounded-full flex items-center px-3 border border-white/10 justify-between">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Smile className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                    <span className="text-[9.5px] text-slate-500 font-poppins">Type a message...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                    <button className="w-5.5 h-5.5 rounded-full bg-primary/20 flex items-center justify-center text-primary-glow hover:bg-primary/30 transition-colors">
                      <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
             </div>
          </div>

          {/* Decorative Blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/30 blur-[100px] -z-10 rounded-full"></div>
        </motion.div>

      </div>
    </section>
  );
};
