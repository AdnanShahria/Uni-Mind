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

import { callAI, callAIStream, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../utils/aiClient';

// ─── Constants ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are UniMind AI Tutor — a super advanced academic assistant for university students. 
You are an expert in explaining complex topics clearly, step-by-step problem solving, and generating quizzes or summaries.
Format your responses beautifully using Markdown. 
Use LaTeX for math equations (e.g. $E=mc^2$ or $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$). 
For tables, always use standard Markdown tables. Never use ASCII tables inside code blocks.
For diagrams, flowcharts, or visual representations, ALWAYS use \`\`\`mermaid code blocks. Never use ASCII art.
Use formatted code blocks for code snippets.
Be concise, accurate, and highly educational.
IMPORTANT: You MUST respond in the same language as the user's message (e.g., if the user asks in Bengali/Bangla, you must reply entirely in fluent Bengali). If the user explicitly asks you to reply in a specific language, you must reply entirely in that requested language.`;

// ─── Smart Search Query Generator ─────────────────────────────────────────
const SEARCH_QUERY_PROMPT = `You are a search query optimizer. Given a user's question and optional document context, generate 2-3 highly targeted web search queries that would find the most relevant information.

Rules:
- Each query should be a concise, keyword-rich search string (not a question)
- If the document is about a specific topic, include key technical terms from it
- If the user requests a specific language, include one query in that language
- Return ONLY a JSON array of strings, nothing else
- Example: ["DC Generator armature field winding commutator", "DC Generator working principle explained", "ডিসি জেনারেটর যন্ত্রাংশ"]`;

async function generateSmartSearchQueries(
  userMessage: string,
  fileContent: string
): Promise<string[]> {
  try {
    // Send only first ~2000 chars of file content to keep it fast
    const contentPreview = fileContent.substring(0, 2000);
    const prompt = fileContent
      ? `[Document excerpt]:\n${contentPreview}\n\n[User's question]: ${userMessage}`
      : `[User's question]: ${userMessage}`;

    const response = await callAI(
      [
        { role: 'system', content: SEARCH_QUERY_PROMPT },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.3, max_tokens: 200, provider: 'agent-router' }
    );

    // Parse JSON array from response
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      const queries = JSON.parse(jsonMatch[0]);
      if (Array.isArray(queries) && queries.length > 0) {
        console.log('[Smart Search] Generated queries:', queries);
        return queries.slice(0, 3); // max 3 queries
      }
    }
    // Fallback: use the user message
    console.warn('[Smart Search] Failed to parse AI response, falling back to user message');
    return [userMessage];
  } catch (e) {
    console.error('[Smart Search] Query generation failed:', e);
    return [userMessage];
  }
}

async function executeParallelWebSearches(queries: string[]): Promise<string[]> {
  const allResults: string[] = [];
  const seen = new Set<string>();

  try {
    const searchPromises = queries.map(async (query) => {
      try {
        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          return { query, results: data.results || [] };
        }
      } catch (e) {
        console.error(`[Web Search] Failed for query "${query}":`, e);
      }
      return { query, results: [] };
    });

    const searchResults = await Promise.all(searchPromises);

    for (const { query, results } of searchResults) {
      for (const snippet of results) {
        // Deduplicate snippets
        const key = snippet.substring(0, 80).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          allResults.push(`[Query: "${query}"] ${snippet}`);
        }
      }
    }

    console.log(`[Web Search] Aggregated ${allResults.length} unique results from ${queries.length} queries`);
  } catch (e) {
    console.error('[Web Search] Parallel execution failed:', e);
  }

  return allResults;
}

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
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [userId, setUserId] = useState<string | null>(null);
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  
  // File Context
  // File Context
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [researchStatus, setResearchStatus] = useState<string>('');
  const { setLeftContent } = useTopBarContext();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const GREETING = "✨ **Welcome to UniTutor!**\nI'm ready to help you analyze files, solve problems, or master complex topics. What are we learning today?";

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
    const { data: newConv, error } = await turso
      .from('ai_conversations')
      .insert([{ user_id: uid }])
      .select()
      .single();
    
    if (error) {
      console.error("Failed to start conversation:", error);
      // Optional: you could add a toast.error here if toast is available
      return null;
    }

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
          try {
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
          } catch (err) {
            console.error('Failed to fetch messages for conversation:', err);
            setMessages([{ id: 'welcome', role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
          }
        } else {
          // Logged-in user with no conversations — show welcome message
          setMessages([{ id: 'welcome', role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
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
    setAttachedFiles([]);
    setActiveConvId(null);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    setMessages([]); // Clear immediately for smooth transition
    try {
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
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
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

  const handleFileAttach = async (files: FileList) => {
    const newFiles = Array.from(files);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index?: number) => {
    if (index !== undefined) {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setAttachedFiles([]);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = (overrideInput ?? input).trim();
    if (!messageText && attachedFiles.length === 0) return;

    setInput('');
    setIsTyping(true);
    setActiveTools([]); // Reset tools when message is sent

    // Parse files NOW before sending
    let allFileContent = '';
    let hasImage = false;
    let imageUrl = '';
    const fileNames = attachedFiles.map(f => f.name).join(', ');

    if (attachedFiles.length > 0) {
      setIsParsing(true);
      // Suppress PDF.js font warnings (harmless TrueType instruction warnings)
      const originalWarn = console.warn;
      for (const file of attachedFiles) {
        try {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const promise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
            });
            reader.readAsDataURL(file);
            imageUrl = await promise;
            hasImage = true;
          } else if (file.type === 'application/pdf') {
            // Temporarily suppress PDF.js font warnings
            console.warn = (...args: any[]) => {
              const msg = typeof args[0] === 'string' ? args[0] : '';
              if (!msg.includes('TT:') && !msg.includes('undefined function')) {
                originalWarn.apply(console, args);
              }
            };
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              allFileContent += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            console.warn = originalWarn;
          } else if (file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            allFileContent += result.value + '\n';
          } else {
            const text = await file.text();
            allFileContent += text + '\n';
          }
        } catch (err) {
          console.warn = originalWarn; // Restore on error
          console.error("Failed to parse", file.name, err);
          toast.error(`Failed to read file: ${file.name}`);
        }
      }
      setIsParsing(false);
    }

    // Clear attachments
    handleFileRemove();

    let researchContext = '';
    if (activeTools.includes('fast_research') && userId) {
      try {
        const { data: notes } = await turso
          .from('notes')
          .select('title, content')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (notes && notes.length > 0) {
          researchContext += "\n\n[SYSTEM INSTRUCTION: FAST RESEARCH MODE ACTIVE]\n" +
            "The user has activated Fast Research. Below is context from their personal local notes. " +
            "Instead of just giving a standard answer, you MUST deeply analyze the provided notes and synthesize them to give a highly detailed, comprehensive, and insightful response specifically tailored to their materials. Do NOT just summarize the notes; connect the dots and provide expert-level insights.\n\n" +
            "[Recent Notes Context]:\n" + 
            notes.map((n: any) => `Title: ${n.title}\nContent: ${n.content?.substring(0, 500)}...`).join('\n\n');
        }
      } catch (e) {
        console.error("Fast research error", e);
      }
    }

    if (activeTools.includes('web_search')) {
      // ─── Multi-Step Smart Web Search Pipeline ───────────────────────
      // Step 1: Generate smart search queries using AI (considers PDF content)
      let searchQueries: string[] = [messageText];
      
      if (allFileContent || messageText) {
        setResearchStatus('🔍 Analyzing your question...');
        console.log('[Smart Search] Generating targeted queries from content + user intent...');
        searchQueries = await generateSmartSearchQueries(messageText, allFileContent);
      }

      // Step 2: Execute all search queries in parallel
      setResearchStatus(`🌐 Searching the web (${searchQueries.length} queries)...`);
      console.log(`[Web Search] Executing ${searchQueries.length} parallel searches:`, searchQueries);
      
      const webResults = await executeParallelWebSearches(searchQueries);
      
      if (webResults.length > 0) {
        console.log(`[Web Search] Success! Aggregated ${webResults.length} unique snippets from ${searchQueries.length} queries.`);
        researchContext += "\n\n[SYSTEM INSTRUCTION: WEB SEARCH MODE ACTIVE]\n" +
          "The user has activated Web Search. Below are live search results from multiple targeted queries. " +
          "Incorporate these facts into your answer seamlessly and accurately. Prioritize the most relevant results.\n\n" +
          "[Live Web Search Results]:\n" + 
          webResults.map((r: string, i: number) => `Result ${i + 1}: ${r}`).join('\n\n');
      } else {
        console.log(`[Web Search] Finished, but no snippets were found across all queries.`);
      }
      setResearchStatus('');
    }

    if (activeTools.includes('expanded_thinking')) {
      researchContext += "\n\n[SYSTEM INSTRUCTION: EXPANDED THINKING MODE ACTIVE]\n" +
        "You MUST think step-by-step. Break down the user's request into analytical components, deeply evaluate edge cases, and present a structured, multi-faceted conclusion.";
    }

    const displayMessage = fileNames 
      ? `*(Attached: ${fileNames})*\n\n${messageText}` 
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
    let isFirstMessage = false;
    
    if (!currentConvId && userId) {
      currentConvId = await initConversation(userId);
      isFirstMessage = true;
    }

    if (currentConvId) {
      await turso.from('ai_messages').insert([{
        conversation_id: currentConvId,
        role: 'user',
        content: displayMessage
      }]);

      // Update conversation title if it's the first message
      if (isFirstMessage || messages.filter(m => !m.id.toString().startsWith('welcome')).length === 0) { 
        const title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
        await turso.from('ai_conversations').update({ title }).eq('id', currentConvId);
        setConversations(prev => prev.map(c => c.id === currentConvId ? { ...c, title } : c));
      }
    }

    try {
      let finalContent = '';

      if (AGENT_ROUTER_API_KEY || GROQ_API_KEY) {
        const history = messages.filter(m => (m.role === 'user' || m.role === 'assistant') && !m.id.toString().startsWith('welcome'));
        
        let formattedUserMessage: any = backendMessageText;
        if (hasImage && imageUrl) {
          formattedUserMessage = [
            { type: "text", text: backendMessageText || "Please describe this image." },
            { type: "image_url", image_url: { url: imageUrl } }
          ];
        } else if (allFileContent) {
          formattedUserMessage = `[Attached Context]\n${allFileContent}\n\nUser Message: ${backendMessageText}`;
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
            agentRouterModel: hasImage ? 'gpt-4o' : undefined,
            groqModel: hasImage ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile',
            max_tokens: 8192,
            provider: 'agent-router'
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

        // Update conversation's updated_at so sidebar ordering stays correct
        await turso.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', currentConvId);
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
  }, [isSidebarOpen, messages, userId, setLeftContent]); 

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-1 w-full relative overflow-hidden">
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
            onAction={handlePromptClick}
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
            researchStatus={researchStatus}
            attachedFiles={attachedFiles}
            onFileAttach={handleFileAttach}
            onFileRemove={handleFileRemove}
            activeTools={activeTools}
            setActiveTools={setActiveTools}
          />
      </div>
    </div>
  );
};
