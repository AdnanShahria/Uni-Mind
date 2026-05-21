import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-[#050811]/90 backdrop-blur-2xl border-t border-l border-r border-white/10 rounded-t-[32px] md:rounded-t-[48px] pt-20 pb-8 mt-24 overflow-hidden z-10">
      {/* Decorative Grid and Blur Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Curved Border Glowing Lightbar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent" />
      
      {/* Ambient background glows */}
      <div className="absolute -top-24 left-[10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute -top-24 right-[10%] w-[350px] h-[350px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 mb-16">
          
          {/* Card 1: Brand & Mission */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-[#0b0f19]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:border-primary/30 hover:bg-[#0b0f19]/70 hover:-translate-y-1 shadow-[0_4px_35px_rgba(0,0,0,0.2)] h-full">
            <div className="flex items-center gap-2.5 group cursor-pointer w-fit">
              <div className="w-9 h-9 rounded-xl border border-primary/30 group-hover:border-primary/50 transition-colors overflow-hidden flex items-center justify-center bg-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <img src="/logo.png" className="w-full h-full object-cover rounded-xl" alt="UniMind Logo" />
              </div>
              <span className="text-2xl font-bold font-outfit tracking-wider text-slate-100">
                UNI<span className="text-gradient">MIND</span>
              </span>
            </div>
            
            <p className="text-slate-400 font-poppins font-light text-xs leading-relaxed max-w-sm">
              The complete AI-powered academic operating system and educational social ecosystem. Designed for deep work, collaborative research, and smart learning.
            </p>

            {/* Live System Status Indicator */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg w-fit mt-auto">
              <Cpu className="w-3.5 h-3.5 text-primary-glow animate-pulse" />
              <span className="text-[9.5px] text-slate-400 font-poppins font-medium">Core Engine v2.1.2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          
          {/* Card 2: Product Links */}
          <div className="bg-[#0b0f19]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-primary/30 hover:bg-[#0b0f19]/70 hover:-translate-y-1 shadow-[0_4px_35px_rgba(0,0,0,0.2)] h-full">
            <h4 className="font-semibold text-white font-poppins text-sm tracking-wide">Product</h4>
            <ul className="space-y-3 text-slate-400 font-poppins font-light text-sm">
              <li><a href="#features" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Features</a></li>
              <li><a href="#ai-system" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">AI System</a></li>
              <li><a href="#communities" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Communities</a></li>
              <li><a href="#research" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Research Hub</a></li>
            </ul>
          </div>
          
          {/* Card 3: Ecosystem Links */}
          <div className="bg-[#0b0f19]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-primary/30 hover:bg-[#0b0f19]/70 hover:-translate-y-1 shadow-[0_4px_35px_rgba(0,0,0,0.2)] h-full">
            <h4 className="font-semibold text-white font-poppins text-sm tracking-wide">Ecosystem</h4>
            <ul className="space-y-3 text-slate-400 font-poppins font-light text-sm">
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">AI Tutor Chat</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Smart Notes Feed</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Study Planner</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Virtual Classrooms</a></li>
            </ul>
          </div>
          
          {/* Card 4: Legal & Trust Links */}
          <div className="bg-[#0b0f19]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-primary/30 hover:bg-[#0b0f19]/70 hover:-translate-y-1 shadow-[0_4px_35px_rgba(0,0,0,0.2)] h-full">
            <h4 className="font-semibold text-white font-poppins text-sm tracking-wide">Legal & Trust</h4>
            <ul className="space-y-3 text-slate-400 font-poppins font-light text-sm">
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Institutional SLA</a></li>
              <li><a href="#" className="hover:text-primary-glow hover:translate-x-1 inline-block transition-all duration-300">Compliance & Security</a></li>
            </ul>
          </div>

          {/* Card 5: Newsletter Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-[#0b0f19]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-primary/30 hover:bg-[#0b0f19]/70 hover:-translate-y-1 shadow-[0_4px_35px_rgba(0,0,0,0.2)] h-full justify-between">
            <h4 className="font-semibold text-white font-poppins text-sm tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary-glow" /> Stay Synchronized
            </h4>
            <p className="text-slate-400 font-poppins font-light text-xs leading-relaxed">
              Subscribe to get the latest announcements, feature rollouts, and research reports.
            </p>
            <div className="relative mt-auto w-full">
              <input 
                type="email" 
                placeholder="Enter academic email" 
                className="w-full h-11 bg-white/5 border border-white/10 focus:border-primary-glow/50 rounded-xl px-4 pr-12 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all duration-300 font-poppins"
              />
              <button className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-primary hover:bg-primary-glow text-white flex items-center justify-center transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="border-t border-white/5 pt-8 flex items-center justify-center text-xs text-slate-500 font-poppins">
          <p>
            © 2026, all rights reserved by{' '}
            <a 
              href="https://orbitsaas.cloud" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-glow hover:text-white transition-colors underline decoration-dotted font-medium"
            >
              ORBIT SaaS
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};
