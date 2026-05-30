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

      // 1. Fetch recent activity (from posts)
      let posts = null;
      try {
        const response = await fetch('http://localhost:8787/api/feed');
        const json = await response.json();
        if (json.success && json.data) {
          posts = json.data;
        }
      } catch (err) {
        console.error('Failed to fetch dashboard feed:', err);
      }

      if (posts) {
        setRecentActivity(posts.map((post: any) => {
          const diff = Date.now() - new Date(post.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          const timeStr = mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`;
          return {
            icon: post.type === 'document' ? FileText : MessageCircle,
            title: post.content.substring(0, 40) + (post.content.length > 40 ? '...' : ''),
            subtitle: 'Academic Feed Post',
            time: timeStr,
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            path: post.type === 'document' ? '/app/notes' : '/app/feed',
          };
        }));
      }

      // 2. Fetch AI Suggestions
      const { data: suggestions } = await turso
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (suggestions) setAiSuggestions(suggestions);

      // 3. Fetch Upcoming Tasks
      const { data: tasks } = await turso
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'upcoming')
        .order('due_date', { ascending: true })
        .limit(4);
      if (tasks) {
        setUpcomingTasks(tasks.map((t: any) => {
           const d = new Date(t.due_date);
           return {
             id: t.id,
             title: t.title,
             date: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
             color: t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
           };
        }));
      }

      // 4. Calculate Stats (Mocked or simple aggregations for now)
      setStats([
        {
          label: 'Notes Uploaded', value: '47', change: '+12 this week',
          icon: StickyNote, color: 'from-amber-500/20 to-orange-500/20', borderColor: 'border-amber-500/20',
          iconColor: 'text-amber-400', changeColor: 'text-emerald-400', path: '/app/notes'
        },
        {
          label: 'AI Queries', value: '156', change: '+34 today',
          icon: Brain, color: 'from-purple-500/20 to-violet-500/20', borderColor: 'border-purple-500/20',
          iconColor: 'text-purple-400', changeColor: 'text-emerald-400', path: '/app/ai'
        },
        {
          label: 'Study Streak', value: '14', change: 'days straight 🔥',
          icon: Flame, color: 'from-rose-500/20 to-pink-500/20', borderColor: 'border-rose-500/20',
          iconColor: 'text-rose-400', changeColor: 'text-orange-400', path: '/app/planner'
        },
        {
          label: 'Connections', value: '89', change: '+5 new peers',
          icon: Users, color: 'from-cyan-500/20 to-teal-500/20', borderColor: 'border-cyan-500/20',
          iconColor: 'text-cyan-400', changeColor: 'text-emerald-400', path: '/app/communities'
        }
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto"
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
