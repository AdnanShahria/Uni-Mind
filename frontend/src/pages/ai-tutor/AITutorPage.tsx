import { useState, useRef, useEffect, useCallback } from 'react';
import { turso } from '../../utils/tursoClient';
import { AITutorHeader } from './AITutorHeader';
import { ChatMessages } from './ChatMessages';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessageInput } from './MessageInput';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
// Using mammoth from window or basic import. Mammoth doesn't have types and can be tricky in Vite if not configured.
// @ts-ignore
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ─── Groq API ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are UniMind AI Tutor — a super advanced academic assistant for university students. 
You are an expert in explaining complex topics clearly, step-by-step problem solving, and generating quizzes or summaries.
Format your responses beautifully using Markdown. 
Use LaTeX for math equations (e.g. $E=mc^2$ or $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$). 
Use formatted code blocks for code snippets.
Be concise, accurate, and highly educational.`;

async function callGroqStream(
  history: { role: string; content: string }[],
  userMessage: string,
  attachedFileType: 'text' | 'image' | null,
  attachedFileContent: string | null,
  onChunk: (chunk: string) => void
): Promise<string> {
  const model = attachedFileType === 'image' ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';
  
  let formattedUserMessage: any = userMessage;

  if (attachedFileType === 'text' && attachedFileContent) {
    formattedUserMessage = `[Attached Context]\n${attachedFileContent}\n\nUser Message: ${userMessage}`;
  } else if (attachedFileType === 'image' && attachedFileContent) {
    formattedUserMessage = [
      { type: "text", text: userMessage || "Please describe this image." },
      { type: "image_url", image_url: { url: attachedFileContent } }
    ];
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-15).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: formattedUserMessage }
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} - ${err}`);
  }
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line === 'data: [DONE]') return fullContent;
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data.choices[0]?.delta?.content || '';
          fullContent += text;
          onChunk(text);
        } catch (e) {
          // ignore parse errors for partial chunks
        }
      }
    }
  }

  return fullContent;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  const [isFastResearch, setIsFastResearch] = useState(false);
  
  // File Context
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileContent, setAttachedFileContent] = useState<string | null>(null);
  const [attachedFileType, setAttachedFileType] = useState<'text' | 'image' | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const GREETING = "Hello! I'm your **Super Advanced AI Tutor** 🎓\n\nI can help you with:\n- **Understanding** complex topics\n- **Solving** math and coding problems\n- **Analyzing** documents and images you attach (.txt, .pdf, .docx, .jpg, .png)\n\nWhat would you like to learn today?";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initConversation = useCallback(async (uid: string) => {
    const { data: newConv } = await turso
      .from('ai_conversations')
      .insert([{ user_id: uid }])
      .select()
      .single();
    if (newConv) {
      setActiveConvId(newConv.id);
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
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        let convId: string | null = null;
        if (convs && convs.length > 0) {
          convId = convs[0].id;
          setActiveConvId(convId);
        } else {
          convId = await initConversation(user.id);
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
    if (userId) {
      const newId = await initConversation(userId);
      setActiveConvId(newId);
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

    const tempUserMsg = { id: Date.now(), role: 'user', content: displayMessage, timestamp: 'Just now' };
    setMessages(prev => [...prev, tempUserMsg]);

    if (activeConvId) {
      await turso.from('ai_messages').insert([{
        conversation_id: activeConvId,
        role: 'user',
        content: displayMessage
      }]);
    }

    // Prepare a placeholder for the AI message that will stream
    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: 'Just now' }]);

    try {
      let finalContent = '';

      if (GROQ_API_KEY) {
        const history = messages.filter(m => m.role === 'user' || m.role === 'assistant');
        finalContent = await callGroqStream(
          history, 
          backendMessageText, 
          currentFileType, 
          currentFileContent, 
          (chunk) => {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
            ));
          }
        );
      } else {
        finalContent = await simulateStream(backendMessageText, (chunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
          ));
        });
      }

      if (activeConvId) {
        await turso.from('ai_messages').insert([{
          conversation_id: activeConvId,
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

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <AITutorHeader onNewChat={handleNewChat} />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ChatMessages
            messages={messages}
            isTyping={isTyping && messages.length > 0 && messages[messages.length - 1].role !== 'assistant'} 
            userName={userName}
            messagesEndRef={messagesEndRef}
            onAction={handleSend}
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
        handleSend={() => handleSend()}
        isTyping={isTyping || isParsing}
        attachedFileName={attachedFileName}
        onFileAttach={handleFileAttach}
        onFileRemove={handleFileRemove}
        isFastResearch={isFastResearch}
        setIsFastResearch={setIsFastResearch}
      />
    </div>
  );
};
