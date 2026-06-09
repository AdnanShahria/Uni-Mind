import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../utils/tursoClient';
import {
  Settings,
  User,
  RefreshCw,
  Bell,
  Lock,
  Palette,
  Globe,
  Database,
  Monitor,
  Shield,
  Key,
  Mail,
  HardDrive,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useTopBarContext } from '../contexts/TopBarContext';

const settingSections = [
  {
    title: 'Preferences',
    hubPath: '/app/settings/preferences',
    items: [
      { id: 'appearance', path: '/app/settings/appearance', icon: Palette, label: 'Appearance', desc: 'Theme, font size, and display preferences', color: 'text-purple-400' },
      { id: 'notifications', path: '/app/settings/notifications', icon: Bell, label: 'Notifications', desc: 'Configure push and email notifications', color: 'text-rose-400' },
      { id: 'language', path: '/app/settings/language', icon: Globe, label: 'Language & Region', desc: 'Set your language and timezone', color: 'text-teal-400' },
      { id: 'accessibility', path: '/app/settings/accessibility', icon: Monitor, label: 'Accessibility', desc: 'Screen reader and motion preferences', color: 'text-orange-400' },
    ],
  },
  {
    title: 'Data & Storage',
    hubPath: '/app/settings/data-storage',
    items: [
      { id: 'data', path: '/app/settings/data', icon: Database, label: 'Data Management', desc: 'Export or delete your academic data', color: 'text-indigo-400' },
      { id: 'storage', path: '/app/settings/storage', icon: HardDrive, label: 'Storage Usage', desc: '2.4 GB of 10 GB used', color: 'text-cyan-400' },
      { id: 'privacy', path: '/app/settings/privacy', icon: Shield, label: 'Privacy', desc: 'Control who can see your profile and notes', color: 'text-emerald-400' },
    ],
  },
];

export const SettingsPage = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [postStats, setPostStats] = useState({ posts: 0, likes: 0, comments: 0, shares: 0 });
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-5 h-5 text-slate-400 shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white truncate">
            Settings
          </h1>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [setLeftContent]);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        // Fetch extended profile
        const { data: profileData } = await turso.from('users').select('*').eq('id', user.id).single();
        
        setUserProfile({
          id: user.id,
          name: profileData?.name || user.user_metadata?.name || 'Scholar',
          email: user.email,
          session: user.user_metadata?.session || 'No Session Set',
          initial: (profileData?.name || user.user_metadata?.name || 'S')[0].toUpperCase(),
          role: profileData?.role || user.user_metadata?.role || 'Academic',
          bio: profileData?.bio,
          relationship_status: profileData?.relationship_status,
          graduations: profileData?.graduations || [],
        });

        // Fetch real counts
        const { count: postCount } = await turso.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id);
        const { count: likeCount } = await turso.from('post_likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: commentCount } = await turso.from('post_comments').select('*', { count: 'exact', head: true }).eq('author_id', user.id);
        const { count: shareCount } = await turso.from('post_shares').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

        setPostStats({
          posts: postCount || 0,
          likes: likeCount || 0,
          comments: commentCount || 0,
          shares: shareCount || 0,
        });
      }
    };
    fetchUserAndStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass-card p-4 md:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold font-poppins shadow-lg">
          {userProfile?.initial || 'S'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-white font-poppins">{userProfile?.name || 'Scholar'}</p>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-glow text-[10px] font-semibold font-poppins tracking-wide">
              {userProfile?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-poppins mb-1">{userProfile?.email || 'scholar@university.edu'}</p>
          
          {userProfile?.bio && (
            <p className="text-sm text-slate-300 font-poppins mt-2 mb-2 italic">"{userProfile.bio}"</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {userProfile?.relationship_status && (
              <span className="text-[10px] text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md font-poppins">
                {userProfile.relationship_status}
              </span>
            )}
            {userProfile?.graduations?.map((grad: string, i: number) => (
              <span key={i} className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md font-poppins">
                {grad}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0 w-full md:w-auto">
          <Link to="/app/settings/profile" className="flex items-center gap-2 p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors sm:min-w-[130px]">
            <User className="w-4 h-4 text-primary-glow" />
            <span className="text-xs font-medium text-slate-200">Profile Info</span>
          </Link>
          <Link to="/app/settings/email" className="flex items-center gap-2 p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors sm:min-w-[130px]">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-200">Email</span>
          </Link>
          <Link to="/app/settings/password" className="flex items-center gap-2 p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors sm:min-w-[130px]">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-200">Password</span>
          </Link>
          <Link to="/app/settings/api-keys" className="flex items-center gap-2 p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors sm:min-w-[130px]">
            <Key className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-200">API Keys</span>
          </Link>
        </div>
      </motion.div>

      {/* Post Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-3 px-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Post Dashboard
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Total Posts */}
          <Link to="/app/settings/my-posts"
            className="group rounded-xl glass-card p-3 flex items-center justify-between hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 cursor-pointer">
            <div className="text-left flex flex-col">
              <span className="text-[10px] text-slate-400 font-poppins uppercase tracking-wider">Total Posts</span>
              <span className="text-[9px] text-primary-glow font-poppins opacity-0 group-hover:opacity-100 transition-opacity -mt-1 h-3">View all →</span>
            </div>
            <span className="text-xl font-bold text-white font-outfit group-hover:scale-110 transition-transform">{postStats.posts}</span>
          </Link>
          {/* Likes */}
          <Link to="/app/settings/my-likes"
            className="group rounded-xl bg-rose-500/[0.03] border border-rose-500/10 p-3 flex items-center justify-between hover:bg-rose-500/[0.08] hover:border-rose-500/25 transition-all duration-200 cursor-pointer">
            <div className="text-left flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] text-rose-400/60 font-poppins uppercase tracking-wider"><Heart className="w-3 h-3 text-rose-400" /> Likes</span>
              <span className="text-[9px] text-rose-400 font-poppins opacity-0 group-hover:opacity-100 transition-opacity -mt-1 h-3">View liked →</span>
            </div>
            <span className="text-xl font-bold text-rose-400 font-outfit group-hover:scale-110 transition-transform">{postStats.likes}</span>
          </Link>
          {/* Comments */}
          <Link to="/app/settings/my-comments"
            className="group rounded-xl bg-cyan-500/[0.03] border border-cyan-500/10 p-3 flex items-center justify-between hover:bg-cyan-500/[0.08] hover:border-cyan-500/25 transition-all duration-200 cursor-pointer">
            <div className="text-left flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] text-cyan-400/60 font-poppins uppercase tracking-wider"><MessageSquare className="w-3 h-3 text-cyan-400" /> Comments</span>
              <span className="text-[9px] text-cyan-400 font-poppins opacity-0 group-hover:opacity-100 transition-opacity -mt-1 h-3">View all →</span>
            </div>
            <span className="text-xl font-bold text-cyan-400 font-outfit group-hover:scale-110 transition-transform">{postStats.comments}</span>
          </Link>
          {/* Shares */}
          <Link to="/app/settings/my-shares"
            className="group rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 p-3 flex items-center justify-between hover:bg-emerald-500/[0.08] hover:border-emerald-500/25 transition-all duration-200 cursor-pointer">
            <div className="text-left flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400/60 font-poppins uppercase tracking-wider"><Share2 className="w-3 h-3 text-emerald-400" /> Shares</span>
              <span className="text-[9px] text-emerald-400 font-poppins opacity-0 group-hover:opacity-100 transition-opacity -mt-1 h-3">View all →</span>
            </div>
            <span className="text-xl font-bold text-emerald-400 font-outfit group-hover:scale-110 transition-transform">{postStats.shares}</span>
          </Link>
        </div>
        <p className="text-[9px] text-slate-600 font-poppins mt-2 px-1">Click any card to manage your post activity</p>
      </motion.div>

      {/* Settings Sections */}
      {settingSections.map((section, si) => (
        <motion.div
          key={si}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins">{section.title}</h3>
            <Link to={(section as any).hubPath} className="text-[10px] font-semibold text-slate-500 hover:text-slate-300 transition-colors font-poppins tracking-wide">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.items.map((item: any, i: number) => (
              <Link
                key={i}
                to={item.path}
                className="group rounded-xl glass-card border border-white/[0.06] hover:border-white/[0.12] p-3 flex items-center gap-3 transition-all duration-200 hover:bg-white/[0.03]"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.12] shrink-0 transition-colors">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-200 font-poppins group-hover:text-white transition-colors leading-tight truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-poppins mt-0.5 leading-snug truncate">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-amber-500/[0.04] border border-amber-500/10 p-5"
      >
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-[0.18em] font-poppins mb-3">Reset Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200 font-poppins">Reset Account Content</p>
            <p className="text-[11px] text-slate-500 font-poppins mt-0.5">Clear your posts, notes & comments — account stays safe</p>
          </div>
          <Link 
            to="/app/settings/data"
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold font-poppins transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
};
