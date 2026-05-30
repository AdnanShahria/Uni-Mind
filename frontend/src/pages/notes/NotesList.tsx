import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, Clock, Star, Share2, MoreHorizontal, Search, Trash2, Edit3 } from 'lucide-react';
import { NoteType } from './types';
import { fadeIn } from './data';
import { NoteWorkspaceModal } from './workspace';
import { toast } from 'react-hot-toast';

interface NotesListProps {
  notes: NoteType[];
  isLoading: boolean;
  searchQuery: string;
  viewMode: 'list' | 'grid';
  onClearFilters: () => void;
  toggleStar: (e: React.MouseEvent, noteId: string | number) => void;
  onNoteDeleted: (id: string | number) => void;
  onNoteUpdated: () => void;
}

export const NotesList = ({
  notes,
  isLoading,
  searchQuery,
  viewMode,
  onClearFilters,
  toggleStar,
  onNoteDeleted,
  onNoteUpdated,
}: NotesListProps) => {
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNoteClick = (note: NoteType) => {
    setSelectedNote(note);
  };

  const handleShareClick = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/app/notes`).then(() => {
      toast.success(`Share link copied for "${title}"`);
    });
  };

  const handleOptionsClick = (e: React.MouseEvent, noteId: string | number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === noteId ? null : noteId);
  };

  const handleMenuDelete = (e: React.MouseEvent, note: NoteType) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setSelectedNote(note);
    // Small delay to let modal open then trigger delete confirm
    setTimeout(() => {
      // The detail modal handles delete confirm
    }, 100);
    // Actually open note detail and let user delete from there
    setSelectedNote(note);
  };

  const handleMenuEdit = (e: React.MouseEvent, note: NoteType) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setSelectedNote(note);
  };

  const handleStarFromDetail = (id: string | number) => {
    // Simulate a mouse event for toggleStar
    const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
    toggleStar(fakeEvent, id);
    // Update the selected note locally
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  return (
    <>
      <motion.div variants={fadeIn}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-3 px-1 flex items-center justify-between">
          <span>
            Recent Notes{' '}
            {searchQuery && (
              <span className="normal-case tracking-normal font-normal ml-1">
                ({notes.length} results)
              </span>
            )}
          </span>
          <button
            onClick={() => { onClearFilters(); toast.success('Showing all notes'); }}
            className="text-[10px] text-primary-glow font-semibold normal-case tracking-normal hover:text-primary transition-colors"
          >
            View All
          </button>
        </h3>

        {isLoading ? (
          <div className="px-5 py-8 text-center text-slate-500 font-poppins text-sm rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 font-poppins text-sm rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-3">
            <Search className="w-8 h-8 text-white/10" />
            <p>No notes found matching your criteria.</p>
            <button onClick={onClearFilters} className="text-primary text-xs hover:underline mt-2">
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'list'
                ? 'rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04]'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            }
          >
            {notes.map((note, i) => (
              <motion.div
                key={note.id || i}
                onClick={() => handleNoteClick(note)}
                initial={{ opacity: 0, x: viewMode === 'list' ? -10 : 0, y: viewMode === 'grid' ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.1 + (i % 10) * 0.05 }}
                className={
                  viewMode === 'list'
                    ? `flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group relative first:rounded-t-2xl last:rounded-b-2xl ${openMenuId === note.id ? 'z-50' : 'z-0'}`
                    : `flex flex-col p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer group gap-3 relative ${openMenuId === note.id ? 'z-50' : 'z-0'}`
                }
              >
                <div
                  className={
                    viewMode === 'list'
                      ? 'w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0'
                      : 'w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center'
                  }
                >
                  <FileText className={`${viewMode === 'list' ? 'w-5 h-5' : 'w-6 h-6'} ${note.color}`} />
                </div>

                <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'flex-1 mt-1'}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-[13px] font-medium text-slate-200 font-poppins truncate group-hover:text-white transition-colors ${
                        viewMode === 'grid' ? 'text-[15px]' : ''
                      }`}
                    >
                      {note.title}
                    </p>
                    {note.aiSummary && (
                      <span className="flex items-center gap-1 text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md font-semibold font-poppins shrink-0">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                    {note.fileUrl && (
                      <span className="flex items-center gap-1 text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-semibold font-poppins shrink-0" title={note.fileUrl}>
                        <FileText className="w-2.5 h-2.5" /> PDF/Image
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-poppins mt-1">
                    {note.course} · {note.pages} page{note.pages !== 1 ? 's' : ''}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 shrink-0 ${
                    viewMode === 'grid' ? 'mt-2 pt-3 border-t border-white/[0.04] w-full justify-between' : ''
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {note.lastEdited}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); toggleStar(e, note.id); }}
                      className={`w-7 h-7 rounded-lg hover:bg-amber-500/10 flex items-center justify-center transition-colors ${
                        note.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" fill={note.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={e => handleShareClick(e, note.title)}
                      className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Options menu */}
                    <div className="relative" ref={openMenuId === note.id ? menuRef : undefined}>
                      <button
                        onClick={e => handleOptionsClick(e, note.id)}
                        className={`w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-all ${
                          viewMode === 'list' ? 'opacity-0 group-hover:opacity-100' : ''
                        }`}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === note.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-[#0d1526] border border-white/[0.10] rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                          >
                            <button
                              onClick={e => handleMenuEdit(e, note)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors font-poppins"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Open & Edit
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); toggleStar(e, note.id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors font-poppins"
                            >
                              <Star className="w-3.5 h-3.5" fill={note.starred ? 'currentColor' : 'none'} />
                              {note.starred ? 'Unstar' : 'Star'}
                            </button>
                            <div className="h-px bg-white/[0.06] my-1" />
                            <button
                              onClick={e => handleMenuDelete(e, note)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-rose-400 hover:bg-rose-500/10 transition-colors font-poppins"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Note Detail Modal */}
      <NoteWorkspaceModal
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onDeleted={(id) => { onNoteDeleted(id); setSelectedNote(null); }}
        onStarToggled={handleStarFromDetail}
        onUpdated={onNoteUpdated}
      />
    </>
  );
};
