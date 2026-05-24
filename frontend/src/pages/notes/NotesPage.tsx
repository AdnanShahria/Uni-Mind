import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';

import { recentNotes } from './data';
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

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDbNotes(recentNotes);
        setIsLoading(false);
        return;
      }

      // Fetch folders
      const { data: folderData } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id);

      // Fetch notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*, folders(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (folderData && folderData.length > 0) {
        setDbFolders(folderData.map(f => ({
          name: f.name,
          count: 0, // Mock count for now
          color: f.color || 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/15',
        })));
      }

      if (notesData && notesData.length > 0) {
        setDbNotes(notesData.map(n => {
          const diff = Date.now() - new Date(n.created_at).getTime();
          const days = Math.floor(diff / 86400000);
          const timeStr = days > 0 ? `${days}d ago` : 'Today';

          return {
            id: n.id,
            title: n.title,
            course: n.folders?.name || 'General',
            pages: 1, // Mock pages
            lastEdited: timeStr,
            starred: n.is_starred,
            color: 'text-emerald-400',
            aiSummary: n.is_ai_summarized,
          };
        }));
      } else {
         setDbNotes(recentNotes);
      }

      setIsLoading(false);
    };

    fetchNotes();
  }, []);

  const displayFolders = dbFolders;
  let displayNotes = dbNotes.length > 0 ? dbNotes : recentNotes;

  // Apply search filter
  if (searchQuery.trim() !== '') {
    displayNotes = displayNotes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.course.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Apply folder filter
  if (selectedFolder) {
    displayNotes = displayNotes.filter(n => n.course === selectedFolder);
  }

  const toggleFolder = (folderName: string) => {
    if (selectedFolder === folderName) {
      setSelectedFolder(null); // Deselect
    } else {
      setSelectedFolder(folderName);
    }
  };

  const toggleStar = (e: React.MouseEvent, noteId: string | number) => {
    e.stopPropagation();
    setDbNotes(prev => prev.map(n => n.id === noteId ? { ...n, starred: !n.starred } : n));
    const isStarred = !dbNotes.find(n => n.id === noteId)?.starred;
    toast.success(isStarred ? 'Added to favorites' : 'Removed from favorites');
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="p-6 lg:p-8 max-w-[1400px] mx-auto"
    >
      <NotesHeader />

      <NotesFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterActive={filterActive}
        setFilterActive={setFilterActive}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <FolderGrid 
        folders={displayFolders}
        selectedFolder={selectedFolder}
        toggleFolder={toggleFolder}
        clearFolder={() => setSelectedFolder(null)}
      />

      <NotesList 
        notes={displayNotes}
        isLoading={isLoading}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onClearFilters={() => { setSelectedFolder(null); setSearchQuery(''); }}
        toggleStar={toggleStar}
      />
    </motion.div>
  );
};
