import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { MessageSquare, Search, Edit3, Trash2, Save, X, AlertTriangle, Calendar } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  post_id: string;
  posts: {
    id: string;
    title: string | null;
    content: string;
  } | null;
}

export const MyCommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('post_comments')
      .select(`
        id, content, is_edited, created_at, updated_at, post_id,
        posts ( id, title, content )
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    setComments((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleEdit = (comment: Comment) => {
    setEditComment(comment);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editComment || !editContent.trim()) return;
    setIsSaving(true);
    const { error } = await supabase.from('post_comments')
      .update({ content: editContent, is_edited: true })
      .eq('id', editComment.id);
    setIsSaving(false);
    if (!error) {
      setEditComment(null);
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await supabase.from('post_comments').delete().eq('id', deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    setComments(prev => prev.filter(c => c.id !== deleteId));
  };

  const filtered = comments.filter(c =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    (c.posts?.title || c.posts?.content || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SettingsPageLayout title="My Comments" icon={<MessageSquare className="w-6 h-6 text-cyan-400" />}>
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/10 p-4 flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-cyan-400" />
        <div>
          <p className="text-2xl font-bold text-cyan-400 font-outfit">{comments.length}</p>
          <p className="text-xs text-slate-400 font-poppins">Comments you've made</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your comments..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-cyan-500/40 transition-colors" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-poppins">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{comments.length === 0 ? "You haven't commented on anything yet." : "No comments match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment, i) => (
            <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card border border-white/[0.06] rounded-2xl p-4">
              {/* Parent post context */}
              {comment.posts && (
                <div className="mb-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-poppins font-semibold mb-1">Commented on:</p>
                  <p className="text-xs text-slate-300 font-poppins line-clamp-1">
                    {comment.posts.title || comment.posts.content}
                  </p>
                </div>
              )}

              {/* Comment */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-white font-poppins leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {comment.is_edited && (
                      <span className="text-[10px] text-slate-500 font-poppins italic">(edited)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(comment)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold font-poppins transition-all border border-cyan-500/20">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(comment.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold font-poppins transition-all border border-rose-500/20">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editComment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Comment
                </h3>
                <button onClick={() => setEditComment(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-poppins outline-none focus:border-cyan-500/40 transition-colors resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setEditComment(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-semibold font-poppins hover:bg-white/[0.04] transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isSaving || !editContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold font-poppins transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white font-outfit mb-1">Delete Comment?</h3>
              <p className="text-xs text-slate-400 font-poppins mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-semibold font-poppins hover:bg-white/[0.04] transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold font-poppins transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsPageLayout>
  );
};
