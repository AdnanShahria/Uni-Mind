import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { WelcomeHeader } from './WelcomeHeader';
import { StatsGrid } from './StatsGrid';
import { PinnedResources } from './PinnedResources';
import { AISuggestions } from './AISuggestions';
import { UpcomingSchedule } from './UpcomingSchedule';
import { QuickActions } from './QuickActions';
import { StickyNote, Brain, Flame, Users, FileText, MessageCircle } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const DashboardPage = () => {
  const [userName, setUserName] = useState('Scholar');
  const [stats, setStats] = useState<any[]>([]);
  const [pinnedResources, setPinnedResources] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserName(user.user_metadata?.name?.split(' ')[0] || 'Scholar');

      try {
        const token = localStorage.getItem('unimind_token');
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/dashboard/data', { headers });
        const json = await response.json();
        if (json.success && json.data) {
          const { stats: rawStats, upcomingTasks: rawTasks, pinnedResources: rawResources, aiSuggestions: rawSuggestions } = json.data;

          const iconMap: Record<string, any> = {
            StickyNote,
            Brain,
            Flame,
            Users,
            FileText,
            MessageCircle
          };

          if (rawStats) {
            setStats(rawStats.map((s: any) => ({
              ...s,
              icon: iconMap[s.icon] || StickyNote
            })));
          }

          if (rawTasks) {
            setUpcomingTasks(rawTasks);
          }

          if (rawResources) {
            setPinnedResources(rawResources);
          }

          if (rawSuggestions) {
            setAiSuggestions(rawSuggestions);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="px-4 pt-4 pb-8 md:px-6 md:pt-6 lg:px-10 lg:pt-8 xl:px-12 max-w-[1600px] mx-auto"
    >
      <WelcomeHeader userName={userName} />
      <StatsGrid stats={stats} />

      {/* Main content: 3-column on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Pinned Resources (takes 2/3 width on xl) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <PinnedResources resources={pinnedResources} isLoading={isLoading} />
          <QuickActions />
        </div>

        {/* Right sidebar: AI Suggestions + Upcoming (takes 1/3 width on xl) */}
        <div className="flex flex-col gap-6">
          <AISuggestions suggestions={aiSuggestions} />
          <UpcomingSchedule upcomingTasks={upcomingTasks} />
        </div>
      </div>
    </motion.div>
  );
};
