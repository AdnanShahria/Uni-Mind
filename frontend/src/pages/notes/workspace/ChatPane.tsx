import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles, Headphones, Zap, Video, GraduationCap, BrainCircuit, BarChart, ChevronRight } from 'lucide-react';
import { generateStudyGuide, generateMindMap, generateSlideDeck, generateReport, generateAudioScript } from './studioUtils';
import { NoteType } from '../types';
import { toast } from 'react-hot-toast';

import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../../utils/aiClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPaneProps {
  note: NoteType;
  noteTitle: string;
  noteContent: string;
  hasFlashcards: boolean;
  setIsStudyModalOpen: (v: boolean) => void;
  handleGenerateFlashcards: () => void;
  isGeneratingFlashcards: boolean;
  handleGenerateSummary: () => void;
  isGenerating: boolean;
  updateStudioData: (key: string, value: string) => Promise<void>;
  setActiveTab: (tab: any) => void;
  isGeneratingStudyGuide: boolean;
  setIsGeneratingStudyGuide: (v: boolean) => void;
  isGeneratingMindMap: boolean;
  setIsGeneratingMindMap: (v: boolean) => void;
  isGeneratingSlides: boolean;
  setIsGeneratingSlides: (v: boolean) => void;
  isGeneratingReport: boolean;
  setIsGeneratingReport: (v: boolean) => void;
  isGeneratingAudio: boolean;
  setIsGeneratingAudio: (v: boolean) => void;
}

interface ToolChipProps {
  icon: React.ReactNode;
  label: string;
  isLoading: boolean;
  onClick: () => void;
  accentBg: string;
}

const ToolChip = ({ icon, label, isLoading, onClick, accentBg }: ToolChipProps) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-200 group
      bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] hover:border-white/[0.1] w-full`}
  >
    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${accentBg}`}>
      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
    </div>
    <span className="text-[10px] font-medium text-slate-400 group-hover:text-white flex-1 truncate">
      {isLoading ? 'Generating...' : label}
    </span>
    {!isLoading && (
      <ChevronRight className="w-2.5 h-2.5 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
    )}
  </button>
);

export const ChatPane = ({
  note,
  noteTitle,
  noteContent,
  hasFlashcards,
  setIsStudyModalOpen,
  handleGenerateFlashcards,
  isGeneratingFlashcards,
  handleGenerateSummary,
  isGenerating,
  updateStudioData,
  setActiveTab,
  isGeneratingStudyGuide,
  setIsGeneratingStudyGuide,
  isGeneratingMindMap,
  setIsGeneratingMindMap,
  isGeneratingSlides,
  setIsGeneratingSlides,
  isGeneratingReport,
  setIsGeneratingReport,
  isGeneratingAudio,
  setIsGeneratingAudio,
}: ChatPaneProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showTools, setShowTools] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async (
    key: string,
    tab: string,
    generatorFn: (t: string, c: string) => Promise<string>,
    setLoading: (v: boolean) => void
  ) => {
    if (!note) {
      toast.error('Note data is missing!');
      return;
    }
    setLoading(true);
    try {
      toast.loading(`Generating ${key}...`, { id: 'gen' });
      const res = await generatorFn(note.title, noteContent);
      await updateStudioData(key, res);
      setActiveTab(tab);
      toast.success(`${key} generated successfully!`, { id: 'gen' });
    } catch (e: any) {
      toast.error(e.message || `Failed to generate ${key}`, { id: 'gen' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoadingChat) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoadingChat(true);
    // Auto-collapse tools when chat starts
    if (showTools) setShowTools(false);

    try {
      const systemPrompt = `You are a helpful AI study assistant. The user is studying a note titled "${noteTitle}". 
Here is the note content for context:
---
${noteContent || 'No content available yet.'}
---
Answer the user's questions based on this note content. Be concise, helpful, and use markdown formatting when appropriate. If the question is outside the scope of the notes, say so but still try to help.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      if (AGENT_ROUTER_API_KEY || GROQ_API_KEY) {
        try {
          const assistantContent = await callAI(apiMessages, {
            groqModel: 'llama-3.1-8b-instant',
            temperature: 0.6,
            max_tokens: 1024
          });
          setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
        } catch (error) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get a response. Please try again.' }]);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'd love to help with "${trimmed}", but the API keys are not configured. Add \`VITE_AGENT_ROUTER_API_KEY\` to your \`.env\` file to enable AI chat.`
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setIsLoadingChat(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[280px] xl:w-[320px] bg-[#0d1017] border-l border-white/[0.06] flex flex-col shrink-0 hidden lg:flex">

      {/* Studio Tools — collapsible section */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => setShowTools(!showTools)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Studio</span>
          </div>
          <ChevronRight className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${showTools ? 'rotate-90' : ''}`} />
        </button>

        {showTools && (
          <div className="px-2.5 pb-2.5 space-y-1">
            <ToolChip
              icon={<Sparkles className="w-3 h-3 text-indigo-400" />}
              label="Generate Summary"
              isLoading={isGenerating}
              onClick={handleGenerateSummary}
              accentBg="bg-indigo-500/15"
            />
            <ToolChip
              icon={<Headphones className="w-3 h-3 text-blue-400" />}
              label="Audio Overview"
              isLoading={isGeneratingAudio}
              onClick={() => handleGenerate('audio', 'audio', generateAudioScript, setIsGeneratingAudio)}
              accentBg="bg-blue-500/15"
            />
            <ToolChip
              icon={<Zap className="w-3 h-3 text-emerald-400" />}
              label={hasFlashcards ? 'Study Flashcards' : 'Create Flashcards'}
              isLoading={isGeneratingFlashcards}
              onClick={() => hasFlashcards ? setIsStudyModalOpen(true) : handleGenerateFlashcards()}
              accentBg="bg-emerald-500/15"
            />
            <div className="flex gap-1">
              <ToolChip
                icon={<Video className="w-3 h-3 text-orange-400" />}
                label="Slides"
                isLoading={isGeneratingSlides}
                onClick={() => handleGenerate('slides', 'slides', generateSlideDeck, setIsGeneratingSlides)}
                accentBg="bg-orange-500/15"
              />
              <ToolChip
                icon={<GraduationCap className="w-3 h-3 text-purple-400" />}
                label="Study Guide"
                isLoading={isGeneratingStudyGuide}
                onClick={() => handleGenerate('study_guide', 'study_guide', generateStudyGuide, setIsGeneratingStudyGuide)}
                accentBg="bg-purple-500/15"
              />
            </div>
            <div className="flex gap-1">
              <ToolChip
                icon={<BrainCircuit className="w-3 h-3 text-pink-400" />}
                label="Mind Map"
                isLoading={isGeneratingMindMap}
                onClick={() => handleGenerate('mind_map', 'mind_map', generateMindMap, setIsGeneratingMindMap)}
                accentBg="bg-pink-500/15"
              />
              <ToolChip
                icon={<BarChart className="w-3 h-3 text-cyan-400" />}
                label="Reports"
                isLoading={isGeneratingReport}
                onClick={() => handleGenerate('report', 'report', generateReport, setIsGeneratingReport)}
                accentBg="bg-cyan-500/15"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Section Header */}
      <div className="px-3.5 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center">
          <MessageSquare className="w-2.5 h-2.5 text-blue-400" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ask AI</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-xs font-semibold text-slate-300 mb-1">Ask about this note</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed mb-4">
              Ask questions, get explanations, or explore topics from your notes.
            </p>
            <div className="space-y-1.5 w-full">
              {[
                'Summarize the key points',
                'Explain the main concepts',
                'Quiz me on this topic',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/15 rounded-br-sm'
                  : 'bg-white/[0.04] text-slate-300 border border-white/[0.06] rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-5 h-5 rounded-md bg-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {isLoadingChat && (
          <div className="flex gap-2 justify-start">
            <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-blue-400" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-[10px] text-slate-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 focus-within:border-blue-500/30 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent text-[11px] text-white placeholder-slate-600 outline-none"
            disabled={isLoadingChat}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoadingChat}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
