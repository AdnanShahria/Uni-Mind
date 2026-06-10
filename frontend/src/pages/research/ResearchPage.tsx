import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { ResearchHeader } from './ResearchHeader';
import { ResearchPapersList } from './ResearchPapersList';
import { CollaboratorsList } from './CollaboratorsList';
import { ResearchStats } from './ResearchStats';
import { PaperSearch } from './PaperSearch';
import { toast } from 'react-hot-toast';

export const ResearchPage = () => {
  const [userName, setUserName] = useState('Scholar');
  const [userId, setUserId] = useState<string | null>(null);
  const [dbPapers, setDbPapers] = useState<any[]>([]);
  const [dbCollaborators, setDbCollaborators] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'search'>('library');

  const loadPapers = async (currentUserId: string) => {
    const { data: userPapers } = await turso
      .from('research_papers')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (userPapers) {
      setDbPapers(userPapers.map((p: any) => ({
        id: p.id,
        title: p.title,
        authors: p.authors || 'Unknown',
        journal: p.journal || 'Preprint',
        year: p.year || new Date(p.created_at).getFullYear().toString(),
        citations: p.citations || 0,
        status: p.status,
        color: p.status === 'completed' ? 'text-emerald-400' : p.status === 'reading' ? 'text-blue-400' : p.status === 'writing' ? 'text-purple-400' : 'text-amber-400',
        abstract: p.abstract
      })));
    }
  };

  const handleCreateProject = async (title: string) => {
    if (!userId) {
      toast.error('Please login first');
      return;
    }
    const { error } = await turso
      .from('research_papers')
      .insert({
        user_id: userId,
        title: title,
        authors: userName,
        status: 'writing',
        abstract: 'In-progress research project started on UniMind.'
      });

    if (error) {
      toast.error('Failed to create research project.');
      console.error(error);
    } else {
      toast.success('Research project started successfully!');
      await loadPapers(userId);
    }
  };
   
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.name?.split(' ')[0] || 'Scholar');

        // Fetch Papers
        await loadPapers(user.id);

        // Fetch Collaborators
        const { data: collaborators } = await turso
          .from('research_collaborators')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (collaborators) {
          setDbCollaborators(collaborators.map((c: any) => ({
             id: c.id,
             name: c.name,
             role: c.role,
             avatar: c.avatar || c.name.substring(0, 2).toUpperCase(),
             color: c.color || 'from-emerald-500 to-teal-500'
          })));
        }
      }
    };
    // Re-fetch when switching back to library to show newly saved papers
    if (activeTab === 'library') {
      fetchData();
    } else {
      // Just fetch user info if not fetched
      if (!userId) fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col">
      <div className="shrink-0">
        <ResearchHeader userName={userName} onSubmit={handleCreateProject} />
        
        <div className="flex items-center gap-4 mb-6 border-b border-white/[0.06] pb-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-[13px] font-semibold font-poppins transition-colors relative ${
              activeTab === 'library' ? 'text-primary-glow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            My Library
            {activeTab === 'library' && (
              <motion.div layoutId="research-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-[13px] font-semibold font-poppins transition-colors relative ${
              activeTab === 'search' ? 'text-primary-glow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Search arXiv
            {activeTab === 'search' && (
              <motion.div layoutId="research-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {activeTab === 'library' ? (
            <ResearchPapersList displayPapers={dbPapers} />
          ) : (
            <PaperSearch userId={userId} />
          )}
          
          <div className="space-y-4 overflow-y-auto pr-2">
            <CollaboratorsList collaborators={dbCollaborators} />
            <ResearchStats papers={dbPapers} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
