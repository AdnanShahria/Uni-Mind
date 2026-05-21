import { motion } from 'framer-motion';
import { Building2, Users, UploadCloud, BrainCircuit } from 'lucide-react';

const steps = [
  { icon: Building2, title: 'Join your Institution', desc: 'Connect to your university network instantly.' },
  { icon: Users, title: 'Connect with Community', desc: 'Find study groups, peers, and researchers.' },
  { icon: UploadCloud, title: 'Upload & Discover', desc: 'Share resources and find what you need.' },
  { icon: BrainCircuit, title: 'Learn with AI', desc: 'Supercharge studying with personalized AI.' }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <style>{`
        @keyframes marquee-steps {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-steps {
          display: flex;
          width: max-content;
          animation: marquee-steps 25s linear infinite;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
        </div>

        {/* Main Card Wrap */}
        <div className="w-full rounded-3xl bg-[#0B0F19]/40 border border-white/10 p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Connecting Line (Only visible on desktop behind cards) */}
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

          {/* Desktop/Tablet - 4 Inner Cards */}
          <div className="hidden md:grid grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-md"
              >
                {/* Number Indicator */}
                <div className="absolute top-4 right-4 text-4xl font-bold text-white/[0.02] group-hover:text-primary/5 transition-colors font-outfit pointer-events-none z-0">
                  0{index + 1}
                </div>
                
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className="w-6 h-6 text-white group-hover:text-primary-glow transition-colors" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 font-outfit">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile View - Marquee Carousel with duplicated steps */}
          <div className="md:hidden relative w-full overflow-hidden z-10 py-2">
            <div className="animate-marquee-steps flex gap-4">
              {/* First Set */}
              {steps.map((step, index) => (
                <div
                  key={`mset1-${index}`}
                  className="w-[260px] flex-shrink-0 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 font-outfit">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
              {/* Second Set (Duplicate for continuous loop) */}
              {steps.map((step, index) => (
                <div
                  key={`mset2-${index}`}
                  className="w-[260px] flex-shrink-0 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 font-outfit">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
