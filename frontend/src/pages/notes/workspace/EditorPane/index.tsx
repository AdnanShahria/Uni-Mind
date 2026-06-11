import { motion } from 'framer-motion';
import { Edit3, Loader2, Save, Check, Copy, FileText, Sparkles, Play, Square } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { NoteType } from '../../types';
import { MermaidViewer } from './MermaidViewer';
import { SlideCarousel } from './SlideCarousel';
import { FlashcardsTab } from './FlashcardsTab';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
interface EditorPaneProps {
  note: NoteType;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editContent: string;
  setEditContent: (v: string) => void;
  dbContent: string;
  aiSummary: string;
  isSaving: boolean;
  handleSave: () => void;
  copied: boolean;
  handleCopy: () => void;
  activeTab: 'notes'|'study_guide'|'mind_map'|'slides'|'report'|'audio'|'summary'|'flashcards';
  setActiveTab: (t: any) => void;
  studioData: any;
  hasFlashcards?: boolean;
  canUpdateCommunityNote?: boolean;
  isCommunityNote?: boolean;
  isSavingToMyNotes?: boolean;
  handleSaveToMyNotes?: () => void;
}

export const EditorPane = ({
  note,
  isEditing,
  setIsEditing,
  editContent,
  setEditContent,
  dbContent,
  aiSummary,
  isSaving,
  handleSave,
  copied,
  handleCopy,
  activeTab,
  setActiveTab,
  studioData,
  hasFlashcards,
  canUpdateCommunityNote = true,
  isCommunityNote = false,
  isSavingToMyNotes = false,
  handleSaveToMyNotes
}: EditorPaneProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [pdfHeight, setPdfHeight] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const onDrag = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    if (newHeight > 10 && newHeight < 90) {
      setPdfHeight(newHeight);
    }
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    setIsDraggingState(false);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  }, [onDrag]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }, [onDrag, stopDrag]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', suppressErrorRendering: true });
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (studioData?.audio) {
        const utterance = new SpeechSynthesisUtterance(studioData.audio);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const tabs = [
    { id: 'notes', label: 'Notes' },
    ...(aiSummary ? [{ id: 'summary', label: 'Summary' }] : []),
    ...(studioData?.study_guide ? [{ id: 'study_guide', label: 'Study Guide' }] : []),
    ...(hasFlashcards ? [{ id: 'flashcards', label: 'Flashcards' }] : []),
    ...(studioData?.slides ? [{ id: 'slides', label: 'Slides' }] : []),
    ...(studioData?.mind_map ? [{ id: 'mind_map', label: 'Mind Map' }] : []),
    ...(studioData?.report ? [{ id: 'report', label: 'Report' }] : []),
    ...(studioData?.audio ? [{ id: 'audio', label: 'Audio' }] : []),
  ];

  const [isUrlAccessible, setIsUrlAccessible] = useState(true);

  useEffect(() => {
    if (note.fileUrl) {
      if (note.fileUrl.startsWith('blob:')) {
        fetch(note.fileUrl)
          .then((res) => {
            setIsUrlAccessible(res.ok);
          })
          .catch(() => {
            setIsUrlAccessible(false);
          });
      } else {
        setIsUrlAccessible(true);
      }
    } else {
      setIsUrlAccessible(false);
    }
  }, [note.fileUrl]);

  const isViewableUrl = note.fileUrl && (note.fileUrl.startsWith('http') || note.fileUrl.startsWith('blob:') || note.fileUrl.startsWith('data:'));

  const renderers = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match && match[1] === 'mermaid') {
        return <MermaidViewer code={String(children).replace(/\n$/, '')} />;
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-w-0 bg-[#0d0f14] relative">
      {isViewableUrl && (
        <>
          <div 
            className="border-b border-white/10 relative group shrink-0"
            style={{ height: `${pdfHeight}%` }}
          >
            {isUrlAccessible ? (
              <>
                <iframe 
                  src={`${note.fileUrl}#toolbar=0`} 
                  className={`w-full h-full bg-white ${isDraggingState ? 'pointer-events-none' : ''}`} 
                  title="PDF Viewer"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={note.fileUrl || undefined} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-xs font-semibold text-white hover:bg-black/80 transition-colors border border-white/10">
                    Open Original
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-[#0d0f14] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">Source Document Unavailable</h4>
                <p className="text-[11px] text-slate-400 max-w-sm leading-normal">
                  This document was uploaded as a temporary file in a previous browser session. The original file is no longer in memory, but your extracted text, notes, and study tools are fully active below.
                </p>
              </div>
            )}
          </div>
          <div 
            onMouseDown={startDrag}
            className="h-1.5 bg-white/[0.02] hover:bg-primary/50 cursor-ns-resize shrink-0 transition-colors z-10 flex items-center justify-center group"
          >
            <div className="w-8 h-0.5 bg-white/20 group-hover:bg-primary rounded-full transition-colors" />
          </div>
        </>
      )}

      <div className={`flex-1 flex flex-col min-h-0 ${!isViewableUrl ? 'h-full' : ''}`}>
        <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-[#171920]">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {activeTab === 'notes' && !isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit Mode
              </button>
            ) : activeTab === 'notes' && isEditing ? (
              isCommunityNote ? (
                <>
                  <button onClick={handleSaveToMyNotes} disabled={isSavingToMyNotes || isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-medium transition-colors">
                    {isSavingToMyNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save to My Notes
                  </button>
                  {canUpdateCommunityNote && (
                    <button onClick={handleSave} disabled={isSaving || isSavingToMyNotes} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors">
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Update in Community
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              )
            ) : null}
            <button onClick={handleCopy} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {activeTab === 'notes' && (
            <>
              {isEditing ? (
                <div className="bg-[#171920] rounded-xl overflow-hidden border border-white/10 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-white/10 [&_.ql-toolbar]:bg-white/5 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-slate-300 [&_.ql-editor]:font-poppins [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed [&_.ql-editor.ql-blank::before]:text-slate-500 [&_.ql-picker]:text-slate-300 [&_.ql-stroke]:stroke-slate-300 [&_.ql-fill]:fill-slate-300 [&_.ql-picker-options]:bg-[#1c1f26] [&_.ql-picker-options]:border-white/10 [&_.ql-picker-item:hover]:text-white [&_button:hover_.ql-stroke]:stroke-white [&_button:hover_.ql-fill]:fill-white">
                  <ReactQuill 
                    theme="snow"
                    value={editContent}
                    onChange={setEditContent}
                    modules={{
                      toolbar: [
                        [{ 'font': [] }],
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                        ['clean']
                      ]
                    }}
                    placeholder="Start taking notes..."
                  />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {dbContent ? (
                    <div 
                      className="text-sm text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_.ql-font-serif]:font-serif [&_.ql-font-monospace]:font-mono"
                      dangerouslySetInnerHTML={{ __html: dbContent }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 italic space-y-3">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>No notes written yet. Click edit mode to start.</p>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

          {activeTab === 'summary' && aiSummary && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h4 className="text-base font-semibold text-purple-100 font-outfit">AI Summary</h4>
              </div>
              <div className="text-sm text-purple-200/90 font-poppins leading-relaxed whitespace-pre-wrap relative z-10 prose prose-invert prose-p:text-purple-200/90 prose-li:text-purple-200/90 max-w-none">
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {activeTab === 'study_guide' && studioData?.study_guide && (
            <div className="prose prose-invert max-w-none text-sm font-poppins text-slate-300">
              <ReactMarkdown components={renderers}>{studioData.study_guide}</ReactMarkdown>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsTab noteId={note.id} />
          )}

          {activeTab === 'slides' && studioData?.slides && (
            <SlideCarousel slidesText={studioData.slides} renderers={renderers} />
          )}

          {activeTab === 'report' && studioData?.report && (
            <div className="prose prose-invert max-w-none text-sm font-poppins text-slate-300">
              <ReactMarkdown components={renderers}>{studioData.report}</ReactMarkdown>
            </div>
          )}

          {activeTab === 'mind_map' && studioData?.mind_map && (
             <MermaidViewer code={studioData.mind_map} />
          )}

          {activeTab === 'audio' && studioData?.audio && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                <button 
                  onClick={toggleAudio}
                  className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white shadow-xl shadow-blue-500/20"
                >
                  {isPlaying ? <Square className="w-6 h-6" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
                </button>
                <div className="text-center">
                  <h4 className="font-semibold text-blue-100">Audio Overview</h4>
                  <p className="text-xs text-blue-200/70">{isPlaying ? 'Playing...' : 'Click to listen via browser TTS'}</p>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-sm font-poppins text-slate-400 bg-white/5 p-6 rounded-2xl border border-white/5">
                <h4 className="text-white mb-4">Dialogue Script</h4>
                <div className="whitespace-pre-wrap">{studioData.audio}</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
