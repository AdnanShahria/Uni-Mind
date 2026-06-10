import { useState, useEffect } from 'react';
import { StickyNote, Plus, Search, FolderPlus } from 'lucide-react';
import { CreateNoteModal } from './CreateNoteModal';
import { CreateFolderModal } from './CreateFolderModal';
import { FolderBreadcrumbs, BreadcrumbItem } from './FolderBreadcrumbs';
import { NotesFilter } from './NotesFilter';
import { useTopBarContext } from '../../contexts/TopBarContext';

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
  sortBy?: 'date' | 'name' | 'pages';
  setSortBy?: (val: 'date' | 'name' | 'pages') => void;
  isSearchModalOpen?: boolean;
  setIsSearchModalOpen?: (val: boolean) => void;
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
  setViewMode,
  sortBy,
  setSortBy,
  isSearchModalOpen,
  setIsSearchModalOpen
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
            <div className="flex flex-col shrink-0">
              <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-400" />
                <span className="inline">UniNote</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden lg:block">
                Organize, share, and enhance your notes with AI
              </p>
            </div>
          )}

          {/* Breadcrumbs here */}
          <div className={`${!currentFolderId ? 'hidden sm:flex pl-4 border-l border-white/10' : 'flex'} items-center h-9 min-w-0 overflow-x-auto custom-scrollbar`}>
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
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 font-poppins transition-all hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            onClick={handleOpen}
            className="hidden sm:flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold font-poppins transition-all shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Note</span>
            <span className="inline sm:hidden">Note</span>
          </button>
          <button 
            onClick={() => setIsSearchModalOpen?.(true)}
            className="flex sm:hidden w-9 h-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [
    currentFolderId, breadcrumbs, onNavigate, searchQuery, filterActive, viewMode, sortBy,
    setLeftContent, setSearchQuery, setFilterActive, setViewMode, setSortBy, isSearchModalOpen, setIsSearchModalOpen
  ]);

  return (
    <>
      <div className="xl:hidden mb-4 sticky top-2 z-40 bg-[#0c142c]/65 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1.5 flex items-center justify-between w-full shadow-[0_8px_32px_rgba(0,0,0,0.37)] gap-2 overflow-x-auto scrollbar-none">
        {/* Action Buttons on Mobile */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all duration-300 active:scale-95 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] group"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold font-poppins transition-all duration-300 shadow-[0_2px_8px_rgba(59,130,246,0.25)] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Note</span>
            <span className="inline sm:hidden">Note</span>
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-white/10 mx-1 shrink-0"></div>

        <div className="flex-1 flex justify-end shrink-0">
          <NotesFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterActive={filterActive}
            setFilterActive={setFilterActive}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
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
