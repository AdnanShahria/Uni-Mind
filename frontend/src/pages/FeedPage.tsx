import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// Feed Components
import { PostInput } from '../components/feed/PostInput';
import { FeedTabs } from '../components/feed/FeedTabs';
import { PostCard } from '../components/feed/PostCard';
import { TrendingTopics } from '../components/feed/TrendingTopics';
import { SuggestedGroups } from '../components/feed/SuggestedGroups';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const FeedPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('For You');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    // Get current user session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // First try with users join
    let { data, error } = await supabase
      .from('posts')
      .select('*, users(name, role, avatar_url)')
      .order('created_at', { ascending: false });

    // Fallback if users relation fails (e.g. schema not fully applied)
    if (error) {
      console.warn("Could not fetch posts with users relation, trying without:", error);
      const fallback = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      setPosts(data);
    } else {
      console.warn("Could not fetch posts or no posts found:", error);
    }
  };

  // Mock filtering and recommendation algorithm
  const getProcessedPosts = () => {
    let result = [...posts];

    // 1. Tag Filtering
    if (activeTag) {
      return result.filter(post => post.tags && post.tags.includes(activeTag));
    }

    // 2. Tab Logic
    if (activeTab === 'Trending') {
      return result.filter(post => post.tags && post.tags.length > 0).sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
    }
    if (activeTab === 'Following') {
      // Mock empty state for following until connections are fully implemented
      return []; 
    }

    // 3. 'For You' Machine Learning Mock Recommendation Algorithm
    // Simulates an ML feed by scoring posts based on completeness and engagement
    if (activeTab === 'For You') {
      result.sort((a, b) => {
        // Mock scoring logic (Facebook-style relevance)
        let scoreA = 0;
        let scoreB = 0;
        
        // Title existence gives points
        if (a.title) scoreA += 10;
        if (b.title) scoreB += 10;

        // Content length gives points (engagement depth)
        scoreA += Math.min((a.content?.length || 0) / 10, 20);
        scoreB += Math.min((b.content?.length || 0) / 10, 20);

        // Tags give points (categorization)
        scoreA += (a.tags?.length || 0) * 5;
        scoreB += (b.tags?.length || 0) * 5;

        // Recency decay (newer posts get higher base score)
        const ageA = Date.now() - new Date(a.created_at).getTime();
        const ageB = Date.now() - new Date(b.created_at).getTime();
        if (ageA < ageB) scoreA += 15;
        else if (ageB < ageA) scoreB += 15;

        return scoreB - scoreA; // Descending order
      });
    }

    return result;
  };

  const filteredPosts = getProcessedPosts();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="max-w-[1200px] mx-auto p-6 lg:p-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeIn} className="mb-6">
        <h1 className="text-2xl font-bold font-outfit text-white">Academic Feed</h1>
        <p className="text-sm text-slate-400 font-poppins mt-1">
          Stay updated with your academic network
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          <PostInput currentUser={currentUser} onPostCreated={fetchPosts} />
          
          <FeedTabs activeTab={activeTab} setActiveTab={(tab) => {
            setActiveTab(tab);
            setActiveTag(null); // Clear tag filter when changing tabs
          }} />

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-poppins text-sm border border-white/[0.06] rounded-2xl border-dashed">
              No posts found.
            </div>
          ) : (
            filteredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} currentUser={currentUser} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <TrendingTopics onTagClick={(tag) => {
            setActiveTag(tag);
            setActiveTab('Trending');
          }} activeTag={activeTag} />
          <SuggestedGroups />
        </div>
      </div>
    </motion.div>
  );
};
