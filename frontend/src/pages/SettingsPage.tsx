import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  Settings,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Database,
  Monitor,
  ChevronRight,
  Shield,
  Key,
  Mail,
  HardDrive,
  Trash2,
  Heart,
  MessageSquare,
  Share2,
  TrendingUp
} from 'lucide-react';
import { EditProfileModal } from '../components/settings/EditProfileModal';

const settingSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Information', desc: 'Update your name, avatar, and bio', color: 'text-blue-400' },
      { icon: Mail, label: 'Email Settings', desc: 'Manage email preferences and verification', color: 'text-cyan-400' },
      { icon: Lock, label: 'Password & Security', desc: 'Change password and enable 2FA', color: 'text-emerald-400' },
      { icon: Key, label: 'API Keys', desc: 'Manage your developer API access tokens', color: 'text-amber-400' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Palette, label: 'Appearance', desc: 'Theme, font size, and display preferences', color: 'text-purple-400' },
      { icon: Bell, label: 'Notifications', desc: 'Configure push and email notifications', color: 'text-rose-400' },
      { icon: Globe, label: 'Language & Region', desc: 'Set your language and timezone', color: 'text-teal-400' },
      { icon: Monitor, label: 'Accessibility', desc: 'Screen reader and motion preferences', color: 'text-orange-400' },
    ],
  },
  {
    title: 'Data & Storage',
    items: [
      { icon: Database, label: 'Data Management', desc: 'Export or delete your academic data', color: 'text-indigo-400' },
      { icon: HardDrive, label: 'Storage Usage', desc: '2.4 GB of 10 GB used', color: 'text-cyan-400' },
      { icon: Shield, label: 'Privacy', desc: 'Control who can see your profile and notes', color: 'text-emerald-400' },
    ],
  },
];

export const SettingsPage = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postStats, setPostStats] = useState({ posts: 0, likes: 0, comments: 0, shares: 0 });
  useEffect(() => {
    const fetchUserAndStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch extended profile
        const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
        
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

        // Fetch mock stats or real stats
        // Real implementation would query posts, post_likes, post_comments
        const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id);
        
        // Mocking interactions for the dashboard demo
        setPostStats({
          posts: postCount || 0,
          likes: (postCount || 0) * 12 + Math.floor(Math.random() * 20),
          comments: (postCount || 0) * 4 + Math.floor(Math.random() * 10),
          shares: (postCount || 0) * 2 + Math.floor(Math.random() * 5),
        });
      }
    };
    fetchUserAndStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-400 font-poppins mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-6 flex items-center gap-4"
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
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-xs text-slate-300 font-poppins font-medium transition-colors whitespace-nowrap"
        >
          Edit Profile
        </button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white font-outfit">{postStats.posts}</span>
            <span className="text-[11px] text-slate-500 font-poppins uppercase tracking-wider mt-1">Total Posts</span>
          </div>
          <div className="rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 p-4 flex flex-col items-center justify-center text-center">
            <Heart className="w-5 h-5 text-rose-400 mb-2" />
            <span className="text-2xl font-bold text-rose-400 font-outfit">{postStats.likes}</span>
            <span className="text-[11px] text-rose-400/60 font-poppins uppercase tracking-wider mt-1">Likes</span>
          </div>
          <div className="rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10 p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-5 h-5 text-cyan-400 mb-2" />
            <span className="text-2xl font-bold text-cyan-400 font-outfit">{postStats.comments}</span>
            <span className="text-[11px] text-cyan-400/60 font-poppins uppercase tracking-wider mt-1">Comments</span>
          </div>
          <div className="rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 p-4 flex flex-col items-center justify-center text-center">
            <Share2 className="w-5 h-5 text-emerald-400 mb-2" />
            <span className="text-2xl font-bold text-emerald-400 font-outfit">{postStats.shares}</span>
            <span className="text-[11px] text-emerald-400/60 font-poppins uppercase tracking-wider mt-1">Shares</span>
          </div>
        </div>
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
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-3 px-1">{section.title}</h3>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {section.items.map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 font-poppins group-hover:text-white transition-colors">{item.label}</p>
                  <p className="text-[11px] text-slate-500 font-poppins mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-red-500/[0.04] border border-red-500/10 p-5"
      >
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-[0.18em] font-poppins mb-3">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200 font-poppins">Delete Account</p>
            <p className="text-[11px] text-slate-500 font-poppins mt-0.5">Permanently delete your account and all data</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold font-poppins transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </motion.div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentUser={userProfile} 
        onProfileUpdated={() => {
          // Re-fetch user profile to show updates
          const fetchUser = async () => {
            const { data: profileData } = await supabase.from('users').select('*').eq('id', userProfile.id).single();
            if (profileData) {
              setUserProfile((prev: any) => ({
                ...prev,
                name: profileData.name,
                bio: profileData.bio,
                relationship_status: profileData.relationship_status,
                graduations: profileData.graduations || [],
              }));
            }
          };
          fetchUser();
        }} 
      />
    </motion.div>
  );
};
