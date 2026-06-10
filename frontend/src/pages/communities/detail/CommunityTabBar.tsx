import { motion } from 'framer-motion';
import { Users, MessageSquare, Settings, Radio, TerminalSquare, Activity } from 'lucide-react';

interface TabConfig {
  id: 'feed' | 'members' | 'settings' | 'live-rooms' | 'code-spaces' | 'analytics';
  label: string;
  icon?: React.ReactNode;
  count?: number;
  show: boolean;
}

interface CommunityTabBarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  membersCount: number;
  userRole: string | null;
}

export const CommunityTabBar = ({ activeTab, setActiveTab, membersCount, userRole }: CommunityTabBarProps) => {
  const isMod = userRole === 'owner' || userRole === 'moderator';

  const tabs: TabConfig[] = [
    { id: 'feed', label: 'Feed', icon: <MessageSquare className="w-3.5 h-3.5" />, show: true },
    { id: 'members', label: 'Members', icon: <Users className="w-3.5 h-3.5" />, count: membersCount, show: true },
    { id: 'live-rooms', label: 'Live Rooms', icon: <Radio className="w-3.5 h-3.5" />, show: true },
    { id: 'code-spaces', label: 'Code Spaces', icon: <TerminalSquare className="w-3.5 h-3.5" />, show: true },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-3.5 h-3.5" />, show: isMod },
    { id: 'settings', label: 'Management', icon: <Settings className="w-3.5 h-3.5" />, show: isMod },
  ];

  return (
    <div className="w-full border-b border-white/[0.06] pb-2 md:pb-1 -mx-4 px-4 md:mx-0 md:px-0">
      {/* Horizontally scrollable container on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x pb-2 md:pb-0">
        {tabs.filter(t => t.show).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-start shrink-0 px-4 md:px-6 py-2.5 text-[13px] font-semibold font-poppins transition-all relative flex items-center gap-1.5 rounded-full md:rounded-none ${
                isActive 
                  ? 'bg-primary/20 text-primary-glow border border-primary/30 md:bg-transparent md:border-transparent' 
                  : 'bg-white/[0.03] md:bg-transparent border border-white/[0.06] md:border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {tab.icon}
              <span>{tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}</span>
              
              {/* Desktop underline indicator */}
              {isActive && (
                <motion.div 
                  layoutId="community-tab-indicator" 
                  className="hidden md:block absolute bottom-[-5px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
