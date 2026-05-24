import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MessagesSidebar } from './MessagesSidebar';
import { ChatArea } from './ChatArea';

export const MessagesPage = () => {
  const [dbConversations, setDbConversations] = useState<any[]>([]);
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setCurrentUser(user);

      // Fetch conversations the user is part of
      const { data: userConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (userConvs && userConvs.length > 0) {
        const convIds = userConvs.map((c: any) => c.conversation_id);
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .in('id', convIds)
          .order('updated_at', { ascending: false });

        if (convData && convData.length > 0) {
          setDbConversations(convData.map(c => ({
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

      setIsLoading(false);
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*, users(name)')
          .eq('conversation_id', activeConv.id)
          .order('created_at', { ascending: true });
        
        if (data) {
          setDbMessages(data.map(m => ({
            id: m.id,
            sender: m.users?.name || 'Unknown',
            content: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.sender_id === currentUser?.id,
            read: m.is_read
          })));
        }
      };
      fetchMessages();
    }
  }, [activeConv, currentUser]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <MessagesSidebar
        isLoading={isLoading}
        conversations={dbConversations}
        activeConv={activeConv}
        setActiveConv={setActiveConv}
      />
      <ChatArea
        activeConv={activeConv}
        messages={dbMessages}
      />
    </div>
  );
};
