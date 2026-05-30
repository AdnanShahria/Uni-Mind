import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Lock, RotateCw, ArrowLeft, ArrowRight, Share2, Eye } from 'lucide-react';
import { MockInnerView } from './MockInnerView';

export const ShowcaseBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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
            Take a guided tour through your unified research dashboard. Experience real-time collaboration and AI-powered insights.
          </p>
        </div>

        {/* 3D Animated Showcase Container */}
        <motion.div 
          style={{ rotateX, scale, opacity }}
          className="w-full relative rounded-2xl border border-white/10 overflow-hidden bg-[#0A0D1A]/50 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] p-2 group/browser"
        >
          {/* Detailed macOS Browser Mock Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0B0F19] rounded-t-xl select-none">
            {/* Control dots with inner symbols showing on hover */}
            <div className="flex gap-1.5 group/dots">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 flex items-center justify-center text-[6px] text-black/60 font-bold hover:bg-[#E0443E] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">-</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 flex items-center justify-center text-[6px] text-black/60 font-bold hover:bg-[#DEA123] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">x</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 flex items-center justify-center text-[6px] text-black/60 font-bold hover:bg-[#1AAB2E] transition-all cursor-pointer relative">
                <span className="opacity-0 group-hover/dots:opacity-100 absolute">+</span>
              </span>
            </div>

            {/* Navigation Arrows & SSL Address Bar */}
            <div className="flex items-center gap-4 flex-1 justify-center max-w-xl mx-auto px-4">
              <div className="flex items-center gap-2.5 text-slate-500">
                <ArrowLeft className="w-3 h-3 hover:text-slate-300 transition-colors cursor-pointer" />
                <ArrowRight className="w-3 h-3 hover:text-slate-300 transition-colors cursor-pointer" />
                <RotateCw className="w-3 h-3 hover:text-slate-300 transition-colors cursor-pointer" />
              </div>

              {/* URL Field */}
              <div className="flex-1 flex items-center justify-between h-6 bg-[#151B2B] rounded-md px-2.5 border border-white/5 text-[10px] text-slate-400 font-medium font-poppins select-all">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-2.5 h-2.5 text-emerald-500/80" />
                  <span className="text-slate-400">unimind.app</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">workspace</span>
                </div>
                <div className="text-[8px] text-slate-600 border border-slate-700/50 rounded px-1.5 py-0.2 bg-slate-900/50">
                  Secure
                </div>
              </div>
            </div>

            {/* Window utility actions */}
            <div className="flex items-center gap-2">
              <button className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center">
                <Share2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Banner Body Wrapper using MockInnerView */}
          <div className="relative overflow-hidden rounded-b-xl select-none">
            <MockInnerView />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
