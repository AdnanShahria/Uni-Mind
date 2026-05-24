import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { AITutorHeader } from './AITutorHeader';
import { ChatMessages } from './ChatMessages';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessageInput } from './MessageInput';

export const AITutorPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('Scholar');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch prompts
      const { data: prompts } = await supabase.from('ai_prompts').select('*');
      if (prompts) setDbPrompts(prompts);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name || 'Scholar');
        
        // Fetch AI conversations
        const { data: convs } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        let convId = null;
        if (convs && convs.length > 0) {
          convId = convs[0].id;
          setActiveConvId(convId);
        } else {
          // Create new conversation
          const { data: newConv } = await supabase
            .from('ai_conversations')
            .insert([{ user_id: user.id }])
            .select()
            .single();
          if (newConv) {
             convId = newConv.id;
             setActiveConvId(convId);
          }
        }

        if (convId) {
          // Fetch messages
          const { data: msgs } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
            
          if (msgs && msgs.length > 0) {
            setMessages(msgs);
          } else {
            // Initial greeting
            setMessages([{
              id: Date.now(),
              role: 'ai',
              content: "Hello! I'm your AI Tutor. I can help you understand complex topics, generate study materials, solve problems, and create flashcards. What would you like to learn today? 🎓",
              timestamp: 'Just now'
            }]);
          }
        }
      }
    };
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !activeConvId) return;

    const userMsgContent = input;
    setInput('');
    setIsTyping(true);
    
    // Optimistic UI
    const tempUserMsg = { id: Date.now(), role: 'user', content: userMsgContent, timestamp: 'Just now' };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Insert user message to DB
    await supabase.from('ai_messages').insert([{ conversation_id: activeConvId, role: 'user', content: userMsgContent }]);

    // Simulate AI response
    setTimeout(async () => {
      const aiResponseContent = `Great question! Let me break this down for you.\n\n**Key Points:**\n\n1. This is a foundational concept in your field of study\n2. Understanding this will help you with related topics\n3. Here's a simplified explanation...\n\nWould you like me to generate flashcards on this topic, or shall I explain in more detail? I can also create practice questions to test your understanding. 📚`;
      
      const { data: insertedAiMsg } = await supabase.from('ai_messages').insert([{ conversation_id: activeConvId, role: 'assistant', content: aiResponseContent }]).select().single();
      
      if (insertedAiMsg) {
         setMessages((prev) => [...prev, insertedAiMsg]);
      } else {
         setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiResponseContent, timestamp: 'Just now' }]);
      }
      setIsTyping(false);
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <AITutorHeader />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            userName={userName}
            messagesEndRef={messagesEndRef}
          />
          
          {messages.length <= 1 && (
            <SuggestedPrompts
              prompts={dbPrompts}
              handlePromptClick={handlePromptClick}
            />
          )}
        </div>
      </div>

      <MessageInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
      />
    </div>
  );
};
