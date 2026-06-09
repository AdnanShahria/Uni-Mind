import { useState } from 'react';
import { StickyNote, Plus } from 'lucide-react';
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

import { useEffect } from 'react';
import { useTopBarContext } from '../../contexts/TopBarContext';

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
  const { setLeftContent } = useTopBarContext();

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          {!currentFolderId && (
            <div className="hidden sm:flex flex-col shrink-0">
              <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-400" />
                UniNote
              </h1>
              <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden lg:block">
                Organize, share, and enhance your notes with AI
              </p>
            </div>
          )}

          {/* Breadcrumbs here */}
          <div className={`hidden sm:flex items-center h-10 ${!currentFolderId ? 'pl-4 border-l border-white/10' : ''} min-w-0 overflow-x-auto custom-scrollbar`}>
             <FolderBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
          </div>

          <div className="hidden xl:block pl-4 shrink-0">
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
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-[10px] sm:text-xs font-semibold text-slate-300 font-poppins transition-colors hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-[10px] sm:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Note</span>
            <span className="inline sm:hidden">Note</span>
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [
    currentFolderId, breadcrumbs, onNavigate, searchQuery, filterActive, viewMode, 
    setLeftContent, setSearchQuery, setFilterActive, setViewMode
  ]);

  return (
    <>
      <div className="xl:hidden mb-6">
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
