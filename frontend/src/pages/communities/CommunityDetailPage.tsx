import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';
import { type CommunityRole } from '../../utils/communityRoles';

// Import components
import { CommunityHero } from './detail/CommunityHero';
import { CommunityTabBar } from './detail/CommunityTabBar';
import { CommunitySidebar } from './detail/CommunitySidebar';
import { FeedTab } from './detail/tabs/FeedTab';
import { MembersTab } from './detail/tabs/MembersTab';
import { ResourcesTab } from './detail/tabs/ResourcesTab';
import { EventsTab } from './detail/tabs/EventsTab';
import { AnalyticsTab } from './detail/tabs/AnalyticsTab';
import { SettingsTab } from './detail/tabs/SettingsTab';

export const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'settings' | 'resources' | 'events' | 'analytics'>('feed');
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [autoModEnabled, setAutoModEnabled] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});

  // Search Roster
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Settings Forms
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState('public');
  const [editIcon, setEditIcon] = useState('📚');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCommunityData = async () => {
    try {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) {
        toast.error('Please login first');
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 1. Fetch community details
      const { data: comms, error } = await turso
        .from('communities')
        .select('*')
        .eq('id', id);

      if (error || !comms || comms.length === 0) {
        toast.error('Community not found');
        navigate('/app/communities');
        return;
      }
      const c = comms[0];
      setCommunity(c);
      setEditName(c.name);
      setEditDesc(c.description || '');
      setEditVisibility(c.visibility || 'public');
      setEditIcon(c.icon || '📚');

      // 2. Fetch user role/membership
      const { data: membership } = await turso
        .from('community_members')
        .select('*')
        .eq('community_id', id)
        .eq('user_id', user.id);

      if (membership && membership.length > 0) {
        setUserRole(membership[0].role);
      } else {
        setUserRole(null);
      }

      // 3. Fetch community posts via dynamic API
      const postsRes = await fetch(`/api/dynamic/posts?eq_community_id=${id}&order=created_at&dir=desc`, { headers });
      const postsJson = await postsRes.json();
      if (postsJson.success) {
        // Enrich posts with author info
        const rawPosts = postsJson.data || [];
        const authorIds = [...new Set(rawPosts.map((p: any) => p.author_id))];
        let usersMap: Record<string, any> = {};
        if (authorIds.length > 0) {
          try {
            const usersRes = await fetch(`/api/dynamic/users`, { headers });
            const usersJson = await usersRes.json();
            if (usersJson.success && usersJson.data) {
              usersJson.data.forEach((u: any) => { usersMap[u.id] = u; });
            }
          } catch { /* ignore user fetch errors */ }
        }
        const enrichedPosts = rawPosts.map((p: any) => {
          const author = usersMap[p.author_id];
          return {
            ...p,
            author_name: author?.name || 'Scholar',
            author_avatar: author?.avatar_url || null,
          };
        });
        setPosts(enrichedPosts);
      }

      // 4. Fetch community members roster via dynamic API
      const membersRes = await fetch(`/api/dynamic/community_members?eq_community_id=${id}`, { headers });
      const membersJson = await membersRes.json();
      if (membersJson.success) {
        const rawMembers = membersJson.data || [];
        // Enrich members with user profile data
        const memberUserIds = rawMembers.map((m: any) => m.user_id);
        let memberUsersMap: Record<string, any> = {};
        if (memberUserIds.length > 0) {
          try {
            const usersRes = await fetch(`/api/dynamic/users`, { headers });
            const usersJson = await usersRes.json();
            if (usersJson.success && usersJson.data) {
              usersJson.data.forEach((u: any) => { memberUsersMap[u.id] = u; });
            }
          } catch { /* ignore */ }
        }
        const enrichedMembers = rawMembers.map((m: any) => {
          const u = memberUsersMap[m.user_id];
          return {
            ...m,
            name: u?.name || 'Scholar',
            avatar_url: u?.avatar_url || null,
            major: u?.major || '',
            institution: u?.institution || '',
          };
        });
        setMembers(enrichedMembers);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load community details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // Join Community
  const handleJoinCommunity = async () => {
    if (!userId) return;
    try {
      const newMember = {
        community_id: id,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      };
      await turso.from('community_members').insert(newMember);
      setUserRole('member');
      toast.success('Successfully joined community!');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to join community');
    }
  };

  // Leave Community
  const handleLeaveCommunity = async () => {
    if (!userId) return;
    try {
      await turso
        .from('community_members')
        .delete()
        .eq('community_id', id)
        .eq('user_id', userId);
      setUserRole(null);
      toast.success('You have left the community.');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to leave community');
    }
  };

  // Create Post
  const handleCreatePost = async (attachments: any[] = [], eventId: string | null = null, resourceId: string | null = null) => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const newPost = {
        id: crypto.randomUUID(),
        author_id: userId,
        community_id: id,
        title: newPostTitle.trim() || null,
        content: newPostContent.trim(),
        type: attachments.length > 0 ? (attachments[0].type === 'document' ? 'document' : 'image') : 'text',
        media_urls: JSON.stringify(attachments.map(a => a.url)),
        attachments: JSON.stringify(attachments),
        linked_event_id: eventId,
        linked_resource_id: resourceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await turso.from('posts').insert(newPost);
      setNewPostTitle('');
      setNewPostContent('');
      toast.success('Posted successfully!');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  // Toggle comments and fetch them
  const handleToggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    try {
      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/dynamic/post_comments?eq_post_id=${postId}&order=created_at&dir=asc`, { headers });
      const json = await res.json();
      if (json.success) {
        // Enrich comments with author info
        const rawComments = json.data || [];
        let usersMap: Record<string, any> = {};
        const authorIds = [...new Set(rawComments.map((c: any) => c.author_id))];
        if (authorIds.length > 0) {
          try {
            const usersRes = await fetch(`/api/dynamic/users`, { headers });
            const usersJson = await usersRes.json();
            if (usersJson.success && usersJson.data) {
              usersJson.data.forEach((u: any) => { usersMap[u.id] = u; });
            }
          } catch { /* ignore */ }
        }
        const enrichedComments = rawComments.map((c: any) => {
          const author = usersMap[c.author_id];
          return {
            ...c,
            author_name: author?.name || 'Scholar',
            author_avatar: author?.avatar_url || null,
          };
        });
        setPostComments(prev => ({ ...prev, [postId]: enrichedComments }));
      }
      setActiveCommentsPostId(postId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load comments');
    }
  };

  // Submit a comment reply
  const handleSubmitComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const newComment = {
        id: crypto.randomUUID(),
        post_id: postId,
        author_id: userId,
        content: text.trim(),
        is_edited: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await turso.from('post_comments').insert(newComment);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added!');

      // Refresh comments
      const token2 = localStorage.getItem('unimind_token');
      const hdr: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token2) hdr['Authorization'] = `Bearer ${token2}`;

      const res = await fetch(`/api/dynamic/post_comments?eq_post_id=${postId}&order=created_at&dir=asc`, { headers: hdr });
      const json = await res.json();
      if (json.success) {
        const rawComments = json.data || [];
        let usersMap: Record<string, any> = {};
        try {
          const usersRes = await fetch(`/api/dynamic/users`, { headers: hdr });
          const usersJson = await usersRes.json();
          if (usersJson.success && usersJson.data) {
            usersJson.data.forEach((u: any) => { usersMap[u.id] = u; });
          }
        } catch { /* ignore */ }
        const enrichedComments = rawComments.map((c: any) => {
          const author = usersMap[c.author_id];
          return { ...c, author_name: author?.name || 'Scholar', author_avatar: author?.avatar_url || null };
        });
        setPostComments(prev => ({ ...prev, [postId]: enrichedComments }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit comment');
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    try {
      await turso.from('posts').delete().eq('id', postId);
      toast.success('Post deleted successfully');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete post');
    }
  };

  // Update Settings
  const handleUpdateSettings = async () => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await turso
        .from('communities')
        .update({
          name: editName.trim(),
          description: editDesc.trim(),
          visibility: editVisibility,
          icon: editIcon,
        })
        .eq('id', id);

      // Optimistically update local community state so hero refreshes immediately
      setCommunity((prev: any) => ({ ...prev, name: editName.trim(), description: editDesc.trim(), visibility: editVisibility, icon: editIcon }));
      toast.success('Community settings updated!');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update community details');
    } finally {
      setIsUpdating(false);
    }
  };

  // Update Member Role (hierarchy enforced in UI + here as safety)
  const handleUpdateMemberRole = async (targetUserId: string, newRole: CommunityRole) => {
    try {
      const { getRoleLevel } = await import('../../utils/communityRoles');
      const actorLevel = getRoleLevel(userRole);
      const newLevel = getRoleLevel(newRole);

      if (newLevel > actorLevel || newRole === 'owner') {
        toast.error('You cannot assign a role higher than your own.');
        return;
      }

      await turso
        .from('community_members')
        .update({ role: newRole, role_level: newLevel })
        .eq('community_id', id)
        .eq('user_id', targetUserId);

      toast.success(`Role updated to ${newRole}!`);
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update member role');
    }
  };

  // Disband/Delete Community
  const handleDisbandCommunity = async () => {
    if (!window.confirm('Are you absolutely sure you want to permanently disband and delete this community? This action is irreversible.')) {
      return;
    }
    try {
      await turso.from('communities').delete().eq('id', id);
      toast.success('Community disbanded successfully.');
      navigate('/app/communities');
    } catch (err) {
      console.error(err);
      toast.error('Failed to disband community');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border border-primary/10 border-b-primary/50 animate-spin-reverse" />
        </div>
        <span className="text-sm font-poppins text-slate-400 tracking-wide">Opening community dashboard...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-8 xl:px-10 w-full pb-12"
    >
      {/* Hero — full-bleed on mobile, rounded on desktop */}
      <div className="-mx-4 md:mx-0">
        <CommunityHero 
          community={community}
          membersCount={members.length}
          postsCount={posts.length}
          userRole={userRole}
          onJoin={handleJoinCommunity}
          onLeave={handleLeaveCommunity}
          onBack={() => navigate('/app/communities')}
        />
      </div>

      <div className="mt-5 md:mt-7 space-y-5 md:space-y-6">
        <CommunityTabBar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          membersCount={members.length}
          userRole={userRole}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

          {/* Mobile-only sidebar (accordion) */}
          <div className="lg:hidden">
            <CommunitySidebar members={members} onViewAllMembers={() => setActiveTab('members')} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <FeedTab 
                  posts={posts}
                  userRole={userRole}
                  userId={userId}
                  newPostTitle={newPostTitle}
                  setNewPostTitle={setNewPostTitle}
                  newPostContent={newPostContent}
                  setNewPostContent={setNewPostContent}
                  isPosting={isPosting}
                  handleCreatePost={handleCreatePost}
                  handleJoinCommunity={handleJoinCommunity}
                  handleDeletePost={handleDeletePost}
                  activeCommentsPostId={activeCommentsPostId}
                  handleToggleComments={handleToggleComments}
                  postComments={postComments}
                  commentInputs={commentInputs}
                  setCommentInputs={setCommentInputs}
                  handleSubmitComment={handleSubmitComment}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'members' && (
                <MembersTab 
                  members={members}
                  searchMemberQuery={searchMemberQuery}
                  setSearchMemberQuery={setSearchMemberQuery}
                />
              )}

              {activeTab === 'resources' && <ResourcesTab communityId={id as string} />}
              
              {activeTab === 'events' && <EventsTab communityId={id as string} userRole={userRole} />}

              {activeTab === 'analytics' && (userRole === 'owner' || userRole === 'admin' || userRole === 'moderator') && (
                <AnalyticsTab 
                  membersCount={members.length}
                  postsCount={posts.length}
                  commentsCount={Object.values(postComments).flat().length}
                  members={members}
                />
              )}

              {activeTab === 'settings' && (userRole === 'owner' || userRole === 'admin' || userRole === 'moderator' || userRole === 'elder') && (
                <SettingsTab 
                  editName={editName}
                  setEditName={setEditName}
                  editDesc={editDesc}
                  setEditDesc={setEditDesc}
                  editVisibility={editVisibility}
                  setEditVisibility={setEditVisibility}
                  editIcon={editIcon}
                  setEditIcon={setEditIcon}
                  autoModEnabled={autoModEnabled}
                  setAutoModEnabled={setAutoModEnabled}
                  isUpdating={isUpdating}
                  handleUpdateSettings={handleUpdateSettings}
                  userRole={userRole}
                  handleDisbandCommunity={handleDisbandCommunity}
                  members={members}
                  handleUpdateMemberRole={handleUpdateMemberRole}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <CommunitySidebar members={members} onViewAllMembers={() => setActiveTab('members')} />
          </div>

        </div>
      </div>
    </motion.div>
  );
};
