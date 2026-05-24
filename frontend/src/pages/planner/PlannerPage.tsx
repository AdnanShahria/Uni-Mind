import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { PlannerHeader } from './PlannerHeader';
import { TodaySchedule } from './TodaySchedule';
import { WeeklyGoals } from './WeeklyGoals';
import { AIInsights } from './AIInsights';

export const PlannerPage = () => {
  const [userName, setUserName] = useState('Scholar');
  const [dbTasks, setDbTasks] = useState<any[]>([]);
  const [dbGoals, setDbGoals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name?.split(' ')[0] || 'Scholar');
        
        // Fetch tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });
          
        if (tasks) {
          setDbTasks(tasks.map(t => {
             const date = new Date(t.due_date);
             const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             return {
               id: t.id,
               title: t.title,
               time: timeStr,
               status: t.status === 'in_progress' ? 'in-progress' : t.status === 'completed' ? 'done' : 'upcoming',
               color: t.status === 'completed' ? 'text-emerald-400' : t.status === 'in_progress' ? 'text-blue-400' : 'text-slate-400',
               priority: t.priority
             };
          }));
        }

        // Fetch weekly goals
        const { data: goals } = await supabase
          .from('weekly_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (goals) {
          setDbGoals(goals);
        }
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PlannerHeader userName={userName} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodaySchedule displayTasks={dbTasks} />
        
        <div className="space-y-4">
          <WeeklyGoals goals={dbGoals} />
          <AIInsights />
        </div>
      </div>
    </motion.div>
  );
};
