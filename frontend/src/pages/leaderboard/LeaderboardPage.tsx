import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { turso } from '../../utils/tursoClient';
import { Podium } from './Podium';
import { RankList } from './RankList';
import { TrophyRoom } from './TrophyRoom';
import { Trophy, Users, Globe } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'university'>('global');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: { user: authUser } } = await turso.auth.getUser();
        if (authUser) {
          setCurrentUser(authUser);
        }

        // Fetch top 50 users by knowledge_score
        const { data: topUsers } = await turso
          .from('users')
          .select('id, name, knowledge_score, study_streak, badges')
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
  }, []);

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
          <h1 className="text-3xl font-bold font-garamond text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Academic Leaderboard
          </h1>
          <p className="text-slate-400 mt-1">Climb the ranks by contributing to communities, generating notes, and maintaining streaks.</p>
        </div>

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
      </div>

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
