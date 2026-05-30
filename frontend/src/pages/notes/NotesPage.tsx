import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { turso } from '../../utils/tursoClient';
import { toast } from 'react-hot-toast';

import { FolderType, NoteType } from './types';
import { NotesHeader } from './NotesHeader';
import { FolderGrid } from './FolderGrid';
import { NotesList } from './NotesList';
import { BreadcrumbItem } from './FolderBreadcrumbs';

export const NotesPage = () => {
  const [dbNotes, setDbNotes] = useState<NoteType[]>([]);
  const [dbFolders, setDbFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterActive, setFilterActive] = useState(false);

  const fetchNotes = useCallback(async (background = false) => {
    if (!background) {
      const cachedNotes = localStorage.getItem('unimind_notes');
      const cachedFolders = localStorage.getItem('unimind_folders');
      const cachedAllFolders = localStorage.getItem('unimind_allFolders');
      
      if (cachedNotes) setDbNotes(JSON.parse(cachedNotes));
      if (cachedFolders) setDbFolders(JSON.parse(cachedFolders));
      if (cachedAllFolders) setAllFolders(JSON.parse(cachedAllFolders));
      
      if (!cachedNotes && !cachedFolders) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }

    try {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch folders
      const { data: folderData, error: folderError } = await turso
        .from('folders')
        .select('*')
        .eq('user_id', user.id);

      if (folderError) throw folderError;

      // Fetch notes with folder name join
      const { data: notesData, error: notesError } = await turso
        .from('notes')
        .select('*, folders(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

    if (folderData && folderData.length > 0) {
      setAllFolders(folderData);
      // Build folder counts based on folder_id
      const countMap: Record<string, number> = {};
      notesData?.forEach((n: any) => {
        if (n.folder_id) countMap[n.folder_id] = (countMap[n.folder_id] || 0) + 1;
      });

      const FOLDER_GRADIENTS = [
        { color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/15' },
        { color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/15' },
        { color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/15' },
        { color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/15' },
        { color: 'from-rose-500/20 to-red-500/20', border: 'border-rose-500/15' },
        { color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/15' },
      ];

      const parsedFolders = folderData.map((f: any, idx: number) => ({
        id: f.id,
        parent_id: f.parent_id,
        name: f.name,
        count: countMap[f.id] || 0,
        color: f.color || FOLDER_GRADIENTS[idx % FOLDER_GRADIENTS.length].color,
        borderColor: FOLDER_GRADIENTS[idx % FOLDER_GRADIENTS.length].border,
      }));

      setDbFolders(parsedFolders);
      localStorage.setItem('unimind_allFolders', JSON.stringify(folderData));
      localStorage.setItem('unimind_folders', JSON.stringify(parsedFolders));
    } else {
      setDbFolders([]);
      setAllFolders([]);
      localStorage.removeItem('unimind_allFolders');
      localStorage.removeItem('unimind_folders');
    }

    if (notesData && notesData.length > 0) {
      const NOTE_COLORS = ['text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400'];
        const parsedNotes = notesData.map((n: any, idx: number) => {
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
            folder_id: n.folder_id,
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
        });
        setDbNotes(parsedNotes);
        localStorage.setItem('unimind_notes', JSON.stringify(parsedNotes));
      } else {
        setDbNotes([]);
        localStorage.removeItem('unimind_notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to sync notes from database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Derived display data ──────────────────────────────────────────────────
  let displayNotes = dbNotes;

  const currentChildrenFolders = dbFolders.filter(f => (f.parent_id || null) === currentFolderId);

  if (searchQuery.trim() !== '') {
    displayNotes = displayNotes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.course.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else {
    // Only filter by currentFolderId if not searching
    displayNotes = displayNotes.filter(n => (n.folder_id || null) === currentFolderId);
  }

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const breadcrumbs: BreadcrumbItem[] = [];
  let curr = currentFolderId;
  while (curr) {
    const folder = allFolders.find(f => f.id === curr);
    if (!folder) break;
    breadcrumbs.unshift({ id: folder.id, name: folder.name });
    curr = folder.parent_id || null;
  }

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
      className="p-4 pb-24 md:p-6 lg:p-8 max-w-[1400px] mx-auto"
    >
      <NotesHeader 
        onNoteCreated={() => fetchNotes(true)} 
        currentFolderId={currentFolderId} 
        breadcrumbs={breadcrumbs}
        onNavigate={navigateToFolder}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {currentChildrenFolders.length > 0 && (
        <FolderGrid
          folders={currentChildrenFolders}
          onFolderClick={navigateToFolder}
        />
      )}

      <NotesList
        notes={displayNotes}
        isLoading={isLoading}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onClearFilters={() => { setSearchQuery(''); }}
        toggleStar={toggleStar}
        onNoteDeleted={handleNoteDeleted}
        onNoteUpdated={() => fetchNotes(true)}
      />
    </motion.div>
  );
};
