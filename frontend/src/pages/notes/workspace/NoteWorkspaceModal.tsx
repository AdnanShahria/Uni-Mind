import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trash2, Loader2, BrainCircuit, Globe, Lock, Users, Share2, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { turso } from '../../../utils/tursoClient';
import { toast } from 'react-hot-toast';
import { NoteType } from '../types';
import { FlashcardsStudyModal } from '../FlashcardsStudyModal';
import { useTopBarContext } from '../../../contexts/TopBarContext';

import { SourcesPane } from './SourcesPane';
import { EditorPane } from './EditorPane';
import { ChatPane } from './ChatPane';

import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../../utils/aiClient';

async function generateSummary(title: string, content: string): Promise<string> {
  const prompt = `You are an academic note summarizer. Summarize the following note concisely for a university student. Use bullet points for key facts, bold important terms, and keep it under 150 words.\n\nTitle: ${title}\nContent: ${content || 'No content provided — base summary on the title.'}`;

  if (!AGENT_ROUTER_API_KEY && !GROQ_API_KEY) {
    console.warn("API Keys are missing. Returning a mock summary.");
    return `**Key Points from "${title}" (Mock Summary):**\n\n- ${title} covers foundational concepts.\n- This is a mock AI summary because the API keys are missing.\n- Add \`VITE_AGENT_ROUTER_API_KEY\` to your \`.env\` file to enable real AI summarization.\n- Connect this topic to adjacent subjects for deeper understanding.`;
  }

  try {
    const summaryContent = await callAI(
      [{ role: 'user', content: prompt }],
      {
        groqModel: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 300,
        provider: 'agent-router'
      }
    );
    return summaryContent;
  } catch (error) {
    console.error("AI Summary generation failed", error);
    const words = content.split(' ').slice(0, 40).join(' ');
    return `**Key Points from "${title}":**\n\n- ${title} covers foundational concepts relevant to your course\n- ${words ? `Content begins: "${words}..."` : 'Add content to get a detailed AI summary'}\n- Review the main definitions, formulas, and applications\n- Connect this topic to adjacent subjects for deeper understanding\n\n💡 *AI generation failed. Please try again.*`;
  }
}

async function generateFlashcardsWithGroq(title: string, content: string): Promise<{question: string, answer: string}[]> {
  const prompt = `Based on the following note, generate up to 10 key flashcards. 
Return EXACTLY a JSON object with a single key "flashcards" which is an array of objects, each containing "question" and "answer" strings. 
Do not include any other text.

Title: ${title}
Content: ${content || 'Basic general knowledge about ' + title}`;

  if (!AGENT_ROUTER_API_KEY && !GROQ_API_KEY) {
    console.warn("API Keys are missing. Returning mock flashcards.");
    return [
      { question: `What is the main topic of "${title}"?`, answer: "This is a mock flashcard because the API key is missing." },
      { question: "How do you enable real AI flashcards?", answer: "Add VITE_AGENT_ROUTER_API_KEY to the .env file." },
      { question: "Can you list 3 key points?", answer: "Review the bullet points or main headings." }
    ];
  }

  try {
    const contentStr = await callAI(
      [{ role: 'user', content: prompt }],
      {
        groqModel: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        responseFormat: { type: "json_object" },
        provider: 'agent-router'
      }
    );
    
    const parsed = JSON.parse(contentStr);
    if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
      return parsed.flashcards;
    }
  } catch (e) {
    console.error(e);
  }

  return [
    { question: `What is the main topic of "${title}"?`, answer: "You should review the note content to answer this." },
    { question: "Can you list 3 key points?", answer: "Review the bullet points or main headings." }
  ];
}

interface NoteWorkspaceModalProps {
  note: NoteType | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string | number) => void;
  onStarToggled: (id: string | number) => void;
  onUpdated: () => void;
  initialEditMode?: boolean;
  initialDeleteConfirm?: boolean;
}

export const NoteWorkspaceModal = ({
  note,
  isOpen,
  onClose,
  onDeleted,
  onStarToggled,
  onUpdated,
  initialEditMode,
  initialDeleteConfirm,
}: NoteWorkspaceModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dbContent, setDbContent] = useState('');
  const [studioData, setStudioData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'notes'|'study_guide'|'mind_map'|'slides'|'report'|'audio'|'summary'>('notes');
  const [isGeneratingStudyGuide, setIsGeneratingStudyGuide] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [visibility, setVisibility] = useState<'private' | 'class' | 'public'>('private');
  const [shareLinkToken, setShareLinkToken] = useState<string | undefined>();
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
  const { isAppFullScreen, setIsAppFullScreen } = useTopBarContext();

  useEffect(() => {
    return () => setIsAppFullScreen(false);
  }, [setIsAppFullScreen]);

   
  useEffect(() => {
    if (note && isOpen) {
      setEditTitle(note.title);
      setAiSummary('');
      setIsEditing(initialEditMode || false);
      setShowDeleteConfirm(initialDeleteConfirm || false);
      setVisibility(note.visibility || 'private');
      setShareLinkToken(note.sharedLinkToken);
      fetchContent(note.id);
      checkFlashcards(note.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, isOpen]);

  const fetchContent = async (noteId: string | number) => {
    const { data } = await turso
      .from('notes')
      .select('content, ai_summary, studio_data')
      .eq('id', noteId)
      .single();
    if (data) {
      setDbContent(data.content || '');
      setEditContent(data.content || '');
      if (data.ai_summary) setAiSummary(data.ai_summary);
      if (data.studio_data) {
        try {
          setStudioData(typeof data.studio_data === 'string' ? JSON.parse(data.studio_data) : data.studio_data);
        } catch (e) {
          setStudioData({});
        }
      } else {
        setStudioData({});
      }
    }
  };

  const checkFlashcards = async (noteId: string | number) => {
    const { data, error } = await turso
      .from('flashcards')
      .select('id')
      .eq('note_id', noteId)
      .limit(1);
    
    if (!error && data && data.length > 0) {
      setHasFlashcards(true);
    } else {
      setHasFlashcards(false);
    }
  };

  const handleSave = async () => {
    if (!note) return;
    setIsSaving(true);
    const { error } = await turso.from('notes').update({
      title: editTitle,
      content: editContent,
    }).eq('id', note.id);

    if (error) {
      toast.error('Failed to save note');
    } else {
      toast.success('Note saved!');
      setDbContent(editContent);
      setIsEditing(false);
      onUpdated();
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!note) return;
    setIsDeleting(true);
    try {
      const { error } = await turso.from('notes').delete().eq('id', note.id);
      if (error) {
        toast.error(`Failed to delete note: ${error.message || 'Unknown error'}`);
      } else {
        toast.success('Note deleted');
        onDeleted(note.id);
        onClose();
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!note) return;
    setIsGenerating(true);
    try {
      const summary = await generateSummary(note.title, dbContent);
      setAiSummary(summary);
      await turso.from('notes').update({ ai_summary: summary, is_ai_summarized: true }).eq('id', note.id);
      setActiveTab('summary');
      toast.success('AI Summary generated!');
      onUpdated();
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!note) return;
    setIsGeneratingFlashcards(true);
    try {
      const { data: { user } } = await turso.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const flashcards = await generateFlashcardsWithGroq(note.title, dbContent);
      
      if (flashcards.length === 0) {
        toast.error('No flashcards could be generated.');
        setIsGeneratingFlashcards(false);
        return;
      }

      const inserts = flashcards.map(fc => ({
        note_id: note.id,
        user_id: user.id,
        question: fc.question,
        answer: fc.answer,
        status: 'new'
      }));

      const { error } = await turso.from('flashcards').insert(inserts);
      if (error) throw error;

      toast.success(`${flashcards.length} Flashcards generated!`);
      setHasFlashcards(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate flashcards');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const updateStudioData = async (key: string, value: string) => {
    if (!note) return;
    const newData = { ...studioData, [key]: value };
    setStudioData(newData);
    await turso.from('notes').update({ studio_data: JSON.stringify(newData) }).eq('id', note.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dbContent || note?.title || '').then(() => {
      setCopied(true);
      toast.success('Content copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleVisibilityChange = async (newVis: 'private' | 'class' | 'public') => {
    if (!note) return;
    
    let token = shareLinkToken;
    if (newVis !== 'private' && !token) {
      token = crypto.randomUUID();
      setShareLinkToken(token);
    }
    
    setVisibility(newVis);
    
    const { error } = await turso.from('notes').update({
      visibility: newVis,
      shared_link_token: token,
    }).eq('id', note.id);
    
    if (error) {
      toast.error('Failed to update visibility');
      setVisibility(note.visibility || 'private');
    } else {
      toast.success(`Visibility set to ${newVis}`);
      onUpdated();
    }
  };

  if (!isOpen || !note) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isStudyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ${isAppFullScreen ? 'p-0' : 'p-2 sm:p-4'}`}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              className={`w-full h-full bg-[#0a0c10] shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-300 ${isAppFullScreen ? 'max-w-none rounded-none border-0' : 'max-w-[1800px] border border-white/[0.06] rounded-2xl'}`}
            >
              {/* Top Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#111418] border-b border-white/[0.06]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="flex-1 max-w-md bg-white/[0.04] border border-primary/30 rounded-lg px-3 py-1 text-sm font-semibold text-white font-outfit outline-none"
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-sm font-semibold font-outfit truncate">{note.title}</h2>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <div className="relative group hidden sm:block z-[70]">
                     <button className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] transition-colors rounded-lg px-2.5 py-1.5 border border-white/[0.06] text-[11px] text-slate-400">
                        {visibility === 'private' && <><Lock className="w-3 h-3"/> Private</>}
                        {visibility === 'class' && <><Users className="w-3 h-3 text-blue-400"/> Class</>}
                        {visibility === 'public' && <><Globe className="w-3 h-3 text-emerald-400"/> Public</>}
                     </button>
                     <div className="absolute top-full left-0 mt-1 w-36 bg-[#1c1f26] border border-white/10 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all flex flex-col p-1">
                        <button onClick={() => handleVisibilityChange('private')} className="text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2"><Lock className="w-3.5 h-3.5"/> Private</button>
                        <button onClick={() => handleVisibilityChange('class')} className="text-left px-3 py-2 text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg flex items-center gap-2"><Users className="w-3.5 h-3.5"/> Class</button>
                        <button onClick={() => handleVisibilityChange('public')} className="text-left px-3 py-2 text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2"><Globe className="w-3.5 h-3.5"/> Public</button>
                     </div>
                  </div>

                  {shareLinkToken && visibility !== 'private' && (
                    <button 
                       onClick={() => {
                         navigator.clipboard.writeText(`${window.location.origin}/notes/share/${shareLinkToken}`);
                         toast.success('Share link copied!');
                       }}
                       className="hidden sm:flex items-center gap-1.5 text-primary-glow bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border border-primary/20"
                    >
                      <Share2 className="w-3 h-3" /> Get Link
                    </button>
                  )}
                  <button onClick={() => onStarToggled(note.id)} className={`p-1.5 rounded-lg transition-colors ${note.starred ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400 hover:bg-white/[0.06]'}`}>
                    <Star className="w-3.5 h-3.5" fill={note.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/[0.06] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsAppFullScreen(!isAppFullScreen)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors bg-white/[0.03]">
                    {isAppFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors bg-white/[0.03]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete Confirm Bar */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-rose-500/20 border-b border-rose-500/20 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm text-rose-200">Are you sure you want to delete this note permanently?</span>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-4 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                      <button onClick={handleDelete} disabled={isDeleting} className="text-xs px-4 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-2">
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4-Panel Workspace Layout */}
              <div className="flex flex-1 overflow-hidden">
                {/* Panel 1: Sources (Collapsible) */}
                <SourcesPane 
                  note={note} 
                  isCollapsed={isSourcesCollapsed} 
                  onToggleCollapse={() => setIsSourcesCollapsed(!isSourcesCollapsed)} 
                />
                
                {/* Panel 2: Main Editor / Document area */}
                <EditorPane 
                  note={note}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  dbContent={dbContent}
                  aiSummary={aiSummary}
                  isSaving={isSaving}
                  handleSave={handleSave}
                  copied={copied}
                  handleCopy={handleCopy}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  studioData={studioData}
                  hasFlashcards={hasFlashcards}
                />
                
                {/* Right Panel: Studio Tools + AI Chat */}
                <ChatPane 
                  note={note}
                  noteTitle={note.title}
                  noteContent={dbContent}
                  hasFlashcards={hasFlashcards}
                  setIsStudyModalOpen={setIsStudyModalOpen}
                  handleGenerateFlashcards={handleGenerateFlashcards}
                  isGeneratingFlashcards={isGeneratingFlashcards}
                  handleGenerateSummary={handleGenerateSummary}
                  isGenerating={isGenerating}
                  updateStudioData={updateStudioData}
                  setActiveTab={setActiveTab}
                  isGeneratingStudyGuide={isGeneratingStudyGuide}
                  setIsGeneratingStudyGuide={setIsGeneratingStudyGuide}
                  isGeneratingMindMap={isGeneratingMindMap}
                  setIsGeneratingMindMap={setIsGeneratingMindMap}
                  isGeneratingSlides={isGeneratingSlides}
                  setIsGeneratingSlides={setIsGeneratingSlides}
                  isGeneratingReport={isGeneratingReport}
                  setIsGeneratingReport={setIsGeneratingReport}
                  isGeneratingAudio={isGeneratingAudio}
                  setIsGeneratingAudio={setIsGeneratingAudio}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FlashcardsStudyModal 
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        noteId={note.id}
      />
    </>
  );
};
