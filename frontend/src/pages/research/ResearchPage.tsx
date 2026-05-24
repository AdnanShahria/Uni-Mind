import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { ResearchHeader } from './ResearchHeader';
import { ResearchPapersList } from './ResearchPapersList';
import { CollaboratorsList } from './CollaboratorsList';
import { ResearchStats } from './ResearchStats';

export const ResearchPage = () => {
  const [userName, setUserName] = useState('Scholar');
  const [dbPapers, setDbPapers] = useState<any[]>([]);
  const [dbCollaborators, setDbCollaborators] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name?.split(' ')[0] || 'Scholar');

        // Fetch Papers
        const { data: userPapers } = await supabase
          .from('research_papers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userPapers) {
          setDbPapers(userPapers.map(p => ({
            id: p.id,
            title: p.title,
            authors: p.authors || 'Unknown',
            journal: p.journal || 'Preprint',
            year: p.year || new Date(p.created_at).getFullYear().toString(),
            citations: p.citations || 0,
            status: p.status,
            color: p.status === 'completed' ? 'text-emerald-400' : p.status === 'reading' ? 'text-blue-400' : 'text-amber-400'
          })));
        }

        // Fetch Collaborators
        const { data: collaborators } = await supabase
          .from('research_collaborators')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (collaborators) {
          setDbCollaborators(collaborators.map(c => ({
             id: c.id,
             name: c.name,
             role: c.role,
             avatar: c.avatar || c.name.substring(0, 2).toUpperCase(),
             color: c.color || 'from-emerald-500 to-teal-500'
          })));
        }
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <ResearchHeader userName={userName} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResearchPapersList displayPapers={dbPapers} />
        
        <div className="space-y-4">
          <CollaboratorsList collaborators={dbCollaborators} />
          <ResearchStats />
        </div>
      </div>
    </motion.div>
  );
};
