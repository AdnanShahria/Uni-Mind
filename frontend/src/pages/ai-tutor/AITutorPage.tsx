import { useState, useRef, useEffect, useCallback } from 'react';
import { turso } from '../../utils/tursoClient';
import { AITutorHeader } from './AITutorHeader';
import { AITutorSidebar } from './AITutorSidebar';
import { ChatMessages } from './ChatMessages';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessageInput } from './MessageInput';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { useTopBarContext } from '../../contexts/TopBarContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

import { callAIStream, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../utils/aiClient';

// ─── Constants ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are UniMind AI Tutor — a super advanced academic assistant for university students. 
You are an expert in explaining complex topics clearly, step-by-step problem solving, and generating quizzes or summaries.
Format your responses beautifully using Markdown. 
Use LaTeX for math equations (e.g. $E=mc^2$ or $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$). 
For tables, always use standard Markdown tables. Never use ASCII tables inside code blocks.
For diagrams, flowcharts, or visual representations, ALWAYS use \`\`\`mermaid code blocks. Never use ASCII art.
Use formatted code blocks for code snippets.
Be concise, accurate, and highly educational.`;

// ─── Smart Contextual Simulation (Fallback) ───────────────────────────────
async function simulateStream(question: string, onChunk: (c: string) => void): Promise<string> {
  const fallback = `## Great Question! 🎓\n\nYou asked: "${question}"\n\nI am currently in **Offline Simulation Mode** because no Groq API Key was found.\n\nBut here is a math equation anyway:\n$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} $$`;
  const chunks = fallback.split(' ');
  for (let i = 0; i < chunks.length; i++) {
    onChunk(chunks[i] + ' ');
    await new Promise(r => setTimeout(r, 50)); // typing effect
  }
  return fallback;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const AITutorPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('Scholar');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [userId, setUserId] = useState<string | null>(null);
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  const [isFastResearch, setIsFastResearch] = useState(false);
  
  // File Context
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileContent, setAttachedFileContent] = useState<string | null>(null);
  const [attachedFileType, setAttachedFileType] = useState<'text' | 'image' | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { setLeftContent } = useTopBarContext();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const GREETING = "Hello! I'm your **Super Advanced AI Tutor** 🎓\n\nI can help you with:\n- **Understanding** complex topics\n- **Solving** math and coding problems\n- **Analyzing** documents and images you attach (.txt, .pdf, .docx, .jpg, .png)\n\nWhat would you like to learn today?";

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    // Only scroll when a completely new message is added to the chat
    if (isNewMessage) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    
    // Auto-scroll during typing has been completely disabled per request.
  }, [messages, isTyping]);

  const initConversation = useCallback(async (uid: string) => {
    const { data: newConv } = await turso
      .from('ai_conversations')
      .insert([{ user_id: uid }])
      .select()
      .single();
    if (newConv) {
      setActiveConvId(newConv.id);
      setConversations(prev => [newConv, ...prev]);
    }
    return newConv?.id || null;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prompts } = await turso.from('ai_prompts').select('*');
        if (prompts && prompts.length > 0) setDbPrompts(prompts);
      } catch (_) { /* use fallback prompts */ }

      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Scholar');

        const { data: convs } = await turso
          .from('ai_conversations')
          .select('id, title, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20);

        let convId: string | null = null;
        if (convs && convs.length > 0) {
          setConversations(convs);
          convId = convs[0].id;
          setActiveConvId(convId);
        } else {
          setActiveConvId(null);
        }

        if (convId) {
          const { data: msgs } = await turso
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

          if (msgs && msgs.length > 0) {
            setMessages(msgs);
          } else {
            setMessages([{ id: 'welcome', role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
          }
        }
      } else {
        setMessages([{ id: 'welcome', role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
      }
    };
    fetchData();
  }, [initConversation]);

  const handleNewChat = async () => {
    setMessages([{ id: 'welcome-' + Date.now(), role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
    setInput('');
    handleFileRemove();
    setActiveConvId(null);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    setMessages([]); // Clear immediately for smooth transition
    const { data: msgs } = await turso
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    
    if (msgs && msgs.length > 0) {
      setMessages(msgs);
    } else {
      setMessages([{ id: 'welcome-' + Date.now(), role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
    }
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    // Optimistic UI updates
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        handleSelectConversation(remaining[0].id);
      } else {
        handleNewChat();
      }
    }

    // Background deletion
    try {
      await turso.from('ai_conversations').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  };

  const handleFileAttach = async (file: File) => {
    setIsParsing(true);
    setAttachedFileName(file.name);

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFileContent(e.target?.result as string);
          setAttachedFileType('image');
          setIsParsing(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setAttachedFileContent(text);
        setAttachedFileType('text');
        setIsParsing(false);
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setAttachedFileContent(result.value);
        setAttachedFileType('text');
        setIsParsing(false);
      } else {
        // Assume text file
        const text = await file.text();
        setAttachedFileContent(text);
        setAttachedFileType('text');
        setIsParsing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to parse file');
      handleFileRemove();
      setIsParsing(false);
    }
  };

  const handleFileRemove = () => {
    setAttachedFileName(null);
    setAttachedFileContent(null);
    setAttachedFileType(null);
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = (overrideInput ?? input).trim();
    if (!messageText && !attachedFileContent) return;

    setInput('');
    setIsTyping(true);

    // Keep references to current state before clearing
    const currentFileType = attachedFileType;
    const currentFileContent = attachedFileContent;

    // Clear attachment after sending
    handleFileRemove();

    let researchContext = '';
    if (isFastResearch && userId) {
      try {
        const { data: notes } = await turso
          .from('notes')
          .select('title, content')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (notes && notes.length > 0) {
          researchContext = "\n\n[Fast Research Context - Recent Notes]\n" + notes.map((n: any) => `Title: ${n.title}\nContent: ${n.content?.substring(0, 500)}...`).join('\n\n');
        }
      } catch (e) {
        console.error("Fast research error", e);
      }
    }

    const displayMessage = currentFileContent 
      ? `*(Attached ${attachedFileName})*\n\n${messageText}` 
      : messageText;
      
    const backendMessageText = messageText + researchContext;

    // Immediately show user message and AI placeholder
    const tempUserMsg = { id: Date.now(), role: 'user', content: displayMessage, timestamp: 'Just now' };
    const aiMsgId = Date.now() + 1;
    setMessages(prev => [
      ...prev, 
      tempUserMsg,
      { id: aiMsgId, role: 'assistant', content: '', timestamp: 'Just now' }
    ]);

    let currentConvId = activeConvId;
    if (!currentConvId && userId) {
      currentConvId = await initConversation(userId);
    }

    if (currentConvId) {
      await turso.from('ai_messages').insert([{
        conversation_id: currentConvId,
        role: 'user',
        content: displayMessage
      }]);

      // Update conversation title if it's the first message
      if (messages.length === 0) { // Since messages in closure is before the setState
        const title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
        await turso.from('ai_conversations').update({ title }).eq('id', currentConvId);
        setConversations(prev => prev.map(c => c.id === currentConvId ? { ...c, title } : c));
      }
    }

    try {
      let finalContent = '';

      if (AGENT_ROUTER_API_KEY || GROQ_API_KEY) {
        const history = messages.filter(m => m.role === 'user' || m.role === 'assistant');
        
        let formattedUserMessage: any = backendMessageText;
        if (currentFileType === 'text' && currentFileContent) {
          formattedUserMessage = `[Attached Context]\n${currentFileContent}\n\nUser Message: ${backendMessageText}`;
        } else if (currentFileType === 'image' && currentFileContent) {
          formattedUserMessage = [
            { type: "text", text: backendMessageText || "Please describe this image." },
            { type: "image_url", image_url: { url: currentFileContent } }
          ];
        }

        const formattedMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-15).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          { role: 'user', content: formattedUserMessage }
        ];

        finalContent = await callAIStream(
          formattedMessages,
          (chunk) => {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
            ));
          },
          {
            agentRouterModel: currentFileType === 'image' ? 'gpt-4o' : undefined,
            groqModel: currentFileType === 'image' ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile',
          }
        );
      } else {
        finalContent = await simulateStream(backendMessageText, (chunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
          ));
        });
      }

      if (currentConvId) {
        await turso.from('ai_messages').insert([{
          conversation_id: currentConvId,
          role: 'assistant',
          content: finalContent
        }]);
      }
    } catch (err) {
      console.error(err);
      const fallback = "Oops! I ran into an error connecting to my brain. Please try again.";
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, content: fallback } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setLeftContent(
      <AITutorHeader 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    );
    return () => setLeftContent(null);
  }, [isSidebarOpen, messages, userId]); // Dependencies needed for handleNewChat to have latest state

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      <AITutorSidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        isOpen={isSidebarOpen}
      />
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-[15] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 z-0">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          <ChatMessages
            messages={messages}
            isTyping={isTyping} 
            userName={userName}
            onAction={handleSend}
          />

          {messages.length <= 1 && (
            <SuggestedPrompts
              prompts={dbPrompts}
              handlePromptClick={handlePromptClick}
            />
          )}
          
          <div className="h-4 shrink-0" />
        </div>
      </div>

        <MessageInput
          input={input}
          setInput={setInput}
          handleSend={() => handleSend()}
          isTyping={isTyping || isParsing}
          attachedFileName={attachedFileName}
          onFileAttach={handleFileAttach}
          onFileRemove={handleFileRemove}
          isFastResearch={isFastResearch}
          setIsFastResearch={setIsFastResearch}
        />
      </div>
    </div>
  );
};
