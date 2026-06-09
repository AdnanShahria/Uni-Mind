import { FlaskConical, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ActionModal } from '../../components/ActionModal';
import { useTopBarContext } from '../../contexts/TopBarContext';

export const ResearchHeader = ({ userName, onSubmit }: { userName: string; onSubmit?: (content: string) => Promise<void> }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="min-w-0 flex flex-col shrink-0">
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2 truncate">
            <FlaskConical className="w-5 h-5 text-rose-400" />
            {userName}'s Research Hub
          </h1>
          <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden lg:block">
            Manage papers, collaborations, and research projects
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-[10px] sm:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">New Project</span>
          <span className="inline sm:hidden">Project</span>
        </button>
      </div>
    );
    return () => setLeftContent(null);
  }, [userName, setIsModalOpen, setLeftContent]);

  return (
    <ActionModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      title="Start New Research Project" 
      placeholder="Project description, objective, or team members..." 
      actionText="Create Project"
      onSubmit={onSubmit}
    />
  );
};
