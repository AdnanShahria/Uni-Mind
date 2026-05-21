import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Lock, RotateCw, ArrowLeft, ArrowRight, Sparkles, Share2, Eye } from 'lucide-react';

interface Hotspot {
  id: number;
  top: string;
  left: string;
  title: string;
  description: string;
  badge: string;
  color: string;
}

const hotspots: Hotspot[] = [
  {
    id: 1,
    top: '32%',
    left: '8%',
    title: 'Smart Sidebar',
    description: 'Instantly toggle between student cohorts, study notebooks, and custom subject directories.',
    badge: 'Navigation',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    top: '12%',
    left: '82%',
    title: 'Cognitive Synth AI',
    description: 'Trigger real-time summarization, semantic graph linking, and personalized study roadmaps.',
    badge: 'AI Engine',
    color: 'from-violet-500 to-fuchsia-500'
  },
  {
    id: 3,
    top: '65%',
    left: '50%',
    title: 'Multiplayer Research Canvas',
    description: 'Collaborate live with peers on infinite graph structures to map connections across papers.',
    badge: 'DeepWork Graph',
    color: 'from-emerald-500 to-teal-500'
  }
];

export const ShowcaseBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Hook scroll progress relative to this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth scroll transformations for Stripe/Linear 3D rotation effects
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.45], [12, 0]), {
    stiffness: 75,
    damping: 18
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.45], [0.92, 1.0]), {
    stiffness: 75,
    damping: 18
  });
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.4, 1]);

  return (
    <section 
      ref={containerRef}
      id="platform-preview" 
      className="py-24 relative overflow-hidden bg-[#030712] z-20 flex flex-col items-center justify-center"
      style={{ perspective: '1200px' }}
    >
      {/* Background Volumetric Neon Glowing Backdrops */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-4/5 h-[350px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/5 rounded-full blur-[130px] opacity-70 pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[10%] left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      </div>

      <div className="w-full max-w-[85rem] mx-auto px-6 md:px-12 xl:px-20 relative z-10 flex flex-col items-center">
        {/* Banner Section Header */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Eye className="w-4 h-4 text-primary-glow animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-glow font-poppins">Workspace Environment</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-medium font-garamond mb-4 text-white tracking-tight leading-tight">
            Designed for <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 font-semibold">Deep Focus</span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 font-poppins font-light leading-relaxed">
            Take a guided tour through your unified research dashboard. Click on the glowing core nodes to explore special built-in cognitive modules.
          </p>
        </div>

        {/* 3D Animated Showcase Container */}
        <motion.div 
          style={{ rotateX, scale, opacity }}
          className="w-full relative rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D1A]/50 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] p-2 group/browser"
        >
          {/* Detailed macOS Browser Mock Top Bar */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#0B0F19] rounded-t-xl select-none">
            {/* Control dots with inner symbols showing on hover */}
            <div className="flex gap-2 group/dots">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]/80 flex items-center justify-center text-[7px] text-black/60 font-bold hover:bg-[#E0443E] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">-</span>
              </span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 flex items-center justify-center text-[7px] text-black/60 font-bold hover:bg-[#DEA123] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">x</span>
              </span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F]/80 flex items-center justify-center text-[7px] text-black/60 font-bold hover:bg-[#1AAB2E] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">+</span>
              </span>
            </div>

            {/* Navigation Arrows & SSL Address Bar */}
            <div className="flex items-center gap-6 flex-1 justify-center max-w-xl mx-auto px-4">
              <div className="flex items-center gap-3.5 text-slate-500">
                <ArrowLeft className="w-3.5 h-3.5 hover:text-slate-300 transition-colors cursor-pointer" />
                <ArrowRight className="w-3.5 h-3.5 hover:text-slate-300 transition-colors cursor-pointer" />
                <RotateCw className="w-3.5 h-3.5 hover:text-slate-300 transition-colors cursor-pointer" />
              </div>

              {/* URL Field */}
              <div className="flex-1 flex items-center justify-between h-7 bg-[#151B2B] rounded-lg px-3 border border-white/5 text-[11px] text-slate-400 font-medium font-poppins select-all">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3 h-3 text-emerald-500/80" />
                  <span className="text-slate-400">unimind.app</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">workspace</span>
                </div>
                <div className="text-[9px] text-slate-600 border border-slate-700/50 rounded px-1.5 py-0.5">
                  Secure
                </div>
              </div>
            </div>

            {/* Window utility actions */}
            <div className="flex items-center gap-3">
              <button className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1">
                <Share2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Banner Body Wrapper */}
          <div className="relative overflow-hidden rounded-b-xl select-none">
            {/* The Actual Banner Showcase Asset */}
            <img 
              src="/Banner_1.png" 
              className="w-full h-auto object-cover border-t border-white/5 rounded-b-xl select-none pointer-events-none"
              alt="UniMind DeepWork Platform Workspace Showcase"
            />

            {/* Glowing Interactive Hotspot Node System */}
            {hotspots.map((hotspot) => {
              const isActive = activeHotspot === hotspot.id;
              return (
                <div 
                  key={hotspot.id}
                  className="absolute"
                  style={{ top: hotspot.top, left: hotspot.left }}
                >
                  {/* Glowing Node Button */}
                  <button
                    onClick={() => setActiveHotspot(isActive ? null : hotspot.id)}
                    className="relative w-7 h-7 flex items-center justify-center cursor-pointer group/node z-30 focus:outline-none"
                    title={`Explore ${hotspot.title}`}
                  >
                    {/* Ring scale animations */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping opacity-60 pointer-events-none" />
                    <span className="absolute inline-flex h-5 w-5 rounded-full bg-gradient-to-r from-primary to-secondary blur-[4px] opacity-80 group-hover/node:scale-125 transition-transform duration-300" />
                    
                    {/* Centered Node Solid Bullet */}
                    <div className="relative w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_#fff]">
                      <Sparkles className="w-2 h-2 text-violet-600" />
                    </div>
                  </button>

                  {/* High Fidelity Glass Tooltip Popup Card */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", stiffness: 150, damping: 15 }}
                        className="absolute bottom-10 -left-28 w-60 p-4 rounded-xl border border-white/15 bg-slate-950/85 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-40"
                      >
                        {/* Title Header with custom gradient badges */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r ${hotspot.color} text-white`}>
                            {hotspot.badge}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHotspot(null);
                            }}
                            className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-bold font-poppins"
                          >
                            ×
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1.5 font-poppins">{hotspot.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-poppins">{hotspot.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
