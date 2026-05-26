import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { Heart, Search, User, Calendar, HeartOff } from 'lucide-react';

interface LikedPost {
  post_id: string;
  created_at: string;
  posts: {
    id: string;
    title: string | null;
    content: string;
    type: string;
    created_at: string;
    author_id: string;
    users: {
      name: string;
      avatar_url: string | null;
    } | null;
  } | null;
}

export const MyLikesPage = () => {
  const [likes, setLikes] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unlikingId, setUnlikingId] = useState<string | null>(null);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('post_likes')
      .select(`
        post_id,
        created_at,
        posts (
          id, title, content, type, created_at, author_id,
          users ( name, avatar_url )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setLikes((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLikes(); }, [fetchLikes]);

  const handleUnlike = async (postId: string) => {
    setUnlikingId(postId);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLikes(prev => prev.filter(l => l.post_id !== postId));
    }
    setUnlikingId(null);
  };

  const filtered = likes.filter(l => {
    const post = l.posts;
    if (!post) return false;
    const text = (post.title || post.content).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <SettingsPageLayout title="Posts I've Liked" icon={<Heart className="w-6 h-6 text-rose-400" />}>
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl bg-rose-500/[0.05] border border-rose-500/10 p-4 flex items-center gap-3">
        <Heart className="w-8 h-8 text-rose-400 fill-rose-400/20" />
        <div>
          <p className="text-2xl font-bold text-rose-400 font-outfit">{likes.length}</p>
          <p className="text-xs text-slate-400 font-poppins">Posts you've liked</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search liked posts..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-rose-500/40 transition-colors" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-poppins">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{likes.length === 0 ? "You haven't liked any posts yet." : "No liked posts match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((like, i) => (
            <motion.div key={like.post_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card border border-white/[0.06] rounded-2xl p-4 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {like.posts?.users?.name?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
                    </div>
                    <span className="text-xs text-slate-300 font-poppins font-medium">{like.posts?.users?.name || 'Unknown Author'}</span>
                    <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      Liked {new Date(like.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {like.posts?.title && (
                    <h4 className="text-sm font-semibold text-white font-poppins mb-1 truncate">{like.posts.title}</h4>
                  )}
                  <p className="text-xs text-slate-400 font-poppins line-clamp-2">{like.posts?.content}</p>
                </div>

                {/* Unlike button */}
                <button onClick={() => handleUnlike(like.post_id)} disabled={unlikingId === like.post_id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold font-poppins transition-all border border-rose-500/20 disabled:opacity-50">
                  {unlikingId === like.post_id
                    ? <span className="w-3 h-3 border border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                    : <HeartOff className="w-3.5 h-3.5" />}
                  Unlike
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
};
