import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { PlannerHeader } from './PlannerHeader';
import { TodaySchedule } from './TodaySchedule';
import { WeeklyGoals } from './WeeklyGoals';
import { LongTermGoals } from './LongTermGoals';
import { AIInsights } from './AIInsights';
import { PlannerActionModal } from './PlannerActionModal';
import { PlannerConfirmModal } from './PlannerConfirmModal';
import { AIOptimizerModal } from './AIOptimizerModal';

export const PlannerPage = () => {
  const [userName, setUserName] = useState('Scholar');
  const [dbTasks, setDbTasks] = useState<any[]>([]);
  const [dbGoals, setDbGoals] = useState<any[]>([]);
  const [dbLongTermGoals, setDbLongTermGoals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiOptimizerOpen, setIsAiOptimizerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    type: 'task' | 'weekly' | 'long-term';
    title?: string;
  } | null>(null);

  const fetchData = async () => {
    const { data: { user } } = await turso.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.name?.split(' ')[0] || 'Scholar');
      
      // Fetch long-term goals
      const { data: ltgs } = await turso.from('long_term_goals').select('*').eq('user_id', user.id);
      if (ltgs) {
        setDbLongTermGoals(ltgs.map((g: any) => ({
          id: g.id,
          title: g.goal || g.title || '',
          progress: g.progress || 0,
          color: g.color || ''
        })));
      }

      // Fetch weekly goals
      const { data: goals } = await turso.from('weekly_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (goals) setDbGoals(goals);

      // Fetch tasks
      const { data: tasks } = await turso.from('tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
      if (tasks) {
        setDbTasks(tasks.map((t: any) => {
           const date = new Date(t.due_date);
           const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           return {
             id: t.id,
             title: t.title,
             time: timeStr,
             date: date,
             status: t.status === 'in_progress' ? 'in-progress' : t.status === 'completed' ? 'done' : 'upcoming',
             color: t.status === 'completed' ? 'text-emerald-400' : t.status === 'in_progress' ? 'text-blue-400' : 'text-slate-400',
             priority: t.priority,
             weekly_goal_id: t.weekly_goal_id,
             long_term_goal_id: t.long_term_goal_id,
             estimated_hours: t.estimated_hours || 0
           };
        }));
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayTasks = dbTasks.filter(t => t.date.toDateString() === selectedDate.toDateString());

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'upcoming' : 'done';
    const change = newStatus === 'done' ? 1 : -1;
    let targetWgId: string | null = null;
    let targetLtgId: string | null = null;
    let newWgCompleted = 0;

    // Optimistic UI Update for Task
    setDbTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // Find the task
    const task = dbTasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if the task is linked to a weekly goal
    if (task.weekly_goal_id) {
      targetWgId = task.weekly_goal_id;
      const wg = dbGoals.find(g => g.id === targetWgId);
      if (wg) {
        targetLtgId = wg.long_term_goal_id;
        newWgCompleted = Math.max(0, (wg.completed_segments || 0) + change);
        
        // Update weekly goal progress optimistically
        setDbGoals(prev => prev.map(g => g.id === targetWgId ? { ...g, completed_segments: newWgCompleted } : g));
      }
    }

    // Determine which Long-Term Goal is affected
    const finalLtgId = targetLtgId || task.long_term_goal_id;
    if (finalLtgId) {
      // Recalculate progress for finalLtgId
      const linkedWgs = dbGoals.map(g => {
        if (g.id === targetWgId) {
          return { ...g, completed_segments: newWgCompleted };
        }
        return g;
      }).filter(g => g.long_term_goal_id === finalLtgId);

      const linkedTasks = dbTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      }).filter(t => t.long_term_goal_id === finalLtgId);

      let sumProgress = 0;
      let totalWeight = 0;

      linkedWgs.forEach(wg => {
        const wgProg = wg.target_segments > 0 ? (wg.completed_segments / wg.target_segments) * 100 : 0;
        sumProgress += wgProg;
        totalWeight += 1;
      });

      if (linkedTasks.length > 0) {
        const completedTasksCount = linkedTasks.filter(t => t.status === 'done').length;
        const tasksProg = (completedTasksCount / linkedTasks.length) * 100;
        sumProgress += tasksProg;
        totalWeight += 1;
      }

      const finalLtgProgress = totalWeight > 0 ? Math.round(sumProgress / totalWeight) : 0;

      // Optimistic UI Update for Long Term Goal
      setDbLongTermGoals(prev => prev.map(ltg => ltg.id === finalLtgId ? { ...ltg, progress: finalLtgProgress } : ltg));
      
      // Update in DB
      await turso.from('long_term_goals').update({ progress: finalLtgProgress }).eq('id', finalLtgId);
    }

    // Persist task and weekly goal updates to DB
    const statusVal = newStatus === 'done' ? 'completed' : 'pending';
    await turso.from('tasks').update({ status: statusVal }).eq('id', taskId);

    if (targetWgId) {
      await turso.from('weekly_goals').update({ completed_segments: newWgCompleted }).eq('id', targetWgId);
    }
    
    // Final sync
    fetchData();
  };

  const handleObjectiveCreate = async (type: 'task' | 'weekly' | 'long-term', data: any) => {
    const { data: { user } } = await turso.auth.getUser();
    if (!user) return;

    if (data.id) {
      // EDIT MODE
      if (type === 'long-term') {
        await turso.from('long_term_goals').update({ goal: data.title }).eq('id', data.id);
      } else if (type === 'weekly') {
        await turso.from('weekly_goals')
          .update({ 
            goal: data.title, 
            long_term_goal_id: data.parentId || null 
          })
          .eq('id', data.id);
      } else if (type === 'task') {
        const existingTask = dbTasks.find(t => t.id === data.id);
        const oldParentId = existingTask?.weekly_goal_id;
        
        const updateObj: any = { title: data.title };
        if (data.date) {
          updateObj.due_date = new Date(data.date).toISOString();
        }
        if (data.parentType === 'weekly') {
          updateObj.weekly_goal_id = data.parentId || null;
          updateObj.long_term_goal_id = null;
        } else {
          updateObj.long_term_goal_id = data.parentId || null;
          updateObj.weekly_goal_id = null;
        }
        await turso.from('tasks').update(updateObj).eq('id', data.id);

        // Adjust parent counts if oldParentId changed
        if (data.parentType === 'weekly' && data.parentId !== oldParentId) {
          if (oldParentId) {
            const oldWg = dbGoals.find(g => g.id === oldParentId);
            if (oldWg) {
              const newTarget = Math.max(0, (oldWg.target_segments || 0) - 1);
              const newCompleted = existingTask.status === 'done' 
                ? Math.max(0, (oldWg.completed_segments || 0) - 1) 
                : (oldWg.completed_segments || 0);
              await turso.from('weekly_goals')
                .update({ target_segments: newTarget, completed_segments: newCompleted })
                .eq('id', oldParentId);
            }
          }
          if (data.parentId) {
            const newWg = dbGoals.find(g => g.id === data.parentId);
            if (newWg) {
              const newTarget = (newWg.target_segments || 0) + 1;
              const newCompleted = existingTask.status === 'done' 
                ? (newWg.completed_segments || 0) + 1 
                : (newWg.completed_segments || 0);
              await turso.from('weekly_goals')
                .update({ target_segments: newTarget, completed_segments: newCompleted })
                .eq('id', data.parentId);
            }
          }
        }
      }
    } else {
      // CREATE MODE
      if (type === 'long-term') {
        await turso.from('long_term_goals').insert([{ id: crypto.randomUUID(), user_id: user.id, goal: data.title }]);
      } else if (type === 'weekly') {
        await turso.from('weekly_goals').insert([{ id: crypto.randomUUID(), user_id: user.id, goal: data.title, long_term_goal_id: data.parentId || null }]);
      } else if (type === 'task') {
        const due = data.date ? new Date(data.date) : new Date();
        if (!data.date) {
          due.setHours(due.getHours() + 1);
        }
        
        const insertObj: any = { 
          id: crypto.randomUUID(),
          user_id: user.id, 
          title: data.title, 
          due_date: due.toISOString(), 
          status: 'pending' 
        };
        if (data.parentType === 'weekly') {
          insertObj.weekly_goal_id = data.parentId || null;
        } else if (data.parentType === 'long-term') {
          insertObj.long_term_goal_id = data.parentId || null;
        } else {
          if (data.parentId) {
            insertObj.weekly_goal_id = data.parentId;
          }
        }
        await turso.from('tasks').insert([insertObj]);
        
        if (data.parentType === 'weekly' && data.parentId) {
          const targetWg = dbGoals.find(g => g.id === data.parentId);
          if (targetWg) {
            await turso.from('weekly_goals').update({ target_segments: (targetWg.target_segments || 0) + 1 }).eq('id', data.parentId);
          }
        }
      }
    }
    setEditItem(null);
    fetchData();
  };

  const triggerDeleteConfirm = (id: string, type: 'task' | 'weekly' | 'long-term') => {
    let title = '';
    if (type === 'task') {
      title = dbTasks.find(t => t.id === id)?.title || '';
    } else if (type === 'weekly') {
      title = dbGoals.find(g => g.id === id)?.goal || dbGoals.find(g => g.id === id)?.title || '';
    } else if (type === 'long-term') {
      title = dbLongTermGoals.find(g => g.id === id)?.title || '';
    }

    setConfirmDelete({
      isOpen: true,
      id,
      type,
      title
    });
  };

  const executeObjectiveDelete = async (id: string, type: 'task' | 'weekly' | 'long-term') => {
    // 1. Optimistic UI Updates (User offlines sync first)
    if (type === 'long-term') {
      setDbLongTermGoals(prev => prev.filter(g => g.id !== id));
    } else if (type === 'weekly') {
      setDbGoals(prev => prev.filter(g => g.id !== id));
    } else if (type === 'task') {
      const task = dbTasks.find(t => t.id === id);
      setDbTasks(prev => prev.filter(t => t.id !== id));
      
      if (task && task.weekly_goal_id) {
        setDbGoals(prev => prev.map(wg => {
          if (wg.id === task.weekly_goal_id) {
            const newTarget = Math.max(0, (wg.target_segments || 0) - 1);
            const newCompleted = task.status === 'done' 
              ? Math.max(0, (wg.completed_segments || 0) - 1) 
              : (wg.completed_segments || 0);
            return { ...wg, target_segments: newTarget, completed_segments: newCompleted };
          }
          return wg;
        }));
      }
    }

    // 2. Perform DB operation in background without blocking
    (async () => {
      try {
        if (type === 'long-term') {
          await turso.from('long_term_goals').delete().eq('id', id);
        } else if (type === 'weekly') {
          await turso.from('weekly_goals').delete().eq('id', id);
        } else if (type === 'task') {
          const task = dbTasks.find(t => t.id === id);
          if (task && task.weekly_goal_id) {
            const wg = dbGoals.find(g => g.id === task.weekly_goal_id);
            if (wg) {
              const newTarget = Math.max(0, (wg.target_segments || 0) - 1);
              const newCompleted = task.status === 'done' 
                ? Math.max(0, (wg.completed_segments || 0) - 1) 
                : (wg.completed_segments || 0);
              await turso.from('weekly_goals')
                .update({ target_segments: newTarget, completed_segments: newCompleted })
                .eq('id', task.weekly_goal_id);
            }
          }
          await turso.from('tasks').delete().eq('id', id);
        }
      } catch (error) {
        console.error('Error executing delete operation:', error);
      } finally {
        // Silently sync state in background to ensure total consistency
        fetchData();
      }
    })();
  };

  const handleApplyAiSchedule = async (newTasks: any[]) => {
    const { data: { user } } = await turso.auth.getUser();
    if (!user) return;

    const inserts = newTasks.map(t => {
      const insertObj: any = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title: t.title,
        due_date: new Date(t.date).toISOString(),
        status: 'pending',
        priority: 'medium',
        estimated_hours: t.estimated_hours || 1,
      };
      
      // Only attach if it's a valid string ID
      if (t.weekly_goal_id && typeof t.weekly_goal_id === 'string' && t.weekly_goal_id.length > 5) {
        insertObj.weekly_goal_id = t.weekly_goal_id;
      }
      if (t.long_term_goal_id && typeof t.long_term_goal_id === 'string' && t.long_term_goal_id.length > 5) {
        insertObj.long_term_goal_id = t.long_term_goal_id;
      }
      return insertObj;
    });

    try {
      await turso.from('tasks').insert(inserts);
    } catch (error) {
      console.error('Failed to insert AI tasks', error);
    }
    
    // Refresh
    fetchData();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PlannerHeader 
        userName={userName} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <TodaySchedule 
          displayTasks={displayTasks} 
          weeklyGoals={dbGoals} 
          longTermGoals={dbLongTermGoals}
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate}
          onOpenModal={() => { setEditItem(null); setIsModalOpen(true); }}
          onAIOptimize={() => setIsAiOptimizerOpen(true)}
          onTaskToggle={handleTaskToggle} 
          onEdit={(task) => {
            setEditItem({
              id: task.id,
              type: 'task',
              title: task.title,
              parentId: task.weekly_goal_id || task.long_term_goal_id || '',
              parentType: task.weekly_goal_id ? 'weekly' : 'long-term',
              date: task.date,
              estimated_hours: task.estimated_hours
            });
            setIsModalOpen(true);
          }}
          onDelete={triggerDeleteConfirm}
        />
        
        <div className="space-y-6">
          <LongTermGoals 
            longTermGoals={dbLongTermGoals} 
            tasks={dbTasks}
            weeklyGoals={dbGoals}
            onEdit={(ltg) => {
              setEditItem({
                id: ltg.id,
                type: 'long-term',
                title: ltg.title
              });
              setIsModalOpen(true);
            }}
            onDelete={triggerDeleteConfirm}
          />
          <WeeklyGoals 
            goals={dbGoals} 
            longTermGoals={dbLongTermGoals} 
            tasks={dbTasks}
            selectedDate={selectedDate}
            onEdit={(wg) => {
              setEditItem({
                id: wg.id,
                type: 'weekly',
                title: wg.goal || wg.title,
                parentId: wg.long_term_goal_id || '',
                parentType: 'long-term'
              });
              setIsModalOpen(true);
            }}
            onDelete={triggerDeleteConfirm}
            onAIRebalance={() => setIsAiOptimizerOpen(true)}
          />
          <AIInsights tasks={displayTasks} goals={dbGoals} />
        </div>
      </div>

      <PlannerActionModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditItem(null); }}
        weeklyGoals={dbGoals}
        longTermGoals={dbLongTermGoals}
        onSubmit={handleObjectiveCreate}
        editItem={editItem}
        defaultDate={selectedDate}
      />

      {confirmDelete && (
        <PlannerConfirmModal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => executeObjectiveDelete(confirmDelete.id, confirmDelete.type)}
          title={`Delete ${confirmDelete.type === 'task' ? 'Task' : confirmDelete.type === 'weekly' ? 'Weekly Goal' : 'Long-Term Goal'}`}
          message={`Are you sure you want to delete ${confirmDelete.title ? `"${confirmDelete.title}"` : `this ${confirmDelete.type === 'task' ? 'task' : confirmDelete.type === 'weekly' ? 'weekly goal' : 'long-term goal'}`}? This action is permanent and cannot be undone.`}
        />
      )}

      <AIOptimizerModal
        isOpen={isAiOptimizerOpen}
        onClose={() => setIsAiOptimizerOpen(false)}
        tasks={dbTasks}
        goals={dbGoals}
        longTermGoals={dbLongTermGoals}
        onApplySchedule={handleApplyAiSchedule}
      />
    </motion.div>
  );
};

