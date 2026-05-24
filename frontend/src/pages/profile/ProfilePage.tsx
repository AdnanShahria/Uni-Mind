import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { PostCard } from '../../components/feed/PostCard';
import { UserPlus, UserCheck, ArrowLeft } from 'lucide-react';

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (!id) return;

    // Fetch profile user
    const { data: userData } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (userData) {
      setProfileUser(userData);
    } else {
      // For mock purposes, if no public user exists, create a dummy
      setProfileUser({ id, name: 'Unknown Scholar', role: 'Academic', institution: 'University' });
    }

    // Fetch posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, users(name, role)')
      .eq('author_id', id)
      .order('created_at', { ascending: false });
    if (postsData) setPosts(postsData);

    // Fetch connection status
    if (user && user.id !== id) {
      const { data: conn } = await supabase.from('connections').select('*').eq('user_id', user.id).eq('friend_id', id).maybeSingle();
      setIsFollowing(!!conn);
    }

    // Fetch followers count
    const { count } = await supabase.from('connections').select('*', { count: 'exact', head: true }).eq('friend_id', id);
    setFollowersCount(count || 0);
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    if (isFollowing) {
      await supabase.from('connections').delete().eq('user_id', currentUser.id).eq('friend_id', id);
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      await supabase.from('connections').insert([{ user_id: currentUser.id, friend_id: id, status: 'accepted' }]);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  if (!profileUser) {
    return <div className="p-8 text-center text-white font-poppins">Loading profile...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1000px] mx-auto p-6 lg:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-poppins text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold font-poppins shadow-lg border-4 border-[#0f172a]">
              {profileUser.name?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-outfit mb-1">{profileUser.name}</h1>
              <p className="text-lg text-primary-glow font-poppins font-medium">{profileUser.role}</p>
              <p className="text-sm text-slate-400 font-poppins">{profileUser.institution || 'Global Network'}</p>
              <p className="text-xs text-slate-500 font-poppins mt-2">{followersCount} Followers</p>
            </div>
          </div>
          {currentUser && currentUser.id !== id && (
            <button 
              onClick={handleFollow}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold font-poppins transition-all shadow-lg ${
                isFollowing 
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10' 
                  : 'bg-primary hover:bg-primary-glow text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isFollowing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-white font-outfit mb-4">Scholarly Contributions</h2>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-poppins text-sm border border-white/[0.06] rounded-2xl border-dashed">
            No posts found for this user.
          </div>
        ) : (
          posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} currentUser={currentUser} />
          ))
        )}
      </div>
    </motion.div>
  );
};
