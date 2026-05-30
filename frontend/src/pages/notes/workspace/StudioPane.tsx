import { Sparkles, Loader2, Headphones, Zap, Video, GraduationCap, BrainCircuit, BarChart, ChevronRight } from 'lucide-react';
import { generateStudyGuide, generateMindMap, generateSlideDeck, generateReport, generateAudioScript } from './studioUtils';
import { NoteType } from '../types';
import { toast } from 'react-hot-toast';

interface StudioPaneProps {
  note: NoteType;
  dbContent: string;
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

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isLoading: boolean;
  onClick: () => void;
  accentColor: string;
  bgClass?: string;
}

const ToolButton = ({ icon, label, isLoading, onClick, accentColor, bgClass }: ToolButtonProps) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
      ${bgClass || 'bg-white/[0.03] hover:bg-white/[0.07]'} border border-white/[0.04] hover:border-white/[0.1]`}
  >
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}>
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
    </div>
    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white flex-1 truncate">
      {isLoading ? 'Generating...' : label}
    </span>
    {!isLoading && (
      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
    )}
  </button>
);

export const StudioPane = ({
  note,
  dbContent,
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
}: StudioPaneProps) => {
  const handleGenerate = async (
    key: string,
    tab: string,
    generatorFn: (t: string, c: string) => Promise<string>,
    setLoading: (v: boolean) => void
  ) => {
    if (!note || !dbContent) {
      toast.error('Add some notes first to generate materials!');
      return;
    }
    setLoading(true);
    try {
      toast.loading(`Generating ${key}...`, { id: 'gen' });
      const res = await generatorFn(note.title, dbContent);
      await updateStudioData(key, res);
      setActiveTab(tab);
      toast.success(`${key} generated successfully!`, { id: 'gen' });
    } catch (e: any) {
      toast.error(e.message || `Failed to generate ${key}`, { id: 'gen' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[200px] bg-[#13151a] border-l border-white/[0.06] flex flex-col shrink-0 hidden lg:flex">
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Studio</h3>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        <ToolButton
          icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          label="Generate Summary"
          isLoading={isGenerating}
          onClick={handleGenerateSummary}
          accentColor="bg-indigo-500/15"
        />

        <ToolButton
          icon={<Headphones className="w-3.5 h-3.5 text-blue-400" />}
          label="Audio Overview"
          isLoading={isGeneratingAudio}
          onClick={() => handleGenerate('audio', 'audio', generateAudioScript, setIsGeneratingAudio)}
          accentColor="bg-blue-500/15"
        />

        <ToolButton
          icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />}
          label={hasFlashcards ? 'Study Flashcards' : 'Create Flashcards'}
          isLoading={isGeneratingFlashcards}
          onClick={() => hasFlashcards ? setIsStudyModalOpen(true) : handleGenerateFlashcards()}
          accentColor="bg-emerald-500/15"
          bgClass="bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]"
        />

        <div className="h-px bg-white/[0.04] my-2" />

        <ToolButton
          icon={<Video className="w-3.5 h-3.5 text-orange-400" />}
          label="Slide Deck"
          isLoading={isGeneratingSlides}
          onClick={() => handleGenerate('slides', 'slides', generateSlideDeck, setIsGeneratingSlides)}
          accentColor="bg-orange-500/15"
        />

        <ToolButton
          icon={<GraduationCap className="w-3.5 h-3.5 text-purple-400" />}
          label="Study Guide"
          isLoading={isGeneratingStudyGuide}
          onClick={() => handleGenerate('study_guide', 'study_guide', generateStudyGuide, setIsGeneratingStudyGuide)}
          accentColor="bg-purple-500/15"
        />

        <ToolButton
          icon={<BrainCircuit className="w-3.5 h-3.5 text-pink-400" />}
          label="Mind Map"
          isLoading={isGeneratingMindMap}
          onClick={() => handleGenerate('mind_map', 'mind_map', generateMindMap, setIsGeneratingMindMap)}
          accentColor="bg-pink-500/15"
        />

        <ToolButton
          icon={<BarChart className="w-3.5 h-3.5 text-cyan-400" />}
          label="Reports"
          isLoading={isGeneratingReport}
          onClick={() => handleGenerate('report', 'report', generateReport, setIsGeneratingReport)}
          accentColor="bg-cyan-500/15"
        />
      </div>

      {/* Footer Hint */}
      <div className="p-2.5 border-t border-white/[0.04]">
        <p className="text-[9px] text-slate-600 text-center leading-relaxed">
          Click a tool to generate & view content in the main area.
        </p>
      </div>
    </div>
  );
};
