import { motion } from 'framer-motion';
import { GraduationCap, Library, TestTube } from 'lucide-react';

export const ResearchSection = () => {
  return (
    <section id="research" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Graphic */}
        <motion.div
          initial={{ opacity: 0, rotateY: -30 }}
          whileInView={{ opacity: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="perspective-1000"
        >
          <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-3xl overflow-hidden glass-panel border-white/20 p-6 flex flex-col">
            <div className="w-full flex-1 bg-slate-900/50 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <GraduationCap className="w-16 h-16 text-primary-glow mb-4" />
                 <div className="text-2xl font-outfit font-bold tracking-widest text-white/80">SMART CAMPUS</div>
               </div>
               
               {/* Animated rings */}
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute w-48 h-48 border border-primary/50 rounded-full"
               />
            </div>
          </div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6">
            <span className="text-gradient">Institution</span> Dashboards & <br/>
            Knowledge Preservation
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Empower universities with smart dashboards. Preserve institutional knowledge across generations of students and researchers.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Library className="w-6 h-6 text-primary-glow" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Centralized Academic Hub</h4>
                <p className="text-slate-400">A unified repository for thesis papers, course materials, and departmental announcements.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <TestTube className="w-6 h-6 text-accent-glow" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">Research Collaboration</h4>
                <p className="text-slate-400">Cross-disciplinary tools enabling researchers to share data securely and discover synergistic projects.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
