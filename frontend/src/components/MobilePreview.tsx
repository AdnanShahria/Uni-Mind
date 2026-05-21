import { motion } from 'framer-motion';
import { Smartphone, LayoutGrid, MessageCircle, Search, Sparkles, CheckCheck } from 'lucide-react';

export const MobilePreview = () => {
  return (
    <section className="py-24 relative z-10 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
          Intelligence in your <span className="text-gradient">Pocket</span>
        </h2>
        <p className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto">
          Take your entire academic ecosystem on the go. Seamlessly sync notes, chat with AI, and stay connected with your university community.
        </p>

        <div className="flex justify-center gap-8 flex-wrap">
          {[
            { icon: MessageCircle, title: 'AI Chat' },
            { icon: LayoutGrid, title: 'Notes Feed' },
            { icon: Smartphone, title: 'Study Planner' }
          ].map((app, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative w-64 h-[500px] rounded-[3rem] border-8 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl"
            >
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-20"></div>
              
              {/* Screen Content */}
              <div className="absolute inset-0 pt-10 px-3 bg-gradient-to-b from-slate-950 to-[#050810] flex flex-col">
                  {/* Phone Status/Header Bar */}
                  <div className="h-6 w-full flex justify-between items-center px-2 text-[9px] text-slate-500 font-poppins font-semibold border-b border-white/5 pb-1 mb-4 mt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="UniMind Core Sync"></span>
                      <span>5G</span>
                    </div>
                  </div>

                  {/* App Icon and Title Header */}
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <app.icon className="w-4 h-4 text-primary-glow" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold text-xs leading-none font-poppins">{app.title}</h4>
                      <span className="text-[7.5px] text-slate-500 font-poppins mt-0.5 block">UniMind Mobile</span>
                    </div>
                  </div>

                  {/* High Fidelity Visuals based on the phone type */}
                  {index === 0 && (
                    /* AI Chat High-Fidelity UI */
                    <div className="flex-1 flex flex-col gap-3 font-poppins text-left">
                      {/* AI Bubble */}
                      <div className="bg-[#0b1021] border border-primary/20 rounded-2xl rounded-tl-sm p-2.5 text-[9.5px] text-slate-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-primary-glow animate-pulse" />
                          <span className="text-[8px] font-bold tracking-wider text-primary-glow uppercase">AI Tutor</span>
                        </div>
                        Hey Adnan! Ready for your <span className="text-secondary-glow font-medium">Physics quiz</span>? Here's Faraday's law: magnetic flux changes induce EMF! ⚡
                      </div>

                      {/* User Bubble */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm p-2.5 text-[9.5px] text-slate-300 self-end w-[85%]">
                        That makes sense! Can you explain organic synthesis next?
                      </div>

                      {/* AI Bubble 2 */}
                      <div className="bg-[#0b1021] border border-primary/20 rounded-2xl rounded-tl-sm p-2.5 text-[9.5px] text-slate-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-primary-glow animate-pulse" />
                          <span className="text-[8px] font-bold tracking-wider text-primary-glow uppercase">AI Tutor</span>
                        </div>
                        Sure! Think of it as building a house using molecular bricks. We prioritize the <span className="text-accent-glow font-medium">shortest pathway</span>...
                      </div>

                      {/* Input mockup at the bottom */}
                      <div className="mt-auto mb-4 h-8 bg-white/5 rounded-full border border-white/10 flex items-center px-3 justify-between text-[9px] text-slate-500">
                        <span>Ask AI Tutor anything...</span>
                        <Sparkles className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    /* Notes Feed High-Fidelity UI */
                    <div className="flex-1 flex flex-col gap-2.5 font-poppins text-left">
                      {/* Search Bar mockup */}
                      <div className="h-7 w-full bg-white/5 border border-white/10 rounded-lg flex items-center px-2 text-[9px] text-slate-500 gap-1.5 mb-1.5">
                        <Search className="w-3 h-3 text-slate-500" />
                        <span>Search notes feed...</span>
                      </div>

                      {/* Note Item 1 */}
                      <div className="p-2.5 rounded-xl bg-[#0f1423] border border-white/5 hover:border-primary-glow/20 transition-colors flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-slate-200 leading-none">Machine Learning v2</span>
                          <span className="text-[7.5px] bg-primary/10 border border-primary/20 text-primary-glow px-1.5 py-0.5 rounded-full">MIT</span>
                        </div>
                        <span className="text-[8px] text-slate-500">By Prof. Li • 12k downloads</span>
                        <div className="flex gap-1 mt-1">
                          <span className="text-[7px] text-slate-400 bg-white/5 px-1 py-0.2 rounded font-medium">#AI</span>
                          <span className="text-[7px] text-slate-400 bg-white/5 px-1 py-0.2 rounded font-medium">#Python</span>
                        </div>
                      </div>

                      {/* Note Item 2 */}
                      <div className="p-2.5 rounded-xl bg-[#0f1423] border border-white/5 hover:border-secondary-glow/20 transition-colors flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-slate-200 leading-none">Organic Chemistry II</span>
                          <span className="text-[7.5px] bg-secondary/10 border border-secondary/20 text-secondary-glow px-1.5 py-0.5 rounded-full">Stanford</span>
                        </div>
                        <span className="text-[8px] text-slate-500">By Elena Rostova • 8.4k downloads</span>
                        <div className="flex gap-1 mt-1">
                          <span className="text-[7px] text-slate-400 bg-white/5 px-1 py-0.2 rounded font-medium">#Chemistry</span>
                          <span className="text-[7px] text-slate-400 bg-white/5 px-1 py-0.2 rounded font-medium">#PreMed</span>
                        </div>
                      </div>

                      {/* Note Item 3 */}
                      <div className="p-2.5 rounded-xl bg-[#0f1423] border border-white/5 hover:border-accent-glow/20 transition-colors flex flex-col gap-1 opacity-70">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-slate-200 leading-none">Microeconomics 101</span>
                          <span className="text-[7.5px] bg-accent/10 border border-accent/20 text-accent-glow px-1.5 py-0.5 rounded-full">Harvard</span>
                        </div>
                        <span className="text-[8px] text-slate-500 text-slate-400">By Prof. Davis • 4.1k downloads</span>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    /* Study Planner High-Fidelity UI */
                    <div className="flex-1 flex flex-col gap-2.5 font-poppins text-left">
                      <div className="flex justify-between items-center px-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Schedule</span>
                        <span className="text-[8px] text-primary-glow font-medium">May 21</span>
                      </div>

                      {/* Active Task (Glows!) */}
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-950/20 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] flex flex-col gap-1 relative overflow-hidden">
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[6.5px] text-emerald-400 font-semibold leading-none">Live Room</span>
                        </div>
                        <span className="text-[10.5px] font-semibold text-white leading-none">Physics Midterm Prep</span>
                        <span className="text-[8px] text-slate-400 mt-1 block">3:00 PM - 4:30 PM • Live Room 4</span>
                        <span className="text-[8.5px] text-primary-glow font-medium mt-1">Sarah & 12 others are in</span>
                      </div>

                      {/* Completed Task */}
                      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-1 opacity-70 relative">
                        <div className="absolute top-2 right-2.5">
                          <CheckCheck className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-[10.5px] font-semibold text-slate-300 leading-none line-through">Organic Chemistry lab</span>
                        <span className="text-[8px] text-slate-500 mt-1 block">10:00 AM • Submitted</span>
                      </div>

                      {/* Upcoming Task */}
                      <div className="p-2.5 rounded-xl bg-[#0f1423] border border-white/5 flex flex-col gap-1">
                        <span className="text-[10.5px] font-semibold text-slate-300 leading-none">AI Flashcards Revision</span>
                        <span className="text-[8px] text-slate-500 mt-1 block">8:00 PM • Spaced Repetition</span>
                        <div className="flex gap-1.5 items-center mt-1 text-[7.5px] text-secondary-glow font-medium bg-secondary/10 px-1.5 py-0.5 rounded w-fit">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Spaced Repetition</span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
