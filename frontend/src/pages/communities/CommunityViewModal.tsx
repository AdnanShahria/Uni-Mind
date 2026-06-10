import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Users, Volume2, Send, ShieldAlert, Sparkles, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { turso } from '../../utils/tursoClient';

interface CommunityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
}

export const CommunityViewModal = ({ isOpen, onClose, community }: CommunityViewModalProps) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'about' | 'members'>('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const fetchPosts = async () => {
    if (!community?.id) return;
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/dynamic/posts?eq_community_id=${community.id}&order=created_at&dir=desc`, { headers });
      const json = await res.json();
      if (json.success) {
        const rawPosts = json.data || [];
        // Enrich with author info
        let usersMap: Record<string, any> = {};
        try {
          const usersRes = await fetch(`/api/dynamic/users`, { headers });
          const usersJson = await usersRes.json();
          if (usersJson.success && usersJson.data) {
            usersJson.data.forEach((u: any) => { usersMap[u.id] = u; });
          }
        } catch { /* ignore */ }
        setPosts(rawPosts.map((p: any) => {
          const author = usersMap[p.author_id];
          return { ...p, author_name: author?.name || 'Scholar', author_avatar: author?.avatar_url || null };
        }));
      }
    } catch (err) {
      console.error('Failed to fetch community posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchMembers = async () => {
    if (!community?.id) return;
    setLoadingMembers(true);
    try {
      const token = localStorage.getItem('unimind_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/dynamic/community_members?eq_community_id=${community.id}`, { headers });
      const json = await res.json();
      if (json.success) {
        const rawMembers = json.data || [];
        // Enrich with user info
        let usersMap: Record<string, any> = {};
        try {
          const usersRes = await fetch(`/api/dynamic/users`, { headers });
          const usersJson = await usersRes.json();
          if (usersJson.success && usersJson.data) {
            usersJson.data.forEach((u: any) => { usersMap[u.id] = u; });
          }
        } catch { /* ignore */ }
        setMembers(rawMembers.map((m: any) => {
          const u = usersMap[m.user_id];
          return { ...m, name: u?.name || 'Scholar', avatar_url: u?.avatar_url || null, major: u?.major || '', institution: u?.institution || '' };
        }));
      }
    } catch (err) {
      console.error('Failed to fetch community members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen && community?.id) {
      fetchPosts();
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, community?.id]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      const { data: userData } = await turso.auth.getUser();
      if (!userData.user) {
        toast.error('Please login first to post.');
        setIsSubmittingPost(false);
        return;
      }

      const { error } = await turso.from('posts').insert({
        content: newPostContent.trim(),
        community_id: community.id,
        type: 'text'
      });

      if (error) {
        toast.error('Failed to publish post.');
        console.error(error);
      } else {
        toast.success('Published successfully to community feed!');
        setNewPostContent('');
        await fetchPosts();
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  if (!isOpen || !community) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-4xl h-[85vh] bg-[#090d16]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Animated Glow Border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 rounded-2xl opacity-40 blur-[1px] pointer-events-none" />

          {/* Modal Header */}
          <div className={`p-6 bg-gradient-to-br ${community.color} border-b border-white/10 flex items-start justify-between relative`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-3xl shrink-0">
                {community.icon}
              </div>
              <div>
                <span className="text-[10px] text-primary-glow bg-primary/20 px-2 py-0.5 rounded-md font-poppins font-bold uppercase tracking-wider">
                  {community.type}
                </span>
                <h2 className="text-2xl font-bold font-outfit text-white mt-1">{community.name}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-300 font-poppins mt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {community.members} Members</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {posts.length} Posts</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/[0.06] bg-black/20 px-6 shrink-0">
            {[
              { id: 'feed', label: 'Discussion Feed', icon: MessageSquare },
              { id: 'about', label: 'About & Announcements', icon: Volume2 },
              { id: 'members', label: 'Members Directory', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold font-poppins transition-colors relative border-b-2 ${
                  activeTab === tab.id ? 'border-primary text-primary-glow' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Mini Post Creator */}
                <form onSubmit={handlePostSubmit} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
                  
                  <textarea
                    placeholder="Share an interesting paper, note, or start an academic discussion inside this community..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent resize-none border-none outline-none text-sm text-slate-200 placeholder-slate-500 font-poppins"
                  />

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-2">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-poppins">
                      <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                      Formatting with markdown supported
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingPost || !newPostContent.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-glow text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                    >
                      {isSubmittingPost ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {isSubmittingPost ? 'Posting...' : 'Publish'}
                    </button>
                  </div>
                </form>

                {/* Feed Posts */}
                {loadingPosts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/[0.04] rounded-2xl text-slate-500 font-poppins text-sm">
                    No discussions inside this group yet. Be the first to start a conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {post.author_avatar ? (
                              <img src={post.author_avatar} alt={post.author_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (post.author_name || 'S').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 font-poppins">{post.author_name || 'Scholar'}</p>
                            <p className="text-[10px] text-slate-500 font-poppins mt-0.5">
                              {new Date(post.created_at).toLocaleDateString(undefined, { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-white font-poppins mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      About this Space
                    </h3>
                    <p className="text-sm text-slate-300 font-poppins leading-relaxed">
                      {community.description}
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-white font-poppins mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Community Guidelines
                    </h3>
                    <ul className="space-y-3 text-xs text-slate-400 font-poppins">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        Be respectful and construct feedback professionally.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        Keep threads academic and related to the community theme.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        Avoid spamming materials or copying unverified resources.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                    <h4 className="text-[11px] font-bold text-slate-400 font-poppins uppercase tracking-wider mb-3">Group Details</h4>
                    <div className="space-y-3 text-xs font-poppins text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Access:</span>
                        <span className="capitalize">{community.visibility}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span>{community.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Joined Role:</span>
                        <span className="text-purple-400 capitalize">{community.myRole || 'Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                {loadingMembers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white uppercase text-sm">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            member.name.substring(0, 2)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-200 font-poppins truncate">{member.name}</p>
                            <span className={`text-[9px] font-poppins font-medium px-2 py-0.5 rounded-md capitalize ${
                              member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' :
                              member.role === 'moderator' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-white/5 text-slate-400'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          
                          {member.major && (
                            <p className="text-xs text-slate-400 font-poppins flex items-center gap-1 mt-0.5 truncate">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              {member.major}
                            </p>
                          )}
                          
                          {member.institution && (
                            <p className="text-[10px] text-slate-500 font-poppins flex items-center gap-1 truncate">
                              <BookOpen className="w-3 h-3 text-slate-600 shrink-0" />
                              {member.institution}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
