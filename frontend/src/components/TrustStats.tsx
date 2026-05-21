import { motion } from 'framer-motion';

const stats = [
  { label: 'Notes Shared', value: '2M+' },
  { label: 'Students Connected', value: '500K+' },
  { label: 'AI Queries Solved', value: '10M+' },
  { label: 'Universities Supported', value: '1,200+' },
  { label: 'Research Communities', value: '8,500+' }
];

export const TrustStats = () => {
  return (
    <section className="py-20 relative z-10">
      <style>{`
        @keyframes marquee-stats {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-stats {
          display: flex;
          width: max-content;
          animation: marquee-stats 20s linear infinite;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Rounded Rectangular Main Card */}
        <div className="w-full rounded-3xl bg-[#0B0F19]/40 border border-white/10 p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Desktop/Tablet Grid - 5 Inner Cards */}
          <div className="hidden md:grid grid-cols-5 gap-6 relative z-10">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 group shadow-md"
              >
                <div className="text-4xl lg:text-5xl font-bold font-outfit text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile View - Marquee Carousel with duplicated stats */}
          <div className="md:hidden relative w-full overflow-hidden z-10 py-2">
            <div className="animate-marquee-stats flex gap-4">
              {/* First Set */}
              {stats.map((stat, index) => (
                <div
                  key={`set1-${index}`}
                  className="w-[200px] flex-shrink-0 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center"
                >
                  <div className="text-3xl font-bold font-outfit text-white mb-1.5 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
              {/* Second Set (Duplicate for continuous loop) */}
              {stats.map((stat, index) => (
                <div
                  key={`set2-${index}`}
                  className="w-[200px] flex-shrink-0 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center"
                >
                  <div className="text-3xl font-bold font-outfit text-white mb-1.5 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
