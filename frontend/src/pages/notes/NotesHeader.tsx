import { useState, useEffect } from 'react';
import { StickyNote, Plus, FolderPlus, Filter, Grid3X3, List, ArrowDownUp } from 'lucide-react';
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
  filterActive: boolean;
  setFilterActive: (val: boolean) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (val: 'list' | 'grid') => void;
  sortBy?: 'date' | 'name' | 'pages';
  setSortBy?: (val: 'date' | 'name' | 'pages') => void;
  communityId?: string;
  hideTopBarContext?: boolean;
}

export const NotesHeader = ({ 
  onNoteCreated, 
  currentFolderId, 
  breadcrumbs, 
  onNavigate,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  communityId,
  hideTopBarContext
}: NotesHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const { setLeftContent } = useTopBarContext();

  // Top bar only shows the page title + breadcrumbs — no action buttons
  useEffect(() => {
    if (hideTopBarContext) return;
    setLeftContent(
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        {!currentFolderId && (
          <div className="flex flex-col shrink-0">
            <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-400" />
              <span>UniNote</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden md:block">
              Organize, share, and enhance your notes with AI
            </p>
          </div>
        )}
        {/* Breadcrumbs */}
        <div className={`${!currentFolderId ? 'hidden sm:flex pl-3 border-l border-white/10' : 'flex'} items-center h-9 min-w-0 overflow-x-auto`}>
          <FolderBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [currentFolderId, breadcrumbs, onNavigate, setLeftContent, hideTopBarContext]);

  return (
    <>
      {/* ── Desktop toolbar (below top bar, full width) ─────────────────────── */}
      <div className="hidden sm:flex items-center justify-between mb-5 gap-4">
        {/* Left: breadcrumb repeat for inside folders on desktop */}
        <div className="flex-1 min-w-0">
          {currentFolderId ? (
            <div className="flex items-center h-9 min-w-0 overflow-x-auto">
              <FolderBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-poppins">
              {/* spacer */}
            </p>
          )}
        </div>

        {/* Right: filter controls + action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <NotesFilter
            filterActive={filterActive}
            setFilterActive={setFilterActive}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <div className="w-px h-6 bg-white/10" />

          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-xs font-semibold text-slate-300 font-poppins transition-all hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            New Folder
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold font-poppins transition-all shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>
        </div>
      </div>

      {/* ── Mobile toolbar (sticky, compact) ────────────────────────────────── */}
      <div className="sm:hidden mb-4 sticky top-2 z-40 bg-[#0c142c]/70 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1.5 flex items-center justify-between w-full shadow-[0_8px_32px_rgba(0,0,0,0.37)] gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 transition-all active:scale-95"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold font-poppins shadow-[0_2px_8px_rgba(59,130,246,0.25)] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Note
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <NotesFilter
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
        communityId={communityId}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={onNoteCreated}
        parentFolderId={currentFolderId}
        communityId={communityId}
      />
    </>
  );
};
