import { CalendarDays, Plus, Brain } from 'lucide-react';
import { useState } from 'react';
import { ActionModal } from '../../components/ActionModal';

export const PlannerHeader = ({ userName }: { userName: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-orange-400" />
            {userName}'s Planner
          </h1>
          <p className="text-sm text-slate-400 font-poppins mt-1">AI-optimized study schedule for peak performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold font-poppins transition-all hover:scale-105 active:scale-95">
            <Brain className="w-3.5 h-3.5" /> AI Optimize
          </button>
        </div>
      </div>
      
      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Task" 
        placeholder="E.g. Review Calculus Chapter 4..." 
        actionText="Add Task"
      />
    </>
  );
};
