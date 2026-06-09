import { CalendarDays, Plus, Brain } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface PlannerHeaderProps {
  userName: string;
  onOpenModal: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAIOptimize?: () => void;
}

import { useEffect } from 'react';
import { useTopBarContext } from '../../contexts/TopBarContext';

export const PlannerHeader = ({ userName, onOpenModal, selectedDate, onDateChange, onAIOptimize }: PlannerHeaderProps) => {
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="min-w-0 flex flex-col shrink-0">
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2 truncate">
            <CalendarDays className="w-5 h-5 text-orange-400" />
            {userName}'s Planner
          </h1>
          <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden lg:block">
            AI-optimized study schedule for peak performance
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <CustomDatePicker 
              selectedDate={selectedDate}
              onDateChange={onDateChange}
            />
          </div>

          <button 
            onClick={onOpenModal}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-[10px] sm:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Add Objective</span>
            <span className="inline sm:hidden">Add</span>
          </button>
          
          <button 
            onClick={onAIOptimize}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-semibold font-poppins transition-all hover:scale-105 active:scale-95"
          >
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">AI Optimize</span>
            <span className="inline sm:hidden">AI</span>
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [userName, selectedDate, onDateChange, onOpenModal, onAIOptimize, setLeftContent]);

  return (
    <div className="sm:hidden mb-4">
      <CustomDatePicker 
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />
    </div>
  );
};

