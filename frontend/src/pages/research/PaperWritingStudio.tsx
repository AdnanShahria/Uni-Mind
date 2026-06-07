import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Sparkles, Loader2, CheckCircle2,
  FileText, BarChart3, BookMarked, Copy, ChevronDown, ChevronUp,
  Save, Eye, EyeOff, Type
} from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Section {
  key: string;
  label: string;
  subtitle: string;
  placeholder: string;
  wordTarget: number;
  color: string;
  icon: React.ReactNode;
}

// ─── Section Definitions ────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    key: 'abstract',
    label: 'Abstract',
    subtitle: 'Brief summary of the entire paper (150–300 words)',
    placeholder: 'Summarize the purpose, methodology, results, and significance of your research in a concise paragraph...',
    wordTarget: 250,
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400',
    icon: <FileText style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'introduction',
    label: 'Introduction',
    subtitle: 'Background, motivation, and research objectives',
    placeholder: 'Introduce the research topic, establish the context, identify the research gap, and state your objectives and contributions...',
    wordTarget: 600,
    color: 'from-blue-500/20 to-sky-500/10 border-blue-500/20 text-blue-400',
    icon: <Type style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'literature_review',
    label: 'Literature Review',
    subtitle: 'Survey of relevant existing research',
    placeholder: 'Review and critically analyze prior work in your field. Identify trends, gaps, and how your work relates...',
    wordTarget: 800,
    color: 'from-purple-500/20 to-violet-500/10 border-purple-500/20 text-purple-400',
    icon: <BookMarked style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'methodology',
    label: 'Methodology',
    subtitle: 'Research design, data collection, and analysis methods',
    placeholder: 'Describe your research design, data sources, sample selection, tools, procedures, and how you analyzed the data...',
    wordTarget: 700,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
    icon: <BarChart3 style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'results',
    label: 'Results / Findings',
    subtitle: 'Objective presentation of your data and outcomes',
    placeholder: 'Present your findings clearly and objectively. Use data, statistics, and figures to support your results...',
    wordTarget: 600,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    icon: <CheckCircle2 style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'discussion',
    label: 'Discussion',
    subtitle: 'Interpret results, compare with prior work, acknowledge limitations',
    placeholder: 'Interpret your results in the context of your research questions. Discuss implications, compare with existing literature, and address limitations...',
    wordTarget: 700,
    color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/20 text-cyan-400',
    icon: <Sparkles style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'conclusion',
    label: 'Conclusion',
    subtitle: 'Summary of contributions and future directions',
    placeholder: 'Summarize your key contributions, restate findings in the context of the research objectives, and suggest directions for future research...',
    wordTarget: 350,
    color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/20 text-indigo-400',
    icon: <CheckCircle2 style={{ width: 14, height: 14 }} />,
  },
  {
    key: 'references',
    label: 'References',
    subtitle: 'Full bibliography (APA, MLA, or IEEE format)',
    placeholder: 'List all references cited in your paper. Format consistently (e.g., APA):\n\nAuthor, A. A. (Year). Title of work. Publisher. https://doi.org/xxxxx\n...',
    wordTarget: 400,
    color: 'from-slate-500/20 to-zinc-500/10 border-slate-500/20 text-slate-300',
    icon: <BookMarked style={{ width: 14, height: 14 }} />,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const AI_SUGGESTIONS: Record<string, string> = {
  abstract: 'An AI-generated abstract would briefly state: (1) the problem addressed, (2) the methodology used, (3) the key results obtained, and (4) the significance of the findings. Aim for 200–250 words with no citations.',
  introduction: 'A strong introduction should: hook the reader with the problem\'s importance, provide background context, review related work briefly, identify the research gap, and clearly state your research objectives and contributions.',
  literature_review: 'Structure your literature review thematically or chronologically. Group related works together, critically evaluate each, and synthesize how they relate to your research question. End with a clear statement of the gap your work fills.',
  methodology: 'Describe your research design (qualitative/quantitative/mixed), sampling strategy, data collection instruments, procedures followed, and analysis methods. Be reproducible — another researcher should be able to replicate your study.',
  results: 'Present results objectively without interpretation. Use tables and figures (described in text). State statistical significance where applicable. Report both expected and unexpected findings.',
  discussion: 'Interpret what your results mean. Connect findings back to your research questions. Compare with prior work. Discuss theoretical and practical implications. Acknowledge limitations honestly and explain their impact.',
  conclusion: 'Restate your main contributions concisely. Summarize how findings advance the field. Suggest specific, actionable future research directions. Avoid introducing new information here.',
  references: 'Ensure every source cited in the paper appears here. Format consistently. Verify DOIs are active. Include page numbers for book chapters. Use a citation manager (Zotero, Mendeley) for accuracy.',
};

// ─── Section Editor ──────────────────────────────────────────────────────────

const SectionEditor = ({
  section, value, onChange, onAiSuggest
}: {
  section: Section;
  value: string;
  onChange: (val: string) => void;
  onAiSuggest: (key: string) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const words = countWords(value);
  const pct = Math.min(100, Math.round((words / section.wordTarget) * 100));
  const complete = words >= section.wordTarget;

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${section.color.split(' ').slice(0, 2).join(' ')} border ${section.color.split(' ')[2]} overflow-hidden`}>
      {/* Section Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-black/30 ${section.color.split(' ')[3]}`}>
            {section.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white font-poppins">{section.label}</span>
              {complete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[10.5px] text-slate-500 font-poppins">{section.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-[11px] font-bold font-poppins ${complete ? 'text-emerald-400' : section.color.split(' ')[3]}`}>
              {words} / {section.wordTarget}w
            </span>
            <div className="h-1 w-20 bg-black/30 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${complete ? 'bg-emerald-400' : 'bg-current'} ${section.color.split(' ')[3]}`}
                style={{ width: `${pct}%`, background: complete ? undefined : 'currentColor' }}
              />
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {/* Section Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/[0.04] pt-4 space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAiSuggest(section.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/40 ${section.color.split(' ')[3]} border ${section.color.split(' ')[2]} text-[11px] font-bold font-poppins transition-all`}
                  >
                    <Sparkles style={{ width: 11, height: 11 }} /> AI Guide
                  </button>
                  {value && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(value); toast.success(`${section.label} copied!`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-slate-400 hover:text-white text-[11px] font-bold font-poppins transition-all"
                    >
                      <Copy style={{ width: 11, height: 11 }} /> Copy
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 font-poppins transition-colors"
                >
                  {showPreview ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {/* Editor / Preview */}
              {showPreview ? (
                <div className="min-h-[120px] bg-black/20 border border-white/[0.06] rounded-xl p-4 text-[12.5px] text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">
                  {value || <span className="text-slate-600 italic">Nothing written yet...</span>}
                </div>
              ) : (
                <textarea
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder={section.placeholder}
                  rows={8}
                  className="w-full bg-black/20 border border-white/[0.06] rounded-xl p-4 text-[12.5px] text-slate-200 placeholder-slate-600 focus:border-white/[0.15] outline-none transition-all font-mono leading-relaxed resize-y min-h-[120px]"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── AI Suggestion Modal ─────────────────────────────────────────────────────

const AISuggestionModal = ({
  sectionKey, onClose, onInsert
}: {
  sectionKey: string | null;
  onClose: () => void;
  onInsert: (text: string) => void;
}) => {
  if (!sectionKey) return null;
  const sec = SECTIONS.find(s => s.key === sectionKey);
  const suggestion = AI_SUGGESTIONS[sectionKey] || '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#0e1525] border border-primary/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary-glow" />
            <h3 className="text-[14px] font-bold text-white font-poppins">AI Writing Guide — {sec?.label}</h3>
          </div>
          <p className="text-[12.5px] text-slate-300 font-poppins leading-relaxed mb-4">{suggestion}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { onInsert(suggestion); onClose(); toast.success('Suggestion inserted!'); }}
              className="flex-1 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-glow text-[12px] font-bold font-poppins transition-all"
            >
              Insert as Draft
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 text-[12px] font-bold font-poppins transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const PaperWritingStudio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const storageKey = `paper_writing_${id}`;

  // Section content state
  const [content, setContent] = useState<Record<string, string>>({});
  const [aiModalSection, setAiModalSection] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await turso.auth.getUser();
        if (!user) { navigate('/auth'); return; }

        const { data: papers } = await turso.from('research_papers').select('*').eq('id', id);
        if (!papers || papers.length === 0) { navigate('/app/research'); return; }
        setPaper(papers[0]);

        // Load from localStorage first
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (Object.keys(stored).length > 0) {
          setContent(stored);
        } else {
          // Seed abstract from DB if exists
          const initial: Record<string, string> = {};
          SECTIONS.forEach(s => { initial[s.key] = ''; });
          if (papers[0].abstract && papers[0].abstract !== 'In-progress research project started on UniMind.') {
            initial.abstract = papers[0].abstract;
          }
          setContent(initial);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load writing studio');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // ─── Auto-save (debounced 2s) ─────────────────────────────────────────────
  const handleSectionChange = useCallback((key: string, value: string) => {
    setContent(prev => {
      const updated = { ...prev, [key]: value };
      // Debounced local save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setLastSaved(new Date());
      }, 800);
      return updated;
    });
  }, [storageKey]);

  // ─── Manual Save to DB ────────────────────────────────────────────────────
  const saveToDb = async () => {
    setIsSaving(true);
    try {
      const abstractText = content.abstract || '';
      await turso.from('research_papers').update({ abstract: abstractText }).eq('id', id);
      localStorage.setItem(storageKey, JSON.stringify(content));
      setLastSaved(new Date());
      toast.success('Paper saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save paper');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Export ───────────────────────────────────────────────────────────────
  const exportPaper = () => {
    const lines: string[] = [
      paper?.title?.toUpperCase() || 'RESEARCH PAPER',
      paper?.authors ? `\nAuthors: ${paper.authors}` : '',
      `Exported from UniMind — ${new Date().toLocaleDateString()}`,
      `${'═'.repeat(70)}`,
      '',
      ...SECTIONS.flatMap(sec => [
        `${'─'.repeat(70)}`,
        sec.label.toUpperCase(),
        `${'─'.repeat(70)}`,
        content[sec.key] || '(Not written yet)',
        '',
      ]),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(paper?.title || 'paper').replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Paper exported!');
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalWords = Object.values(content).join(' ').split(/\s+/).filter(Boolean).length;
  const completedSections = SECTIONS.filter(s => countWords(content[s.key] || '') >= s.wordTarget).length;
  const overallPct = Math.round((completedSections / SECTIONS.length) * 100);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-poppins text-slate-400">Loading Writing Studio...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/app/research/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold font-poppins bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-xl border border-white/[0.06]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span className="text-xs text-purple-400/80 font-bold uppercase tracking-wider font-poppins">Paper Writing Studio</span>
        </div>
      </div>

      {/* Title + Stats bar */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-poppins mb-1">Academic Paper Writing Studio</p>
            <h1 className="text-xl md:text-2xl font-extrabold text-white font-outfit leading-tight">{paper?.title || 'Untitled Project'}</h1>
            {lastSaved && (
              <p className="text-[10.5px] text-slate-500 font-poppins mt-1 flex items-center gap-1">
                <Save style={{ width: 10, height: 10 }} /> Auto-saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={saveToDb}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold font-poppins transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Paper
            </button>
            <button
              onClick={exportPaper}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-bold font-poppins transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export .txt
            </button>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Words', value: totalWords.toLocaleString(), color: 'text-purple-400' },
            { label: 'Sections Done', value: `${completedSections} / ${SECTIONS.length}`, color: 'text-emerald-400' },
            { label: 'Est. Pages', value: `~${Math.max(1, Math.round(totalWords / 275))}`, color: 'text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-black/20 border border-white/[0.04] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className={`text-xl font-extrabold font-poppins ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400 font-poppins">Overall Paper Progress</span>
            <span className="text-[11px] font-bold text-purple-400 font-poppins">{overallPct}%</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Section Navigator */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(sec => {
          const wc = countWords(content[sec.key] || '');
          const done = wc >= sec.wordTarget;
          return (
            <button
              key={sec.key}
              onClick={() => {
                document.getElementById(`section-${sec.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold font-poppins transition-all border ${
                done
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              {done ? <CheckCircle2 style={{ width: 11, height: 11 }} /> : null}
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map(sec => (
          <div key={sec.key} id={`section-${sec.key}`}>
            <SectionEditor
              section={sec}
              value={content[sec.key] || ''}
              onChange={val => handleSectionChange(sec.key, val)}
              onAiSuggest={key => setAiModalSection(key)}
            />
          </div>
        ))}
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 flex items-center justify-between bg-[#0b1121]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-3 shadow-2xl">
        <div className="text-[12px] font-poppins text-slate-400">
          <span className="font-bold text-white">{totalWords.toLocaleString()}</span> words ·{' '}
          <span className="font-bold text-purple-400">{completedSections}/{SECTIONS.length}</span> sections complete
          {lastSaved && <span className="ml-2 text-slate-600">· Saved {lastSaved.toLocaleTimeString()}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveToDb}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold font-poppins transition-all"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
          <button
            onClick={exportPaper}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-bold font-poppins transition-all"
          >
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* AI Suggestion Modal */}
      {aiModalSection && (
        <AISuggestionModal
          sectionKey={aiModalSection}
          onClose={() => setAiModalSection(null)}
          onInsert={text => handleSectionChange(aiModalSection, text)}
        />
      )}
    </motion.div>
  );
};
