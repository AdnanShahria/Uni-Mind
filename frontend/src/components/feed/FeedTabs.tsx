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
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-poppins transition-all duration-200 ${
            activeTab === tab
              ? 'bg-primary/10 border border-primary/20 text-primary-glow shadow-[0_0_12px_rgba(59,130,246,0.1)]'
              : 'border border-transparent text-slate-400 hover:text-white hover:bg-primary/[0.05] hover:border-primary/[0.14] font-medium'
          }`}
        >
          {tab}
        </button>
      ))}
      <div className="ml-auto">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 border border-transparent hover:bg-primary/[0.06] hover:border-primary/[0.14]">
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
