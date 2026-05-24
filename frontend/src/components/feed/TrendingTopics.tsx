import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const trendingTopics = [
  { tag: '#QuantumComputing', posts: '2.4k posts' },
  { tag: '#MachineLearning', posts: '1.8k posts' },
  { tag: '#ResearchMethods', posts: '956 posts' },
  { tag: '#LinearAlgebra', posts: '734 posts' },
];

interface TrendingTopicsProps {
  onTagClick: (tag: string) => void;
  activeTag: string | null;
}

export const TrendingTopics = ({ onTagClick, activeTag }: TrendingTopicsProps) => {
  return (
    <motion.div
      variants={fadeIn}
      className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Trending Topics
        </h3>
      </div>
      <div className="p-3 space-y-1">
        {trendingTopics.map((topic, i) => {
          const isActive = activeTag === topic.tag;
          return (
            <div
              key={i}
              onClick={() => onTagClick(topic.tag)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <p className={`text-xs font-semibold font-poppins ${isActive ? 'text-white' : 'text-primary-glow'}`}>{topic.tag}</p>
                <p className="text-[10px] text-slate-500 font-poppins">{topic.posts}</p>
              </div>
              <TrendingUp className={`w-3.5 h-3.5 ${isActive ? 'text-primary-glow' : 'text-emerald-400'}`} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
