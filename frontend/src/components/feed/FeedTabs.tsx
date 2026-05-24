import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface FeedTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FeedTabs = ({ activeTab, setActiveTab }: FeedTabsProps) => {
  const tabs = ['For You', 'Following', 'Trending'];

  return (
    <motion.div variants={fadeIn} className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-poppins transition-colors ${
            activeTab === tab
              ? 'bg-primary/10 border border-primary/20 text-primary-glow'
              : 'hover:bg-white/[0.04] text-slate-400 hover:text-white font-medium'
          }`}
        >
          {tab}
        </button>
      ))}
      <div className="ml-auto">
        <button className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
