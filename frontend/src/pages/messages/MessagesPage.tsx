import { useState, useEffect, useRef } from 'react';
import { turso } from '../../utils/tursoClient';
import { MessagesSidebar } from './MessagesSidebar';
import { ChatArea } from './ChatArea';
import { NewChatModal } from './NewChatModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageCircle, Edit, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTopBarContext } from '../../contexts/TopBarContext';

import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../utils/aiClient';

export const MessagesPage = () => {
  const [dbConversations, setDbConversations] = useState<any[]>([]);
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [lastAiReplyId, setLastAiReplyId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { setLeftContent } = useTopBarContext();

  const activeConvRef = useRef(activeConv);
  const currentUserRef = useRef(currentUser);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between w-full pr-2">
        <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          UniChat
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="New Message"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [setIsNewChatOpen, setLeftContent]);

  const fetchConversations = async (userId: string) => {
    const { data: userConvs } = await turso
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId);

    if (userConvs && userConvs.length > 0) {
      const convIds = userConvs.map((c: any) => c.conversation_id);
      const { data: convData } = await turso
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      if (convData && convData.length > 0) {
        setDbConversations(convData.map((c: any) => ({
          id: c.id,
          name: c.name || 'Direct Message',
          avatar: c.name ? c.name.substring(0, 2).toUpperCase() : 'DM',
          color: 'from-emerald-500 to-teal-500',
          lastMsg: '...',
          time: 'Just now',
          unread: 0,
          online: false,
          isGroup: c.type === 'group'
        })));
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setCurrentUser(user);
      await fetchConversations(user.id);
      setIsLoading(false);
    };
    init();
  }, []);

  const generateSmartReplies = async (lastMsgContent: string) => {
    if (!AGENT_ROUTER_API_KEY && !GROQ_API_KEY) {
      setSmartReplies(["Yes, definitely!", "I'll check and let you know.", "Could you clarify?"]);
      return;
    }
    
    const prompt = `Generate 3 short, conversational reply suggestions (max 5 words each) to the following message. Return ONLY a JSON array of strings, nothing else. Message: "${lastMsgContent}"`;
    
    try {
      const content = await callAI(
        [{ role: 'user', content: prompt }],
        {
          groqModel: 'llama-3.1-8b-instant',
          temperature: 0.7
        }
      );
      
      const match = content.match(/\[.*\]/s);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) setSmartReplies(parsed.slice(0, 3));
      }
    } catch (e) {
      console.error('Failed to generate smart replies', e);
    }
  };

  const fetchMessages = async (convId: string, userId: string) => {
    const { data } = await turso
      .from('messages')
      .select('*, users(name)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    
    if (data) {
      const msgs = data.map((m: any) => ({
        id: m.id,
        sender: m.users?.name || 'Unknown',
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: m.sender_id === userId,
        read: m.is_read,
        metadata: m.metadata ? JSON.parse(m.metadata) : {}
      }));
      setDbMessages(msgs);

      // Set last AI reply for smart suggestions
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (!lastMsg.isOwn && lastMsg.id !== lastAiReplyId) {
          setLastAiReplyId(lastMsg.id);
          generateSmartReplies(lastMsg.content);
        } else if (lastMsg.isOwn) {
          setSmartReplies([]);
        }
      }

      // Mark unread messages as read
      const unreadIds = data.filter((m: any) => !m.is_read && m.sender_id !== userId).map((m: any) => m.id);
      if (unreadIds.length > 0) {
        try {
          await turso.from('messages')
            .update({ is_read: 1 })
            .in('id', unreadIds);
          
          // Optimistically update local state
          setDbMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read: true } : m));
          // Refresh conversation unread badges
          fetchConversations(userId);
        } catch (e) {
          console.error("Failed to mark as read", e);
        }
      }
    }
  };

   
  useEffect(() => {
    if (activeConv && currentUser) {
      fetchMessages(activeConv.id, currentUser.id);
    } else {
      setDbMessages([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv, currentUser]);

  // Polling mechanism (every 3 seconds)
   
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeConvRef.current && currentUserRef.current) {
        fetchMessages(activeConvRef.current.id, currentUserRef.current.id);
        fetchConversations(currentUserRef.current.id); // Also poll for new convs/last msg updates
      }
    }, 3000);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (content: string, metadata: any = {}) => {
    if (!currentUser || !activeConv) return;
    
    const { error } = await turso.from('messages').insert([{
      conversation_id: activeConv.id,
      sender_id: currentUser.id,
      content: content,
      metadata: JSON.stringify(metadata)
    }]);

    if (error) {
      toast.error('Failed to send message');
      throw error;
    } else {
      // Optimistically fetch messages
      fetchMessages(activeConv.id, currentUser.id);
      
      // Update conversation updated_at for sorting
      await turso.from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConv.id);
        
      fetchConversations(currentUser.id);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const msg = dbMessages.find(m => m.id === messageId);
    if (!msg) return;
    
    const newMetadata = { ...msg.metadata };
    newMetadata.reactions = newMetadata.reactions || [];
    if (!newMetadata.reactions.includes(emoji)) {
      newMetadata.reactions.push(emoji);
      
      // Optimistic update
      setDbMessages(prev => prev.map(m => m.id === messageId ? { ...m, metadata: newMetadata } : m));
      
      await turso.from('messages').update({ metadata: JSON.stringify(newMetadata) }).eq('id', messageId);
    }
  };

  const handleSummarize = async () => {
    if (!dbMessages.length) {
      toast.error('No messages to summarize.');
      return;
    }
    if (!AGENT_ROUTER_API_KEY && !GROQ_API_KEY) {
      // Mock summary if no API key
      setIsSummarizing(true);
      setTimeout(() => {
        setSummary("- Discussion about recent project deadlines.\n- Someone shared a link to the new documentation.\n- Agreed to meet at 5 PM tomorrow.");
        setIsSummarizing(false);
      }, 1500);
      return;
    }
    
    setIsSummarizing(true);
    
    const convoText = dbMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
    const prompt = `You are a helpful AI assistant. Summarize the following chat thread in a few concise bullet points so the user can quickly catch up on what they missed.

Chat Thread:
${convoText}

Format your output as a markdown list of key points. Keep it brief.`;

    try {
      const summaryContent = await callAI(
        [{ role: 'user', content: prompt }],
        {
          groqModel: 'llama-3.1-8b-instant',
          temperature: 0.3
        }
      );
      setSummary(summaryContent || 'Could not generate summary.');
    } catch (e) {
      toast.error('Network error. Failed to summarize thread.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]">
        {/* On mobile: show sidebar when no active conv, hide when conv is selected */}
        <div className={`${activeConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0`}>
          <MessagesSidebar
            isLoading={isLoading}
            conversations={dbConversations}
            activeConv={activeConv}
            setActiveConv={setActiveConv}
          />
        </div>
        {/* On mobile: show chat area only when a conv is selected */}
        <div className={`${activeConv ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
          <ChatArea
            activeConv={activeConv}
            messages={dbMessages}
            onSendMessage={handleSendMessage}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
            smartReplies={smartReplies}
            onReact={handleReaction}
            onBack={() => setActiveConv(null)}
          />
        </div>
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        currentUserId={currentUser?.id}
        onChatCreated={(conv) => {
          setDbConversations(prev => [conv, ...prev]);
          setActiveConv(conv);
        }}
      />

      {/* AI Summary Modal */}
      <AnimatePresence>
        {summary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSummary('')}
              className="absolute inset-0"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl font-poppins"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-white">Thread Summary</h3>
                    <p className="text-[11px] text-slate-400">AI-generated recap of the conversation</p>
                  </div>
                </div>
                <button
                  onClick={() => setSummary('')}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl max-h-[60vh] overflow-y-auto custom-scrollbar text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSummary('')}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-glow rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
