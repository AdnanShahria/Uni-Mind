import { motion } from 'framer-motion';
import { StickyNote, Brain, FileText, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeIn}
      className="mt-8 p-4 rounded-2xl glass-card"
    >
      <span className="text-[11px] text-slate-500 font-poppins font-semibold uppercase tracking-wider mb-3 block">Quick Actions</span>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
      {[
        { label: 'Upload Notes', icon: StickyNote, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20', path: '/app/notes' },
        { label: 'Ask AI', icon: Brain, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20', path: '/app/ai' },
        { label: 'New Post', icon: FileText, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20', path: '/app/feed' },
        { label: 'Start Study Session', icon: Target, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20', path: '/app/planner' },
        { label: 'Find Study Group', icon: Users, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20', path: '/app/communities' },
      ].map((action, i) => (
        <button
          key={i}
          onClick={() => navigate(action.path)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium font-poppins transition-all ${action.color}`}
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </button>
      ))}
      </div>
    </motion.div>
  );
};
