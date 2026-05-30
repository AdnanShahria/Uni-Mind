import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatCreated: (conv: any) => void;
}

export const NewChatModal = ({ isOpen, onClose, currentUserId, onChatCreated }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await turso.from('users')
          .select('id, name, email')
          .neq('id', currentUserId)
          .ilike('name', `%${searchQuery}%`)
          .limit(10);
        
        if (data) {
          setUsers(data);
        }
      } catch (e) {
        console.error("Failed to search users", e);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, currentUserId]);

  const handleCreateChat = async (targetUserId: string, targetUserName: string) => {
    setIsCreating(true);
    try {
      // 1. Check if conversation already exists (Direct Message)
      // This requires checking conversation_members. A simplified approach:
      // Just create a new one, or if we want to be strict, query existing.
      
      const convId = crypto.randomUUID();
      
      // Insert Conversation
      await turso.from('conversations').insert([{
        id: convId,
        type: 'direct'
      }]);

      // Insert Members (Self and Target)
      await turso.from('conversation_members').insert([
        { conversation_id: convId, user_id: currentUserId },
        { conversation_id: convId, user_id: targetUserId }
      ]);

      const mockConv = {
        id: convId,
        name: targetUserName,
        avatar: targetUserName.substring(0, 2).toUpperCase(),
        color: 'from-emerald-500 to-teal-500',
        lastMsg: 'Started a new conversation',
        time: 'Just now',
        unread: 0,
        online: false,
        isGroup: false
      };

      onChatCreated(mockConv);
      toast.success('Conversation created!');
      onClose();

    } catch (e) {
      console.error(e);
      toast.error('Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl font-poppins"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              New Message
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="h-64 overflow-y-auto custom-scrollbar -mx-2 px-2">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                {users.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleCreateChat(user.id, user.name)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-outfit border border-emerald-500/30">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No users found.</div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">Type a name to search...</div>
            )}
          </div>
          
          {isCreating && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
