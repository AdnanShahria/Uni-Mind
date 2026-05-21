import { motion } from 'framer-motion';
import { BookOpen, BrainCircuit, Search, Users, LayoutDashboard, Calendar, ScanText, MessageSquare, LineChart, Target } from 'lucide-react';

const features = [
  { icon: BrainCircuit, title: 'AI Tutor', desc: 'Personalized 24/7 AI tutor for any subject.' },
  { icon: BookOpen, title: 'Smart Notes', desc: 'Auto-summarized and linked knowledge base.' },
  { icon: Target, title: 'Flashcards & Quizzes', desc: 'AI-generated study materials on the fly.' },
  { icon: Search, title: 'Semantic AI Search', desc: 'Find exact concepts across all your notes.' },
  { icon: Users, title: 'Academic Social Feed', desc: 'Connect with peers and researchers.' },
  { icon: LayoutDashboard, title: 'University Communities', desc: 'Dedicated spaces for your institution.' },
  { icon: Calendar, title: 'AI Study Planner', desc: 'Smart scheduling for optimal retention.' },
  { icon: ScanText, title: 'OCR Handwritten Notes', desc: 'Digitize and understand physical notes.' },
  { icon: MessageSquare, title: 'Messenger & Groups', desc: 'Real-time collaboration and study rooms.' },
  { icon: LineChart, title: 'Learning Analytics', desc: 'Track your academic performance and growth.' },
];

export const FeatureCards = () => {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Everything You Need, <span className="text-gradient">Supercharged</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A comprehensive suite of tools designed to enhance learning, research, and collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-2xl group relative overflow-hidden"
            >
              {/* Hover gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-glow group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-outfit group-hover:text-primary-glow transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
