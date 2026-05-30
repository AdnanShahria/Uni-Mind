import { Globe, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateCommunityModal } from './CreateCommunityModal';

export const CommunitiesHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            Communities
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-poppins mt-0.5 sm:mt-1">
            Join academic groups, departments, and research circles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Community
          </button>
        </div>
      </div>
      
      <CreateCommunityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
