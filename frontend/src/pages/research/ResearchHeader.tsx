import { FlaskConical, Plus } from 'lucide-react';
import { useState } from 'react';
import { ActionModal } from '../../components/ActionModal';

export const ResearchHeader = ({ userName }: { userName: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-rose-400" />
            {userName}'s Research Hub
          </h1>
          <p className="text-sm text-slate-400 font-poppins mt-1">Manage papers, collaborations, and research projects</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Start New Research Project" 
        placeholder="Project description, objective, or team members..." 
        actionText="Create Project"
      />
    </>
  );
};
