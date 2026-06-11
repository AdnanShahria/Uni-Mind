import { motion } from 'framer-motion';
import { Users, MessageSquare, Settings, Library, Calendar, Activity } from 'lucide-react';

interface TabConfig {
  id: 'feed' | 'members' | 'settings' | 'resources' | 'events' | 'analytics';
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
  const isMod = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator' || userRole === 'elder';

  const tabs: TabConfig[] = [
    { id: 'feed', label: 'Feed', icon: <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />, show: true },
    { id: 'members', label: 'Members', icon: <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />, count: membersCount, show: true },
    { id: 'resources', label: 'Resources', icon: <Library className="w-3.5 h-3.5 md:w-4 md:h-4" />, show: true },
    { id: 'events', label: 'Events', icon: <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />, show: true },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" />, show: isMod },
    { id: 'settings', label: 'Management', icon: <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />, show: isMod },
  ];

  return (
    <div className="w-full -mx-4 px-4 md:mx-0 md:px-0">
      {/* Scrollable pill tabs container */}
      <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto scrollbar-none snap-x pb-0.5 md:pb-0">
        {tabs.filter(t => t.show).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-start shrink-0 relative px-3 md:px-5 py-1.5 md:py-2.5 text-[11px] md:text-[13px] font-semibold font-poppins transition-all flex items-center gap-1.5 rounded-lg md:rounded-xl whitespace-nowrap ${
                isActive
                  ? 'bg-primary/15 text-primary-glow border border-primary/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-primary-glow' : 'text-slate-500'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}</span>

              {/* Active indicator bottom line (desktop only) */}
              {isActive && (
                <motion.div
                  layoutId="community-tab-underline"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary-glow hidden md:block"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mt-1.5 md:mt-2 h-px bg-white/[0.06]" />
    </div>
  );
};
