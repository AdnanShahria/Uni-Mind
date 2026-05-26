import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { Share2, Search, X, Calendar, User } from 'lucide-react';

interface SharedPost {
  id: string;
  share_note: string | null;
  created_at: string;
  post_id: string;
  posts: {
    id: string;
    title: string | null;
    content: string;
    type: string;
    author_id: string;
    users: {
      name: string;
    } | null;
  } | null;
}

export const MySharesPage = () => {
  const [shares, setShares] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unsharingId, setUnsharingId] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('post_shares')
      .select(`
        id, share_note, created_at, post_id,
        posts (
          id, title, content, type, author_id,
          users ( name )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setShares((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchShares(); }, [fetchShares]);

  const handleUnshare = async (shareId: string) => {
    setUnsharingId(shareId);
    await supabase.from('post_shares').delete().eq('id', shareId);
    setShares(prev => prev.filter(s => s.id !== shareId));
    setUnsharingId(null);
  };

  const filtered = shares.filter(s => {
    const text = (s.posts?.title || s.posts?.content || '').toLowerCase();
    return text.includes(search.toLowerCase()) || (s.share_note || '').toLowerCase().includes(search.toLowerCase());
  });

  const typeColors: Record<string, string> = {
    text: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    image: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    document: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    poll: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  };

  return (
    <SettingsPageLayout title="Posts I've Shared" icon={<Share2 className="w-6 h-6 text-emerald-400" />}>
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/10 p-4 flex items-center gap-3">
        <Share2 className="w-8 h-8 text-emerald-400" />
        <div>
          <p className="text-2xl font-bold text-emerald-400 font-outfit">{shares.length}</p>
          <p className="text-xs text-slate-400 font-poppins">Posts you've shared</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shared posts..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-poppins outline-none focus:border-emerald-500/40 transition-colors" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-poppins">
          <Share2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{shares.length === 0 ? "You haven't shared any posts yet." : "No shared posts match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((share, i) => (
            <motion.div key={share.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Type + author + date */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {share.posts?.type && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border font-poppins ${typeColors[share.posts.type] || typeColors.text}`}>
                        {share.posts.type.toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-poppins flex items-center gap-1">
                      <User className="w-3 h-3" /> {share.posts?.users?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      Shared {new Date(share.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {share.posts?.title && (
                    <h4 className="text-sm font-semibold text-white font-poppins mb-1 truncate">{share.posts.title}</h4>
                  )}
                  <p className="text-xs text-slate-400 font-poppins line-clamp-2">{share.posts?.content}</p>

                  {share.share_note && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/10">
                      <p className="text-[10px] text-emerald-400/70 font-poppins font-semibold uppercase tracking-wide mb-0.5">Your note</p>
                      <p className="text-xs text-emerald-300 font-poppins">{share.share_note}</p>
                    </div>
                  )}
                </div>

                {/* Unshare button */}
                <button onClick={() => handleUnshare(share.id)} disabled={unsharingId === share.id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold font-poppins transition-all border border-rose-500/20 disabled:opacity-50">
                  {unsharingId === share.id
                    ? <span className="w-3 h-3 border border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                    : <X className="w-3.5 h-3.5" />}
                  Unshare
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
};
