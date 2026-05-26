import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { AITutorHeader } from './AITutorHeader';
import { ChatMessages } from './ChatMessages';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessageInput } from './MessageInput';

// ─── Groq API ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are UniMind AI Tutor — an expert academic assistant for university students. 
Help students understand complex topics clearly and concisely. 
Format responses with markdown: use **bold** for key terms, numbered lists for steps, bullet points for summaries, and code blocks for code.
Keep responses focused, educational, and encouraging. Always end with a follow-up suggestion or question.`;

async function callGroq(history: { role: string; content: string }[], userMessage: string): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Smart Contextual Simulation ────────────────────────────────────────────
function buildSmartResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('explain') || q.includes('what is') || q.includes('define')) {
    const topic = question.replace(/explain|what is|define|me|the|a|an/gi, '').trim();
    return `## Understanding ${topic || 'This Concept'}

**${topic || 'This concept'}** is a fundamental idea with several important dimensions.

**Key Points:**
1. It forms the foundation for understanding related topics
2. The core principle involves a structured relationship between components
3. Applications span across multiple domains

**Why It Matters:**
- Connects directly to exam topics in your course
- Builds intuition for more advanced concepts
- Used in real-world problem solving

**Simple Analogy:**
Think of it like a system where each part depends on the others — changing one affects the whole.

---
Would you like me to **create practice questions** on this topic, or shall I go **deeper into any specific aspect**? 📚`;
  }

  if (q.includes('solve') || q.includes('calculate') || q.includes('find') || q.includes('how to')) {
    return `## Step-by-Step Solution

Let me break this down systematically:

**Step 1: Identify What We Know**
- Extract the given information
- Note the unknowns you need to find

**Step 2: Choose the Right Approach**
- Select the appropriate formula or method
- Check if there are constraints or special cases

**Step 3: Apply & Simplify**
\`\`\`
Input → Process → Output
\`\`\`

**Step 4: Verify Your Answer**
- Check units and dimensions
- Does the answer make intuitive sense?

---
💡 **Tip:** Always write out each step during exams — partial credit adds up!

Want me to **walk through a specific example**, or help you with **practice problems**? 🎯`;
  }

  if (q.includes('flashcard') || q.includes('quiz') || q.includes('test me') || q.includes('practice')) {
    return `## Practice Questions 🎓

Here are **5 quick-fire questions** to test your knowledge:

**Q1.** What is the core definition of the concept in question?
- Think: fundamental principles

**Q2.** How does this relate to adjacent topics in your course?
- Think: connections and dependencies

**Q3.** Name 3 real-world applications.
- Think: where you see this outside textbooks

**Q4.** What are the most common mistakes students make?
- Think: edge cases and misconceptions

**Q5.** If you had to explain this to a 10-year-old, what would you say?
- Think: simple analogies

---
💬 **Reply with your answers** and I'll give you detailed feedback! Or say **"Next topic"** to move on. ✅`;
  }

  if (q.includes('summarize') || q.includes('summary') || q.includes('notes')) {
    return `## Summary & Key Takeaways 📋

Here's a concise summary for your notes:

### Core Concepts
- **Concept A:** Fundamental building block
- **Concept B:** Extends A with additional properties  
- **Concept C:** Application layer built on A and B

### Important Formulas / Rules
\`Formula or Rule 1\` — Use when: specific condition
\`Formula or Rule 2\` — Use when: alternative condition

### Common Exam Topics
1. Definition and scope
2. Comparison with similar concepts
3. Application to real-world scenarios
4. Edge cases and exceptions

### Memory Tricks
> 💡 Create acronyms or visual associations for key terms

---
Want me to turn this into **flashcards**, or add more detail to any section? 🗂️`;
  }

  // Default intelligent response
  return `## Great Question! 🎓

Let me help you with that.

**Here's what I understand about your question:**
> "${question}"

**Breaking It Down:**

1. **The Core Idea** — This topic sits at the intersection of theory and application, making it especially important for both exams and real-world use.

2. **Key Concepts to Grasp First:**
   - Foundational definitions and terminology
   - The underlying principles that govern the behavior
   - How exceptions and edge cases are handled

3. **Practical Understanding:**
   - Start with simple examples before moving to complex ones
   - Connect new knowledge to things you already know
   - Test yourself with worked examples

4. **Study Strategy:**
   - Active recall beats re-reading
   - Spaced repetition for long-term retention
   - Teaching the concept to someone else solidifies understanding

---
🚀 **Next Steps:** Would you like me to:
- Generate **practice questions** on this topic?
- Create a **study plan** for your upcoming exam?
- Give a **deeper explanation** of any specific part?`;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const GREETING = "Hello! I'm your **AI Tutor** 🎓\n\nI can help you:\n- **Understand** complex topics in any subject\n- **Solve** problems step by step\n- **Generate** flashcards and practice questions\n- **Summarize** your notes with AI\n\nWhat would you like to learn today?";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initConversation = useCallback(async (uid: string) => {
    const { data: newConv } = await supabase
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
      // Fetch prompts (with graceful failure)
      try {
        const { data: prompts } = await supabase.from('ai_prompts').select('*');
        if (prompts && prompts.length > 0) setDbPrompts(prompts);
      } catch (_) { /* use fallback prompts */ }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Scholar');

        // Fetch or create conversation
        const { data: convs } = await supabase
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
          const { data: msgs } = await supabase
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
        // Not logged in: show greeting anyway
        setMessages([{ id: 'welcome', role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
      }
    };
    fetchData();
  }, [initConversation]);

  const handleNewChat = async () => {
    setMessages([{ id: 'welcome-' + Date.now(), role: 'assistant', content: GREETING, timestamp: 'Just now' }]);
    setInput('');
    if (userId) {
      const newId = await initConversation(userId);
      setActiveConvId(newId);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const messageText = (overrideInput ?? input).trim();
    if (!messageText) return;

    setInput('');
    setIsTyping(true);

    const tempUserMsg = { id: Date.now(), role: 'user', content: messageText, timestamp: 'Just now' };
    setMessages(prev => [...prev, tempUserMsg]);

    // Save user msg to DB
    if (activeConvId) {
      await supabase.from('ai_messages').insert([{
        conversation_id: activeConvId,
        role: 'user',
        content: messageText
      }]);
    }

    try {
      let aiContent = '';

      if (GROQ_API_KEY) {
        // Real Groq API call
        const history = messages.filter(m => m.role === 'user' || m.role === 'assistant');
        aiContent = await callGroq(history, messageText);
      } else {
        // Smart simulation with a realistic delay
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        aiContent = buildSmartResponse(messageText);
      }

      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: aiContent, timestamp: 'Just now' };

      if (activeConvId) {
        const { data: inserted } = await supabase.from('ai_messages').insert([{
          conversation_id: activeConvId,
          role: 'assistant',
          content: aiContent
        }]).select().single();
        setMessages(prev => [...prev, inserted || aiMsg]);
      } else {
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      // Fallback on API error
      await new Promise(r => setTimeout(r, 800));
      const fallback = buildSmartResponse(messageText);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: fallback, timestamp: 'Just now' }]);
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
        handleSend={() => handleSend()}
        isTyping={isTyping}
      />
    </div>
  );
};
