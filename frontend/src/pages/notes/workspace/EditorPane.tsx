import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Loader2, Save, Check, Copy, FileText, Sparkles, Play, Square, ChevronLeft, ChevronRight, Maximize, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { NoteType } from '../types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';

const MermaidViewer = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        if (isMounted) setSvg(renderedSvg);
      } catch (e) {
        console.error("Mermaid error:", e);
        if (isMounted) setSvg(`<div class="text-red-400 p-4 border border-red-500/30 rounded-lg bg-red-500/10">Failed to render diagram</div>`);
      }
    };
    renderChart();
    return () => { isMounted = false; };
  }, [code]);

  return (
    <>
      <div className="w-full relative flex justify-center bg-white/5 rounded-xl p-6 my-6 overflow-auto border border-white/10 group">
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <Loader2 className="w-6 h-6 animate-spin text-primary" />}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-black/95 backdrop-blur-xl">
              
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md z-20 border border-white/10">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 rounded-xl hover:bg-white/20 text-slate-300 transition-colors" title="Zoom Out">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-16 text-center text-sm font-semibold text-white font-poppins">{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 rounded-xl hover:bg-white/20 text-slate-300 transition-colors" title="Zoom In">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button onClick={() => setZoom(1)} className="p-2 rounded-xl hover:bg-white/20 text-slate-300 transition-colors" title="Reset Zoom">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => { setIsFullscreen(false); setZoom(1); }}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors z-20 border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full h-full flex justify-center items-center overflow-auto p-4"
              >
                {svg ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: svg }} 
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                    className="flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-[90vw]" 
                  />
                ) : <Loader2 className="w-8 h-8 animate-spin text-primary" />}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const SlideCarousel = ({ slidesText, renderers }: { slidesText: string, renderers: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = slidesText.split('---').map(s => s.trim()).filter(s => s.length > 0);

  const nextSlide = () => setCurrentSlide(p => Math.min(p + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(p - 1, 0));

  if (slides.length === 0) return <div className="text-slate-400">No slides generated.</div>;

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto space-y-6 my-4">
      <div className="w-full aspect-[16/9] bg-[#1a1d24] border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-y-auto custom-scrollbar flex flex-col justify-center">
        <div className="prose prose-invert max-w-none text-base sm:text-lg font-poppins text-slate-200">
          <ReactMarkdown components={renderers}>{slides[currentSlide]}</ReactMarkdown>
        </div>
        <div className="absolute bottom-4 right-6 text-xs font-semibold text-slate-500">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-primary' : 'bg-white/20'}`} />
          ))}
        </div>
        <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

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
  activeTab: 'notes'|'study_guide'|'mind_map'|'slides'|'report'|'audio'|'summary';
  setActiveTab: (t: any) => void;
  studioData: any;
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
  studioData
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
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
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
    ...(studioData?.slides ? [{ id: 'slides', label: 'Slides' }] : []),
    ...(studioData?.mind_map ? [{ id: 'mind_map', label: 'Mind Map' }] : []),
    ...(studioData?.report ? [{ id: 'report', label: 'Report' }] : []),
    ...(studioData?.audio ? [{ id: 'audio', label: 'Audio' }] : []),
  ];

  const isViewableUrl = note.fileUrl && (note.fileUrl.startsWith('http') || note.fileUrl.startsWith('blob:') || note.fileUrl.startsWith('data:'));

  const renderers = {
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
          </div>
          {/* Draggable Resizer */}
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
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
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
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full min-h-[300px] h-full bg-transparent border-none text-sm text-slate-300 font-poppins resize-none outline-none leading-relaxed"
                  placeholder="Start taking notes..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  {dbContent ? (
                    <div className="text-sm text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">{dbContent}</div>
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
