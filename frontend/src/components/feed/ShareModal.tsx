import { motion, AnimatePresence } from 'framer-motion';
import { X, Smile, MessageCircle, Send, Link as LinkIcon, Users, UserPlus, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../utils/supabaseClient';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  currentUser: any;
  onShareContent: (content: string) => void;
}

export const ShareModal = ({ isOpen, onClose, post, currentUser, onShareContent }: ShareModalProps) => {
  const [shareText, setShareText] = useState('');
  const [recentFriends, setRecentFriends] = useState<any[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchRecentFriends();
    }
  }, [isOpen, currentUser]);

  const fetchRecentFriends = async () => {
    setIsLoadingFriends(true);
    try {
      // 1. Get conversations the user is part of
      const { data: userConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (!userConvs || userConvs.length === 0) {
        setRecentFriends([]);
        setIsLoadingFriends(false);
        return;
      }

      const convIds = userConvs.map((c: any) => c.conversation_id);

      // 2. Get other members in these conversations
      const { data: otherMembers } = await supabase
        .from('conversation_members')
        .select('user_id, users(name, avatar_url)')
        .in('conversation_id', convIds)
        .neq('user_id', currentUser.id);

      if (otherMembers) {
        // Deduplicate by user_id
        const uniqueUsers = Array.from(new Map(otherMembers.map(m => [m.user_id, m.users])).values()).filter(Boolean);
        
        // Map to friend objects
        const friendsList = uniqueUsers.map((u: any) => ({
          name: u.name || 'Unknown Scholar',
          initial: u.name ? u.name[0].toUpperCase() : 'U'
        })).slice(0, 8); // limit to 8

        // If no friends found from DB, fallback to empty array (or we could show mock, but let's show empty/fallback state)
        setRecentFriends(friendsList);
      }
    } catch (error) {
      console.error('Error fetching recent friends:', error);
    }
    setIsLoadingFriends(false);
  };

  const handleShare = () => {
    onShareContent(shareText);
    setShareText('');
    onClose();
  };

  const handleFriendShare = (friendName: string) => {
    // In a real app, this would send a message via the messaging system
    alert(`Post shared with ${friendName} via Messages!`);
    onClose();
  };

  const handlePlatformShare = (platform: string) => {
    if (platform === 'Copy link') {
      navigator.clipboard.writeText(`${window.location.origin}/app/feed`); // Simulate post link
      alert('Link copied to clipboard!');
    } else {
      alert(`Shared to ${platform}!`);
    }
    onClose();
  };

  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Unknown Scholar';
  const initial = userName[0]?.toUpperCase() || 'U';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden border border-white/[0.08]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <div className="w-8 h-8"></div> {/* Spacer for centering */}
                <h2 className="text-lg font-bold text-white font-outfit">Share Post</h2>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto custom-scrollbar p-5 flex flex-col gap-5">
                
                {/* User Info & Textarea */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold font-poppins">
                    {initial}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[14px] font-semibold text-white font-poppins">{userName}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded text-[10px] font-medium text-slate-300">
                        Feed
                      </span>
                      <span className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded text-[10px] font-medium text-slate-300">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative mt-1">
                  <textarea
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    placeholder="Say something about this..."
                    className="w-full bg-transparent text-[15px] text-white placeholder-slate-500 font-poppins resize-none outline-none min-h-[60px]"
                  />
                  <div className="absolute right-0 bottom-0 text-slate-500 hover:text-primary cursor-pointer transition-colors">
                    <Smile className="w-5 h-5" />
                  </div>
                </div>

                {/* Shared Post Preview */}
                <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold font-poppins">
                      {post.users?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white font-poppins block">{post.users?.name || 'Unknown Scholar'}</span>
                      <span className="text-[10px] text-slate-500 font-poppins">Original Post</span>
                    </div>
                  </div>
                  {post.title && <h3 className="text-sm font-bold text-white mb-2 line-clamp-1 font-outfit">{post.title}</h3>}
                  <p className="text-[13px] text-slate-300 line-clamp-2 font-poppins leading-relaxed">{post.content}</p>
                </div>

                <button 
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-opacity font-poppins text-sm mt-2 shadow-lg shadow-primary/20"
                >
                  Share now
                </button>

                {/* Send in Messenger */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white mb-3 font-outfit">Recent Friends</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {isLoadingFriends ? (
                      <span className="text-xs text-slate-500 font-poppins">Loading...</span>
                    ) : recentFriends.length > 0 ? (
                      recentFriends.map((friend, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleFriendShare(friend.name)}
                          className="flex flex-col items-center gap-2 shrink-0 w-[60px] cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold font-poppins group-hover:scale-105 transition-transform shadow-lg">
                            {friend.initial}
                          </div>
                          <span className="text-[11px] font-medium text-slate-300 text-center leading-tight line-clamp-2 w-full break-words group-hover:text-white transition-colors font-poppins">
                            {friend.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-poppins">No recent chats.</span>
                    )}
                  </div>
                </div>

                {/* Share to Options */}
                <div className="mt-2 border-t border-white/[0.04] pt-5 pb-2">
                  <h3 className="text-sm font-bold text-white mb-4 font-outfit">Share to</h3>
                  <div className="flex flex-wrap gap-4 justify-between px-2">
                    <ShareOption onClick={() => handlePlatformShare('Messages')} icon={<MessageCircle className="w-5 h-5" />} label="Messages" color="hover:text-cyan-400 hover:bg-cyan-500/10" />
                    <ShareOption onClick={() => handlePlatformShare('Direct')} icon={<Send className="w-5 h-5" />} label="Direct" color="hover:text-emerald-400 hover:bg-emerald-500/10" />
                    <ShareOption onClick={() => handlePlatformShare('Your story')} icon={<div className="w-4 h-4 border-2 border-current rounded-md" />} label="Your story" color="hover:text-purple-400 hover:bg-purple-500/10" />
                    <ShareOption onClick={() => handlePlatformShare('Copy link')} icon={<LinkIcon className="w-5 h-5" />} label="Copy link" color="hover:text-amber-400 hover:bg-amber-500/10" />
                    <ShareOption onClick={() => handlePlatformShare('Group')} icon={<Users className="w-5 h-5" />} label="Group" color="hover:text-rose-400 hover:bg-rose-500/10" />
                    <ShareOption onClick={() => handlePlatformShare('Profile')} icon={<UserPlus className="w-5 h-5" />} label="Profile" color="hover:text-indigo-400 hover:bg-indigo-500/10" />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

const ShareOption = ({ icon, label, color, onClick }: { icon: React.ReactNode; label: string, color: string, onClick?: () => void }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group w-[64px]">
    <div className={`w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400 transition-all ${color}`}>
      {icon}
    </div>
    <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 text-center leading-tight font-poppins transition-colors">
      {label}
    </span>
  </div>
);
