import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, MessageSquare, Shield, Lock, Globe, Plus,
  Trash2, Settings, Loader2, Send, LogOut, Search, UserCheck
} from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

export const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'settings'>('feed');
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
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

      const API_URL = 'http://localhost:8787';
      const token = localStorage.getItem('unimind_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

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

      // 3. Fetch community posts using backend endpoint
      const postsRes = await fetch(`${API_URL}/api/communities/posts?communityId=${id}`, { headers });
      const postsJson = await postsRes.json();
      if (postsJson.success) {
        setPosts(postsJson.data || []);
      }

      // 4. Fetch community members roster
      const membersRes = await fetch(`${API_URL}/api/communities/members?communityId=${id}`, { headers });
      const membersJson = await membersRes.json();
      if (membersJson.success) {
        setMembers(membersJson.data || []);
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
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const newPost = {
        id: crypto.randomUUID(),
        author_id: userId,
        community_id: id,
        title: newPostTitle.trim() || null,
        content: newPostContent.trim(),
        type: 'text',
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
      const API_URL = 'http://localhost:8787';
      const res = await fetch(`${API_URL}/api/dynamic/post_comments?eqColumn=post_id&eqValue=${postId}`);
      const json = await res.json();
      if (json.success) {
        setPostComments(prev => ({ ...prev, [postId]: json.data || [] }));
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
      const API_URL = 'http://localhost:8787';
      const res = await fetch(`${API_URL}/api/dynamic/post_comments?eqColumn=post_id&eqValue=${postId}`);
      const json = await res.json();
      if (json.success) {
        setPostComments(prev => ({ ...prev, [postId]: json.data || [] }));
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
          visibility: editVisibility
        })
        .eq('id', id);

      toast.success('Community settings updated successfully!');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update community details');
    } finally {
      setIsUpdating(false);
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

  // Filter roster
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    (m.major && m.major.toLowerCase().includes(searchMemberQuery.toLowerCase())) ||
    (m.institution && m.institution.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-poppins text-slate-400">Opening community dashboard...</span>
      </div>
    );
  }

  const bgGradient = community.color || 'from-purple-500 to-indigo-500';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6"
    >
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/communities')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold font-poppins bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-xl border border-white/[0.06]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Communities
        </button>
        <div className="flex items-center gap-2">
          {community.visibility === 'private' ? (
            <span className="text-xs text-rose-400 font-bold uppercase tracking-wider font-poppins flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Private
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-poppins flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Public Community
            </span>
          )}
        </div>
      </div>

      {/* Hero Premium Banner Card */}
      <div className={`rounded-3xl bg-gradient-to-br ${bgGradient} p-6 md:p-10 relative overflow-hidden border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)]`}>
        {/* Abstract blur effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.1] border border-white/[0.15] backdrop-blur-md flex items-center justify-center text-4xl shadow-xl">
              {community.icon || '📚'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] text-white/80 bg-white/[0.12] px-2.5 py-0.5 rounded-lg font-poppins font-medium uppercase tracking-wider backdrop-blur-sm">
                  {community.type}
                </span>
                {userRole && (
                  <span className="text-[10px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-lg font-poppins font-medium uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {userRole}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold font-outfit text-white leading-tight mt-2.5 shadow-sm">
                {community.name}
              </h1>
              <p className="text-white/80 text-xs md:text-sm font-poppins mt-2 max-w-2xl leading-relaxed">
                {community.description || 'Welcome to this prestigious academic community. Connect, collaborate, and excel.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-white/90 font-poppins bg-black/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/[0.06]">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {members.length} members</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {posts.length} posts</span>
            </div>

            {userRole ? (
              userRole !== 'owner' && (
                <button
                  onClick={handleLeaveCommunity}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-white hover:bg-rose-500 rounded-xl text-xs font-semibold font-poppins transition-all"
                >
                  <LogOut className="w-4 h-4" /> Leave Community
                </button>
              )
            ) : (
              <button
                onClick={handleJoinCommunity}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 active:scale-95 text-xs font-bold font-poppins rounded-xl transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
              >
                Join Community
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-6 py-2.5 text-[13px] font-semibold font-poppins transition-colors relative ${activeTab === 'feed' ? 'text-primary-glow' : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Community Feed
          {activeTab === 'feed' && (
            <motion.div layoutId="community-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-2.5 text-[13px] font-semibold font-poppins transition-colors relative ${activeTab === 'members' ? 'text-primary-glow' : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Members Roster ({members.length})
          {activeTab === 'members' && (
            <motion.div layoutId="community-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" />
          )}
        </button>

        {(userRole === 'owner' || userRole === 'moderator') && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 text-[13px] font-semibold font-poppins transition-colors relative flex items-center gap-1.5 ${activeTab === 'settings' ? 'text-primary-glow' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <Settings className="w-3.5 h-3.5" /> Management
            {activeTab === 'settings' && (
              <motion.div layoutId="community-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-glow rounded-t-full" />
            )}
          </button>
        )}
      </div>

      {/* Main Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 columns containing feed, members list, or settings forms */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">

            {/* FEED TAB */}
            {activeTab === 'feed' && (
              <motion.div
                key="feed-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Create Community Post Form */}
                {userRole ? (
                  <div className="rounded-2xl glass-card p-5 border border-white/[0.06] bg-[#090d16] space-y-4">
                    <h3 className="text-[13px] font-bold text-white font-poppins uppercase tracking-wider">
                      Share an Update / Ask a Question
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Post Title (Optional)..."
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] text-slate-200 outline-none focus:border-primary/30 transition-all font-poppins"
                      />
                      <textarea
                        placeholder="What's on your mind? Share articles, research findings, assignments, or ask for guidance..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={4}
                        className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-[13px] text-slate-200 outline-none focus:border-primary/30 transition-all font-poppins resize-none"
                      />
                      <div className="flex items-center justify-end">
                        <button
                          onClick={handleCreatePost}
                          disabled={isPosting || !newPostContent.trim()}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                        >
                          {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          Publish Post
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] text-center space-y-3">
                    <Users className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-slate-400 text-sm font-poppins">You must be a member of this community to create posts.</p>
                    <button
                      onClick={handleJoinCommunity}
                      className="px-4 py-2 bg-primary hover:bg-primary-glow text-white rounded-xl text-xs font-semibold font-poppins transition-all"
                    >
                      Join Community Now
                    </button>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="rounded-2xl glass-card p-12 border border-white/[0.06] bg-[#090d16] text-center text-slate-500 font-poppins text-sm">
                      No posts published yet. Be the first to start the conversation!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="rounded-2xl glass-card p-5 border border-white/[0.06] bg-[#090d16] space-y-4">

                        {/* Author info & Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden">
                              {post.author_avatar ? (
                                <img src={post.author_avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                (post.author_name || 'Scholar').substring(0, 2)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[12.5px] font-semibold text-slate-200 font-poppins">{post.author_name || 'Scholar'}</span>
                                <span className="text-[9px] text-slate-500 font-poppins">{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-poppins">Researcher · UniMind Scholar</p>
                            </div>
                          </div>

                          {(userId === post.author_id || userRole === 'owner' || userRole === 'moderator') && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Title & Content */}
                        <div className="space-y-1">
                          {post.title && (
                            <h4 className="text-[14px] font-bold text-white font-poppins">{post.title}</h4>
                          )}
                          <p className="text-[13px] text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>

                        {/* Liking / Comments counts footer */}
                        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-semibold font-poppins transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {activeCommentsPostId === post.id ? 'Hide Replies' : 'Show Replies'}
                          </button>
                        </div>

                        {/* Inline Comments Section */}
                        <AnimatePresence>
                          {activeCommentsPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-3 space-y-3"
                            >
                              {/* Comments List */}
                              <div className="space-y-2.5 bg-black/15 p-3 rounded-xl border border-white/[0.04] max-h-60 overflow-y-auto">
                                {!postComments[post.id] || postComments[post.id].length === 0 ? (
                                  <p className="text-xs text-slate-500 font-poppins py-1">No comments on this post yet. Share your thoughts below!</p>
                                ) : (
                                  postComments[post.id].map((comment) => (
                                    <div key={comment.id} className="flex gap-2.5 py-1">
                                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white uppercase shrink-0">
                                        {comment.author_avatar ? (
                                          <img src={comment.author_avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                          'SC'
                                        )}
                                      </div>
                                      <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11.5px] font-semibold text-slate-300 font-poppins">Scholar</span>
                                          <span className="text-[9px] text-slate-500 font-poppins">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-300 font-poppins mt-0.5 leading-relaxed">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Comment Input Form */}
                              {userRole ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Write a supportive reply or suggestion..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                    className="flex-1 bg-black/25 border border-white/[0.08] rounded-xl px-3.5 py-2 text-[12.5px] text-slate-200 outline-none focus:border-primary/30 transition-all font-poppins"
                                  />
                                  <button
                                    onClick={() => handleSubmitComment(post.id)}
                                    className="px-3 bg-primary/20 hover:bg-primary/30 text-primary-glow border border-primary/20 rounded-xl transition-all flex items-center justify-center"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === 'members' && (
              <motion.div
                key="members-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search members by name, major, or institution..."
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-[13px] text-slate-200 placeholder-slate-500 focus:border-primary/30 focus:shadow-[0_0_15px_rgba(59,130,246,0.05)] outline-none transition-all font-poppins"
                  />
                </div>

                {/* Members Roster Card List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMembers.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-500 font-poppins text-sm bg-[#090d16] rounded-2xl border border-white/[0.06]">
                      No roster members match your search criteria.
                    </div>
                  ) : (
                    filteredMembers.map((member, idx) => (
                      <div key={idx} className="rounded-2xl glass-card p-4 border border-white/[0.06] bg-[#090d16] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-sm text-white uppercase overflow-hidden">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              member.name.substring(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-slate-200 font-poppins">{member.name}</span>
                              <span className={`text-[8.5px] font-bold font-poppins px-1.5 py-0.5 rounded uppercase tracking-wider ${member.role === 'owner' ? 'bg-amber-500/10 text-amber-400' :
                                  member.role === 'moderator' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}>
                                {member.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-poppins mt-0.5">{member.major || 'Deep Work'} · {member.institution || 'UniMind Labs'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                          <span className="text-[9px] text-slate-500 font-poppins">Joined:</span>
                          <span className="text-[9.5px] text-slate-400 font-poppins font-medium">{new Date(member.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (userRole === 'owner' || userRole === 'moderator') && (
              <motion.div
                key="settings-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] space-y-6"
              >
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-base font-bold text-white font-poppins flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" /> Community Settings Panel
                  </h3>
                  <p className="text-xs text-slate-400 font-poppins mt-0.5">Edit details, visibility, or manage lifecycle of the community</p>
                </div>

                <div className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold font-poppins">Community Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Theoretical Physics Club"
                      className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] text-slate-200 focus:border-primary/30 outline-none transition-all font-poppins"
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold font-poppins">Description & Objectives</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Objectives, rules, resources, or meeting times..."
                      rows={5}
                      className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-[13px] text-slate-200 focus:border-primary/30 outline-none transition-all font-poppins resize-none"
                    />
                  </div>

                  {/* Privacy Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold font-poppins">Privacy Settings</label>
                    <div className="flex gap-4">
                      {['public', 'private'].map((vis) => (
                        <label key={vis} className="flex items-center gap-2 cursor-pointer font-poppins text-xs text-slate-300">
                          <input
                            type="radio"
                            name="visibility"
                            value={vis}
                            checked={editVisibility === vis}
                            onChange={(e) => setEditVisibility(e.target.value)}
                            className="text-primary focus:ring-transparent bg-transparent border-white/[0.08]"
                          />
                          <span className="capitalize">{vis}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    {userRole === 'owner' ? (
                      <button
                        onClick={handleDisbandCommunity}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                      >
                        Disband Community
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={handleUpdateSettings}
                      disabled={isUpdating || !editName.trim()}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Updates
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Community Roster Quick summary & Rules card */}
        <div className="space-y-6">

          {/* Rules/Info Card */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
            <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Community Rules
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400 font-poppins leading-relaxed">
              <p>• **Respect and Support**: Foster a cooperative academic environment. No discrimination or hostility will be tolerated.</p>
              <p>• **Academic Honesty**: Share summaries, papers, or homework suggestions, but avoid posting direct exam answers.</p>
              <p>• **No Spamming**: Only post resources relevant to the community's subject area or general university updates.</p>
            </div>
          </div>

          {/* Roster Quick Summary list */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
            <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Active Members
            </h3>
            <div className="space-y-3">
              {members.slice(0, 5).map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {member.avatar_url ? <img src={member.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" /> : member.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-200 font-poppins">{member.name}</p>
                    <p className="text-[10px] text-slate-500 font-poppins">{member.role}</p>
                  </div>
                </div>
              ))}
              {members.length > 5 && (
                <button onClick={() => setActiveTab('members')} className="w-full mt-2 text-[11px] text-primary-glow font-semibold font-poppins hover:underline">
                  View All {members.length} Members
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 🚀 Premium Advanced Community Tools Row (Coming Soon) */}
      <div className="pt-6 border-t border-white/[0.06] space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white font-poppins">🚀 Advanced Community Tools (Beta)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Live Audio Rooms",
              desc: "Host real-time voice discussions with up to 100 participants. Perfect for study groups, guest lectures, and casual drop-ins.",
              gradient: "from-indigo-500/10 to-purple-500/10",
              border: "border-indigo-500/20"
            },
            {
              title: "Code Collaboration Spaces",
              desc: "Spin up instant, multi-player IDEs directly in the browser to pair-program and debug assignments together.",
              gradient: "from-rose-500/10 to-pink-500/10",
              border: "border-rose-500/20"
            },
            {
              title: "Community Analytics",
              desc: "Gain deep insights into member engagement, trending topics, and peak activity times with AI-generated reports.",
              gradient: "from-emerald-500/10 to-teal-500/10",
              border: "border-emerald-500/20"
            },
            {
              title: "Automated Moderation",
              desc: "Set up smart rules and AI-powered filters to automatically handle spam, toxicity, and off-topic posts.",
              gradient: "from-amber-500/10 to-orange-500/10",
              border: "border-amber-500/20"
            }
          ].map((tool, idx) => (
            <div key={idx} className={`rounded-2xl bg-gradient-to-br ${tool.gradient} border ${tool.border} p-5 relative overflow-hidden group`}>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary/20 text-primary-glow font-bold text-[9px] uppercase tracking-wider font-poppins animate-pulse">
                Coming Soon
              </div>
              <h4 className="text-[13px] font-bold text-slate-200 font-poppins group-hover:text-white transition-colors">{tool.title}</h4>
              <p className="text-[11.5px] text-slate-400 font-poppins mt-2 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
