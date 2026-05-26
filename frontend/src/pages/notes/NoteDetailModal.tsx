import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trash2, Edit3, Save, Sparkles, Loader2, Clock, FolderOpen, Copy, Check, Globe, Lock, Users, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { NoteType } from './types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function generateSummary(title: string, content: string): Promise<string> {
  const prompt = `You are an academic note summarizer. Summarize the following note concisely for a university student. Use bullet points for key facts, bold important terms, and keep it under 150 words.\n\nTitle: ${title}\nContent: ${content || 'No content provided — base summary on the title.'}`;

  if (GROQ_API_KEY) {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  // Smart fallback
  const words = content.split(' ').slice(0, 40).join(' ');
  return `**Key Points from "${title}":**\n\n- ${title} covers foundational concepts relevant to your course\n- ${words ? `Content begins: "${words}..."` : 'Add content to get a detailed AI summary'}\n- Review the main definitions, formulas, and applications\n- Connect this topic to adjacent subjects for deeper understanding\n\n💡 *Add a Groq API key to get full AI-powered summaries.*`;
}

interface NoteDetailModalProps {
  note: NoteType | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string | number) => void;
  onStarToggled: (id: string | number) => void;
  onUpdated: () => void;
}

export const NoteDetailModal = ({
  note,
  isOpen,
  onClose,
  onDeleted,
  onStarToggled,
  onUpdated,
}: NoteDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dbContent, setDbContent] = useState('');
  
  const [visibility, setVisibility] = useState<'private' | 'class' | 'public'>('private');
  const [shareLinkToken, setShareLinkToken] = useState<string | undefined>();

  useEffect(() => {
    if (note && isOpen) {
      setEditTitle(note.title);
      setAiSummary('');
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setVisibility(note.visibility || 'private');
      setShareLinkToken(note.sharedLinkToken);
      fetchContent(note.id);
    }
  }, [note, isOpen]);

  const fetchContent = async (noteId: string | number) => {
    const { data } = await supabase
      .from('notes')
      .select('content, ai_summary')
      .eq('id', noteId)
      .single();
    if (data) {
      setDbContent(data.content || '');
      setEditContent(data.content || '');
      if (data.ai_summary) setAiSummary(data.ai_summary);
    }
  };

  const handleSave = async () => {
    if (!note) return;
    setIsSaving(true);
    const { error } = await supabase.from('notes').update({
      title: editTitle,
      content: editContent,
    }).eq('id', note.id);

    if (error) {
      toast.error('Failed to save note');
    } else {
      toast.success('Note saved!');
      setIsEditing(false);
      onUpdated();
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!note) return;
    setIsDeleting(true);
    const { error } = await supabase.from('notes').delete().eq('id', note.id);
    if (error) {
      toast.error('Failed to delete note');
    } else {
      toast.success('Note deleted');
      onDeleted(note.id);
      onClose();
    }
    setIsDeleting(false);
  };

  const handleGenerateSummary = async () => {
    if (!note) return;
    setIsGenerating(true);
    try {
      const summary = await generateSummary(note.title, dbContent);
      setAiSummary(summary);
      // Save summary to DB
      await supabase.from('notes').update({ ai_summary: summary, is_ai_summarized: true }).eq('id', note.id);
      toast.success('AI Summary generated!');
      onUpdated();
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
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
    
    const { error } = await supabase.from('notes').update({
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0d1526] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-primary/30 rounded-lg px-3 py-1.5 text-base font-semibold text-white font-outfit outline-none"
                  autoFocus
                />
              ) : (
                <h2 className="text-base font-semibold text-white font-outfit truncate">{note.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${copied ? 'text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}
                title="Copy content"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onStarToggled(note.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${note.starred ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-amber-400 hover:bg-white/[0.06]'}`}
                title={note.starred ? 'Unstar' : 'Star'}
              >
                <Star className="w-4 h-4" fill={note.starred ? 'currentColor' : 'none'} />
              </button>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Edit note"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Save"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="px-6 py-2.5 border-b border-white/[0.04] flex items-center gap-4 text-[11px] text-slate-500 font-poppins relative z-10">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {note.lastEdited}</span>
            <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {note.course}</span>
            
            {/* Visibility Toggle Dropdown */}
            <div className="relative group">
               <button className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/[0.06] transition-colors text-slate-400">
                  {visibility === 'private' && <><Lock className="w-3 h-3"/> Private</>}
                  {visibility === 'class' && <><Users className="w-3 h-3 text-blue-400"/> Class Shared</>}
                  {visibility === 'public' && <><Globe className="w-3 h-3 text-emerald-400"/> Public</>}
               </button>
               {/* Dropdown menu */}
               <div className="absolute top-full left-0 mt-1 w-32 bg-[#090d16] border border-white/10 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all flex flex-col p-1 z-50">
                  <button onClick={() => handleVisibilityChange('private')} className="text-left px-3 py-2 text-[10px] text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg flex items-center gap-2"><Lock className="w-3 h-3"/> Private</button>
                  <button onClick={() => handleVisibilityChange('class')} className="text-left px-3 py-2 text-[10px] text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg flex items-center gap-2"><Users className="w-3 h-3"/> Class</button>
                  <button onClick={() => handleVisibilityChange('public')} className="text-left px-3 py-2 text-[10px] text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2"><Globe className="w-3 h-3"/> Public</button>
               </div>
            </div>

            {shareLinkToken && visibility !== 'private' && (
              <button 
                 onClick={() => {
                   navigator.clipboard.writeText(`${window.location.origin}/notes/share/${shareLinkToken}`);
                   toast.success('Share link copied!');
                 }}
                 className="flex items-center gap-1 text-primary-glow bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3" /> Get Share Link
              </button>
            )}

            {note.aiSummary && (
              <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md font-semibold ml-auto">
                <Sparkles className="w-2.5 h-2.5" /> AI Summarized
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Main content */}
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-poppins mb-2 block">Content</label>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 font-poppins resize-none outline-none focus:border-primary/40 transition-colors"
                  placeholder="Write your note content here..."
                />
              ) : (
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-4 min-h-[200px]">
                  {dbContent ? (
                    <p className="text-sm text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{dbContent}</p>
                  ) : (
                    <p className="text-sm text-slate-600 font-poppins italic">No content yet. Click edit to add content.</p>
                  )}
                </div>
              )}
            </div>

            {/* AI Summary */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/[0.06] border border-purple-500/20 rounded-xl px-4 py-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold font-poppins">AI Summary</span>
                </div>
                <p className="text-sm text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
              </motion.div>
            )}

            {/* Delete confirm */}
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <p className="text-sm text-rose-300 font-poppins">Delete this note permanently?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 transition-colors flex items-center gap-1.5"
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-poppins">
              {dbContent.length} characters · {note.pages} page{note.pages !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 text-purple-300 text-xs font-semibold font-poppins transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isGenerating ? 'Generating...' : 'Generate AI Summary'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
