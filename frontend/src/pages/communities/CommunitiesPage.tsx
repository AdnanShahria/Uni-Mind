import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { CommunitiesHeader } from './CommunitiesHeader';
import { CommunitiesFilter } from './CommunitiesFilter';
import { CommunitiesGrid } from './CommunitiesGrid';
import { CreateCommunityModal } from './CreateCommunityModal';

import { toast } from 'react-hot-toast';

export const CommunitiesPage = () => {
  const [dbCommunities, setDbCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const fetchCommunities = async () => {
    setIsLoading(true);
    const { data: { user } } = await turso.auth.getUser();
    
    const { data } = await turso
      .from('communities')
      .select(`
        *,
        community_members (count),
        posts (count),
        my_membership:community_members(role, user_id)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setDbCommunities(data.map((c: any, i: number) => {
        const colors = [
          { color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/15', icon: '⚛️' },
          { color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/15', icon: '🤖' },
          { color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/15', icon: '💻' },
          { color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/15', icon: '📐' }
        ];
        const style = colors[i % colors.length];

        const membersCount = c.community_members?.[0]?.count || 1;
        const postsCount = c.posts?.[0]?.count || 0;
        const myMembership = c.my_membership?.find((m: any) => m.user_id === user?.id);

        return {
          id: c.id,
          name: c.name,
          type: c.type,
          description: c.description || 'Welcome to our collaborative academic space! Share research, materials, and discuss homework here.',
          visibility: c.visibility || 'public',
          logo_url: c.logo_url || null,
          uni_name: c.uni_name || null,
          sessions: c.sessions || null,
          myRole: myMembership ? myMembership.role : null,
          members: membersCount,
          posts: postsCount.toString(),
          active: Math.max(1, Math.floor(membersCount / 3)),
          color: style.color,
          border: style.border,
          icon: c.type === 'Batch' ? '💻' : c.type === 'Research Group' ? '🔬' : style.icon,
        };
      }));
    }
    setIsLoading(false);
  };

  const handleJoin = async (communityId: string) => {
    const { data: { user } } = await turso.auth.getUser();
    if (!user) {
      toast.error('Please login first to join communities.');
      return;
    }

    const { error } = await turso.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member'
    });

    if (error) {
      toast.error('Failed to join community.');
      console.error(error);
    } else {
      toast.success('Successfully joined the community!');
      await fetchCommunities();
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  let displayCommunities = dbCommunities;

  if (filter !== 'All') {
    displayCommunities = displayCommunities.filter(c => c.type.includes(filter) || c.type === filter);
  }

  if (searchQuery.trim() !== '') {
    displayCommunities = displayCommunities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto"
    >
      <CommunitiesHeader onOpenSearch={() => setIsSearchModalOpen(true)} />
      <CommunitiesFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onCreateCommunity={() => setIsCreateModalOpen(true)}
        isSearchModalOpen={isSearchModalOpen}
        setIsSearchModalOpen={setIsSearchModalOpen}
      />
      <CommunitiesGrid
        displayCommunities={displayCommunities}
        isLoading={isLoading}
        onJoin={handleJoin}
      />

      <CreateCommunityModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </motion.div>
  );
};
