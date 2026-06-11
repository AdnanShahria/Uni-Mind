import { motion } from 'framer-motion';
import { StickyNote, Brain, FileText, Target, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const actions = [
  { label: 'Upload Notes', icon: StickyNote, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40', path: '/app/notes' },
  { label: 'Ask AI', icon: Brain, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40', path: '/app/ai' },
  { label: 'New Post', icon: FileText, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40', path: '/app/feed' },
  { label: 'Start Study Session', icon: Target, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40', path: '/app/planner' },
  { label: 'Find Study Group', icon: Users, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40', path: '/app/communities' },
  { label: 'Research Hub', icon: Zap, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40', path: '/app/research' },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="p-5 rounded-2xl glass-card"
    >
      <span className="text-[11px] text-slate-500 font-poppins font-semibold uppercase tracking-widest mb-4 block">Quick Actions</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path, action.path === '/app/ai' ? { state: { newChat: Date.now() } } : undefined)}
            className={`flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border text-xs font-medium font-poppins transition-all ${action.color} group`}
          >
            <action.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-center leading-tight text-[11px]">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
