import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { turso } from '../../utils/tursoClient';
import { toast } from 'react-hot-toast';

import { FolderType, NoteType } from './types';
import { NotesHeader } from './NotesHeader';
import { NotesFilter } from './NotesFilter';
import { FolderGrid } from './FolderGrid';
import { NotesList } from './NotesList';

export const NotesPage = () => {
  const [dbNotes, setDbNotes] = useState<NoteType[]>([]);
  const [dbFolders, setDbFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterActive, setFilterActive] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await turso.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch folders
    const { data: folderData } = await turso
      .from('folders')
      .select('*')
      .eq('user_id', user.id);

    // Fetch notes with folder name join
    const { data: notesData } = await turso
      .from('notes')
      .select('*, folders(name)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (folderData && folderData.length > 0) {
      // Build folder counts
      const countMap: Record<string, number> = {};
      notesData?.forEach((n: any) => {
        if (n.folders?.name) countMap[n.folders.name] = (countMap[n.folders.name] || 0) + 1;
      });

      const FOLDER_GRADIENTS = [
        { color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/15' },
        { color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/15' },
        { color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/15' },
        { color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/15' },
        { color: 'from-rose-500/20 to-red-500/20', border: 'border-rose-500/15' },
        { color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/15' },
      ];

      setDbFolders(folderData.map((f: any, idx: number) => ({
        name: f.name,
        count: countMap[f.name] || 0,
        color: f.color || FOLDER_GRADIENTS[idx % FOLDER_GRADIENTS.length].color,
        borderColor: FOLDER_GRADIENTS[idx % FOLDER_GRADIENTS.length].border,
      })));
    } else {
      setDbFolders([]);
    }

    if (notesData && notesData.length > 0) {
      const NOTE_COLORS = ['text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400'];
      setDbNotes(notesData.map((n: any, idx: number) => {
        const diff = Date.now() - new Date(n.created_at).getTime();
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor(diff / 60000);
        let timeStr = 'Just now';
        if (mins >= 1 && mins < 60) timeStr = `${mins}m ago`;
        else if (hours >= 1 && hours < 24) timeStr = `${hours}h ago`;
        else if (days >= 1) timeStr = `${days}d ago`;

        // Estimate pages from content length
        const contentLen = (n.content || '').length;
        const pages = Math.max(1, Math.ceil(contentLen / 3000));

        return {
          id: n.id,
          title: n.title,
          course: n.folders?.name || 'General',
          pages,
          lastEdited: timeStr,
          starred: n.is_starred || false,
          color: NOTE_COLORS[idx % NOTE_COLORS.length],
          aiSummary: n.is_ai_summarized || false,
          visibility: n.visibility || 'private',
          sharedLinkToken: n.shared_link_token || undefined,
          fileUrl: n.file_url || null,
        };
      }));
    } else {
      setDbNotes([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Derived display data ──────────────────────────────────────────────────
  let displayNotes = dbNotes;

  if (searchQuery.trim() !== '') {
    displayNotes = displayNotes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.course.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedFolder) {
    displayNotes = displayNotes.filter(n => n.course === selectedFolder);
  }

  const toggleFolder = (folderName: string) => {
    setSelectedFolder(prev => prev === folderName ? null : folderName);
  };

  const toggleStar = async (e: React.MouseEvent, noteId: string | number) => {
    e.stopPropagation();
    const note = dbNotes.find(n => n.id === noteId);
    if (!note) return;
    const newStarred = !note.starred;

    // Optimistic update
    setDbNotes(prev => prev.map(n => n.id === noteId ? { ...n, starred: newStarred } : n));
    toast.success(newStarred ? 'Added to favorites ⭐' : 'Removed from favorites');

    // Sync to database
    const { error } = await turso.from('notes').update({ is_starred: newStarred }).eq('id', noteId);
    if (error) {
      // Revert on failure
      setDbNotes(prev => prev.map(n => n.id === noteId ? { ...n, starred: !newStarred } : n));
      toast.error('Failed to update star');
    }
  };

  const handleNoteDeleted = (id: string | number) => {
    setDbNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 max-w-[1400px] mx-auto"
    >
      <NotesHeader onNoteCreated={fetchNotes} />

      <NotesFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {dbFolders.length > 0 && (
        <FolderGrid
          folders={dbFolders}
          selectedFolder={selectedFolder}
          toggleFolder={toggleFolder}
          clearFolder={() => setSelectedFolder(null)}
        />
      )}

      <NotesList
        notes={displayNotes}
        isLoading={isLoading}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onClearFilters={() => { setSelectedFolder(null); setSearchQuery(''); }}
        toggleStar={toggleStar}
        onNoteDeleted={handleNoteDeleted}
        onNoteUpdated={fetchNotes}
      />
    </motion.div>
  );
};
