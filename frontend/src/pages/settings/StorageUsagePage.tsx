import { useState, useEffect } from 'react';
import { HardDrive, FileText, Image, BookOpen, Trash2, RefreshCw } from 'lucide-react';
import { SettingsPageLayout } from '../../components/settings/SettingsPageLayout';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';

interface StorageBreakdown {
  posts: number;
  notes: number;
  comments: number;
  total: number;
}

const MAX_GB = 10;
const GB = 1024 * 1024 * 1024;

const AnimatedBar = ({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) => (
  <div className="w-full bg-white/[0.05] rounded-full h-2.5 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(pct, 100)}%` }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      className={`h-full rounded-full ${color}`}
    />
  </div>
);

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / GB).toFixed(2)} GB`;
};

export const StorageUsagePage = () => {
  const [counts, setCounts] = useState({ posts: 0, notes: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string | null>(null);

  // Estimate storage: posts ~2KB avg, notes ~5KB avg, comments ~0.5KB avg
  const storage: StorageBreakdown = {
    posts: counts.posts * 2048,
    notes: counts.notes * 5120,
    comments: counts.comments * 512,
    total: counts.posts * 2048 + counts.notes * 5120 + counts.comments * 512,
  };
  const totalGb = storage.total / GB;
  const usedPct = (totalGb / MAX_GB) * 100;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [postsRes, notesRes, commentsRes] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
      ]);
      setCounts({ posts: postsRes.count || 0, notes: notesRes.count || 0, comments: commentsRes.count || 0 });
      setLoading(false);
    };
    fetch();
  }, []);

  const handleClean = async (type: 'posts' | 'notes' | 'comments') => {
    setCleaning(type);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (type === 'posts') await supabase.from('posts').delete().eq('author_id', user.id);
      if (type === 'notes') await supabase.from('notes').delete().eq('user_id', user.id);
      if (type === 'comments') await supabase.from('post_comments').delete().eq('author_id', user.id);
      setCounts(prev => ({ ...prev, [type]: 0 }));
    }
    setCleaning(null);
  };

  const categories = [
    {
      key: 'posts' as const,
      label: 'Posts & Media',
      icon: Image,
      color: 'bg-primary',
      textColor: 'text-primary-glow',
      borderColor: 'border-primary/20',
      bytes: storage.posts,
      count: counts.posts,
      unit: 'posts',
    },
    {
      key: 'notes' as const,
      label: 'Notes & Documents',
      icon: BookOpen,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      bytes: storage.notes,
      count: counts.notes,
      unit: 'notes',
    },
    {
      key: 'comments' as const,
      label: 'Comments & Replies',
      icon: FileText,
      color: 'bg-teal-500',
      textColor: 'text-teal-400',
      borderColor: 'border-teal-500/20',
      bytes: storage.comments,
      count: counts.comments,
      unit: 'comments',
    },
  ];

  return (
    <SettingsPageLayout title="Storage Usage" icon={<HardDrive className="w-6 h-6 text-cyan-400" />}>
      <div className="max-w-2xl space-y-5">

        {/* Total Usage Ring */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-white/[0.08] rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white font-outfit mb-5">Total Storage</h3>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <span className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-bold text-white font-outfit">{formatSize(storage.total)}</span>
                <span className="text-sm text-slate-400 font-poppins mb-1">of {MAX_GB} GB used</span>
              </div>
              <AnimatedBar
                pct={usedPct}
                color={usedPct > 80 ? 'bg-rose-500' : usedPct > 60 ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-500 font-poppins">{usedPct.toFixed(2)}% used</span>
                <span className="text-[10px] text-slate-500 font-poppins">{formatSize((MAX_GB * GB) - storage.total)} free</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Breakdown */}
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card border ${cat.borderColor} rounded-2xl p-5 bg-slate-900/20`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cat.color}/10 border border-white/[0.06] flex items-center justify-center`}>
                    <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-poppins">{cat.label}</p>
                    <p className="text-[10px] text-slate-500 font-poppins">{cat.count} {cat.unit} · {formatSize(cat.bytes)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleClean(cat.key)}
                  disabled={cleaning === cat.key || cat.count === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold font-poppins transition-all border border-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
                  {cleaning === cat.key
                    ? <span className="w-3 h-3 border border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                    : <Trash2 className="w-3 h-3" />}
                  Clear
                </button>
              </div>
              <AnimatedBar
                pct={storage.total > 0 ? (cat.bytes / storage.total) * 100 : 0}
                color={cat.color}
                delay={i * 0.15 + 0.2}
              />
              <p className="text-[10px] text-slate-500 font-poppins mt-1.5">
                {storage.total > 0 ? ((cat.bytes / storage.total) * 100).toFixed(1) : '0'}% of your content
              </p>
            </motion.div>
          ))}
        </div>

        {/* Storage Tier Info */}
        <div className="rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/10 p-5">
          <div className="flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white font-poppins mb-1">Free Tier — 10 GB</p>
              <p className="text-xs text-slate-400 font-poppins leading-relaxed">
                You're on the UniMind Free plan. Upgrade to Scholar Pro for 100 GB storage, priority sync, and advanced analytics.
              </p>
              <button className="mt-3 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold font-poppins transition-colors border border-cyan-500/30">
                Upgrade to Pro →
              </button>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-slate-200 text-sm font-poppins transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh Storage Stats
        </button>
      </div>
    </SettingsPageLayout>
  );
};
