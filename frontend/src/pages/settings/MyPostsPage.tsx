import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import {
  FileText, Edit3, Trash2, Eye, Heart, MessageSquare,
  Search, X, Save, AlertTriangle, Pin, Archive,
  MoreVertical, Tag, Calendar, BookOpen
} from 'lucide-react';

interface Post {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  view_count: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

const typeColors: Record<string, string> = {
  text: 'text-primary-glow bg-blue-400/10 border-blue-400/20',
  image: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  document: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  poll: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export const MyPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, content, type, tags, created_at, updated_at, is_pinned, is_archived, view_count
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch counts in parallel
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const [likesRes, commentsRes, sharesRes] = await Promise.all([
            supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_shares').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);
          return {
            ...post,
            like_count: likesRes.count || 0,
            comment_count: commentsRes.count || 0,
            share_count: sharesRes.count || 0,
          };
        })
      );
      setPosts(postsWithCounts);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleEdit = (post: Post) => {
    setEditPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content);
    setEditTags((post.tags || []).join(', '));
    setOpenMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;
    setIsSaving(true);
    const { error } = await supabase.from('posts').update({
      title: editTitle || null,
      content: editContent,
      tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : null,
    }).eq('id', editPost.id);
    setIsSaving(false);
    if (!error) {
      setEditPost(null);
      fetchPosts();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await supabase.from('posts').delete().eq('id', deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    fetchPosts();
  };

  const handleTogglePin = async (post: Post) => {
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id);
    fetchPosts();
    setOpenMenu(null);
  };

  const handleToggleArchive = async (post: Post) => {
    await supabase.from('posts').update({ is_archived: !post.is_archived }).eq('id', post.id);
    fetchPosts();
    setOpenMenu(null);
  };

  const filtered = posts
    .filter(p => {
      const matchSearch = (p.title || p.content).toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || p.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'most-liked') return (b.like_count || 0) - (a.like_count || 0);
      if (sortBy === 'most-commented') return (b.comment_count || 0) - (a.comment_count || 0);
      return 0;
    });

  return (
    <SettingsPageLayout title="My Posts" icon={<FileText className="w-6 h-6 text-primary-glow" />}>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts', value: posts.length, color: 'text-white', bg: 'bg-white/5', icon: BookOpen },
          { label: 'Total Likes', value: posts.reduce((s, p) => s + (p.like_count || 0), 0), color: 'text-rose-400', bg: 'bg-rose-500/5', icon: Heart },
          { label: 'Total Comments', value: posts.reduce((s, p) => s + (p.comment_count || 0), 0), color: 'text-cyan-400', bg: 'bg-cyan-500/5', icon: MessageSquare },
          { label: 'Total Views', value: posts.reduce((s, p) => s + (p.view_count || 0), 0), color: 'text-amber-400', bg: 'bg-amber-500/5', icon: Eye },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`rounded-2xl ${stat.bg} border border-white/[0.06] p-4 flex flex-col items-center text-center`}>
            <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
            <span className={`text-2xl font-bold font-outfit ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-poppins mt-0.5">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 transition-colors" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 appearance-none cursor-pointer">
          <option value="all" className="bg-slate-900">All Types</option>
          <option value="text" className="bg-slate-900">Text</option>
          <option value="image" className="bg-slate-900">Image</option>
          <option value="document" className="bg-slate-900">Document</option>
          <option value="poll" className="bg-slate-900">Poll</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 appearance-none cursor-pointer">
          <option value="newest" className="bg-slate-900">Newest First</option>
          <option value="oldest" className="bg-slate-900">Oldest First</option>
          <option value="most-liked" className="bg-slate-900">Most Liked</option>
          <option value="most-commented" className="bg-slate-900">Most Commented</option>
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-poppins">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{posts.length === 0 ? "You haven't posted anything yet." : "No posts match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card border border-white/[0.06] rounded-2xl p-4 relative group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border font-poppins ${typeColors[post.type] || typeColors.text}`}>
                      {post.type.toUpperCase()}
                    </span>
                    {post.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-400" />}
                    {post.is_archived && <Archive className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {post.title && <h4 className="text-sm font-semibold text-white font-poppins mb-1 truncate">{post.title}</h4>}
                  <p className="text-xs text-slate-400 font-poppins line-clamp-2">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.slice(0, 4).map((tag, ti) => (
                        <span key={ti} className="text-[10px] text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md font-poppins flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0 text-xs font-poppins text-slate-400">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" />{post.like_count}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-cyan-400" />{post.comment_count}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-amber-400" />{post.view_count}</span>
                </div>
                {/* Actions */}
                <div className="relative shrink-0">
                  <button onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {openMenu === post.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-8 z-20 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[160px]">
                        <button onClick={() => handleEdit(post)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/[0.06] font-poppins transition-colors">
                          <Edit3 className="w-3.5 h-3.5 text-primary-glow" /> Edit Post
                        </button>
                        <button onClick={() => handleTogglePin(post)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/[0.06] font-poppins transition-colors">
                          <Pin className="w-3.5 h-3.5 text-amber-400" /> {post.is_pinned ? 'Unpin' : 'Pin Post'}
                        </button>
                        <button onClick={() => handleToggleArchive(post)} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/[0.06] font-poppins transition-colors">
                          <Archive className="w-3.5 h-3.5 text-slate-400" /> {post.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <div className="border-t border-white/[0.06]" />
                        <button onClick={() => { setDeleteId(post.id); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 font-poppins transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete Post
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary-glow" /> Edit Post
                </h3>
                <button onClick={() => setEditPost(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-poppins font-semibold block mb-1.5">Title (optional)</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 transition-colors"
                    placeholder="Post title..." />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-poppins font-semibold block mb-1.5">Content</label>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-poppins font-semibold block mb-1.5">Tags (comma separated)</label>
                  <input value={editTags} onChange={e => setEditTags(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-primary/40 transition-colors"
                    placeholder="research, AI, machine learning" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditPost(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-semibold font-poppins hover:bg-white/[0.04] transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={isSaving || !editContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary-glow hover:bg-primary text-white text-sm font-semibold font-poppins transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white text-center font-outfit mb-1">Delete Post?</h3>
              <p className="text-xs text-slate-400 text-center font-poppins mb-5">This cannot be undone. All likes and comments on this post will also be deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-semibold font-poppins hover:bg-white/[0.04] transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold font-poppins transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
