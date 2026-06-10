import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { WelcomeHeader } from './WelcomeHeader';
import { StatsGrid } from './StatsGrid';
import { RecentActivity } from './RecentActivity';
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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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
          const { stats: rawStats, upcomingTasks: rawTasks, recentActivity: rawActivity, aiSuggestions: rawSuggestions } = json.data;

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

          if (rawActivity) {
            setRecentActivity(rawActivity.map((act: any) => ({
              ...act,
              icon: iconMap[act.icon] || FileText
            })));
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
      className="px-3 pt-3 pb-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto"
    >
      <WelcomeHeader userName={userName} />
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity displayActivity={recentActivity} isLoading={isLoading} />
        <div className="space-y-6">
          <AISuggestions suggestions={aiSuggestions} />
          <UpcomingSchedule upcomingTasks={upcomingTasks} />
        </div>
      </div>

      <QuickActions />
    </motion.div>
  );
};
