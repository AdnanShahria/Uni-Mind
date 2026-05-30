import { motion } from 'framer-motion';
import { useState } from 'react';
import { StickyNote, Plus } from 'lucide-react';
import { fadeIn } from './data';
import { CreateNoteModal } from './CreateNoteModal';
import { CreateFolderModal } from './CreateFolderModal';
import { FolderPlus } from 'lucide-react';
import { FolderBreadcrumbs, BreadcrumbItem } from './FolderBreadcrumbs';
import { NotesFilter } from './NotesFilter';

interface NotesHeaderProps {
  onNoteCreated: () => void;
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterActive: boolean;
  setFilterActive: (val: boolean) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (val: 'list' | 'grid') => void;
}

export const NotesHeader = ({ 
  onNoteCreated, 
  currentFolderId, 
  breadcrumbs, 
  onNavigate,
  searchQuery,
  setSearchQuery,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode
}: NotesHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {!currentFolderId && (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-outfit text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                UniNote
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-poppins mt-0.5 sm:mt-1">
                Organize, share, and enhance your notes with AI
              </p>
            </div>
          )}

          {/* Breadcrumbs here */}
          <div className={`hidden md:flex items-center h-10 ${!currentFolderId ? 'pl-6 border-l border-white/10' : ''}`}>
             <FolderBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
          </div>

          <div className="hidden md:block pl-6">
            <NotesFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterActive={filterActive}
              setFilterActive={setFilterActive}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 font-poppins transition-colors hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-emerald-400" />
            New Folder
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </motion.div>

      <div className="md:hidden mb-6">
        <NotesFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={onNoteCreated}
        currentFolderId={currentFolderId}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={onNoteCreated}
        parentFolderId={currentFolderId}
      />
    </>
  );
};
