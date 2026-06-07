import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { Podium } from './Podium';
import { RankList } from './RankList';
import { TrophyRoom } from './TrophyRoom';
import { Trophy, Users, Globe, Info, Search, Filter, X } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'university'>('global');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ institution: '', major: '', session: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let authUser = currentUser;
        if (!authUser) {
          const { data } = await turso.auth.getUser();
          authUser = data?.user;
          if (authUser) setCurrentUser(authUser);
        }

        let query = turso.from('users').select('id, name, knowledge_score, study_streak, badges, institution, major, session');

        if (activeTab === 'university' && authUser?.user_metadata?.institution) {
          query = query.eq('institution', authUser.user_metadata.institution);
        } else if (filters.institution) {
          query = query.eq('institution', filters.institution);
        }

        if (filters.major) {
          query = query.eq('major', filters.major);
        }
        if (filters.session) {
          query = query.eq('session', filters.session);
        }
        if (filters.search) {
          query = query.ilike('name', filters.search);
        }

        // Fetch top 50 users based on filters
        const { data: topUsers } = await query
          .order('knowledge_score', { ascending: false })
          .limit(50);
          
        if (topUsers) {
          // Format them
          const formatted = topUsers.map((u: any, index: number) => {
            let badgesArr: any[] = [];
            try {
              badgesArr = u.badges ? JSON.parse(u.badges) : [];
            } catch (e) {
              // ignore error
            }

            return {
              id: u.id,
              name: u.name?.split(' ')[0] || 'Anonymous',
              score: u.knowledge_score || 0,
              streak: u.study_streak || 0,
              avatar: null, // Mocks for now
              rank: index + 1,
              trend: index === 0 ? 'same' : (Math.random() > 0.6 ? 'up' : 'down') as 'up'|'down'|'same', // mock trend
              badges: badgesArr
            };
          });
          setUsers(formatted);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
    fetchLeaderboard();
  }, [activeTab, filters]);

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  // Find current user badges
  const myData = users.find(u => u.id === currentUser?.id);
  const myBadges = myData?.badges || [];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-screen"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-garamond text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Academic Leaderboard
            </h1>
            <button 
              onClick={() => setShowInfo(true)} 
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-400 mt-1">Climb the ranks by contributing to communities, generating notes, and maintaining streaks.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'global' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Global
            </button>
            <button
              onClick={() => setActiveTab('university')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'university' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              My University
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-colors ${showFilters ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search by name..."
                   value={filters.search}
                   onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                   className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                 />
               </div>
               {activeTab === 'global' && (
                 <input 
                   type="text" 
                   placeholder="University / Institution"
                   value={filters.institution}
                   onChange={(e) => setFilters(prev => ({...prev, institution: e.target.value}))}
                   className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                 />
               )}
               <input 
                 type="text" 
                 placeholder="Subject / Major"
                 value={filters.major}
                 onChange={(e) => setFilters(prev => ({...prev, major: e.target.value}))}
                 className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
               />
               <input 
                 type="text" 
                 placeholder="Session (e.g., 2023)"
                 value={filters.session}
                 onChange={(e) => setFilters(prev => ({...prev, session: e.target.value}))}
                 className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Score Calculation</h3>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>Your <strong>Knowledge Score</strong> is a measure of your academic contributions and consistency.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Community Engagement:</strong> Answering questions and helping peers earns you points based on upvotes.</li>
                  <li><strong className="text-white">Resource Sharing:</strong> Uploading high-quality notes and study materials increases your score when others find them useful.</li>
                  <li><strong className="text-white">Study Streaks:</strong> Maintaining a daily study streak acts as a multiplier, accelerating your point accumulation.</li>
                  <li><strong className="text-white">Badges:</strong> Earning achievements and badges grants lump-sum bonus points to your score.</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Leaderboard Column */}
          <div className="xl:col-span-2 space-y-8">
            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
              {top3.length > 0 && <Podium topUsers={top3} />}
            </motion.div>
            
            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
              <RankList users={others} currentUserId={currentUser?.id} />
            </motion.div>
          </div>

          {/* Right Sidebar: Trophy Room */}
          <div className="xl:col-span-1">
            <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } }} className="sticky top-6">
              <TrophyRoom earnedBadgeIds={myBadges} />
            </motion.div>
          </div>

        </div>
      )}
    </motion.div>
  );
};
