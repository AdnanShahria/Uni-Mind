import { Globe, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CreateCommunityModal } from './CreateCommunityModal';
import { useTopBarContext } from '../../contexts/TopBarContext';

export const CommunitiesHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Communities
          </h1>
          <p className="text-xs text-slate-400 font-poppins mt-0.5 hidden sm:block">
            Join academic groups, departments, and research circles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-[10px] sm:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Create Community</span>
            <span className="inline sm:hidden">Create</span>
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [setIsModalOpen, setLeftContent]);

  return (
    <CreateCommunityModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
    />
  );
};
