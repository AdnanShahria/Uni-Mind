import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Tag, Link2,
  FileText, Sparkles, Download, Shield, TrendingUp, Clock,
  BookMarked, AlertTriangle, Loader2, Copy, ChevronDown,
  ChevronUp, Activity, Target, BarChart3, Globe, Hash
} from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  category: 'status' | 'note' | 'milestone' | 'reference' | 'system';
}

interface Reference {
  id: string;
  title: string;
  authors: string;
  doi: string;
  year: string;
  url: string;
}

interface ComplianceItem {
  id: string;
  label: string;
  checked: boolean;
  severity: 'low' | 'medium' | 'high';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

const categoryColors: Record<ActivityLog['category'], string> = {
  status: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  note: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  milestone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  reference: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  system: 'text-slate-400 bg-white/[0.04] border-white/[0.06]',
};

const DEFAULT_MILESTONES: Omit<Milestone, 'id'>[] = [
  { label: 'Literature Review', completed: false },
  { label: 'Research Question & Hypothesis', completed: false },
  { label: 'Methodology Design', completed: false },
  { label: 'Data Collection / Experiment', completed: false },
  { label: 'Data Analysis', completed: false },
  { label: 'Draft Writing', completed: false },
  { label: 'Peer Review / Revision', completed: false },
  { label: 'Final Submission', completed: false },
];

const DEFAULT_COMPLIANCE: Omit<ComplianceItem, 'id'>[] = [
  { label: 'IRB / Ethics Committee Approval', checked: false, severity: 'high' },
  { label: 'Informed Consent (if human subjects)', checked: false, severity: 'high' },
  { label: 'Data Privacy & GDPR Compliance', checked: false, severity: 'high' },
  { label: 'Conflict of Interest Declared', checked: false, severity: 'medium' },
  { label: 'Funding Source Disclosed', checked: false, severity: 'medium' },
  { label: 'Open Access / Licensing Decision Made', checked: false, severity: 'low' },
  { label: 'Data Repository Submission Planned', checked: false, severity: 'low' },
];

// ─── Section Components ──────────────────────────────────────────────────────

const SectionCard = ({
  title, icon, children, defaultOpen = true, accent = 'text-primary-glow'
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
  defaultOpen?: boolean; accent?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={accent}>{icon}</span>
          <span className="text-[13px] font-bold text-white font-poppins">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const ResearchAuditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Basic
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Intermediate
  const [references, setReferences] = useState<Reference[]>([]);
  const [newRef, setNewRef] = useState<Omit<Reference, 'id'>>({ title: '', authors: '', doi: '', year: '', url: '' });
  const [showRefForm, setShowRefForm] = useState(false);

  // Advanced
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // ─── Load from localStorage (persisted per paper) ────────────────────────
  const storageKey = `audit_${id}`;

  const persistState = useCallback((update: Record<string, any>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify({ ...existing, ...update }));
    } catch { /* ignore */ }
  }, [storageKey]);

  const addLog = useCallback((action: string, category: ActivityLog['category']) => {
    const entry: ActivityLog = {
      id: crypto.randomUUID(),
      action,
      timestamp: new Date().toISOString(),
      category,
    };
    setActivityLog(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      persistState({ activityLog: updated });
      return updated;
    });
  }, [persistState]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await turso.auth.getUser();
        if (!user) { navigate('/auth'); return; }

        const { data: papers } = await turso.from('research_papers').select('*').eq('id', id);
        if (!papers || papers.length === 0) { navigate('/app/research'); return; }
        setPaper(papers[0]);

        // Load word count from writing studio if stored
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');

        setMilestones(stored.milestones ?? DEFAULT_MILESTONES.map(m => ({ ...m, id: crypto.randomUUID() })));
        setActivityLog(stored.activityLog ?? [{
          id: crypto.randomUUID(),
          action: 'Research project created on UniMind',
          timestamp: papers[0].created_at || new Date().toISOString(),
          category: 'system' as const,
        }]);
        setTags(stored.tags ?? []);
        setReferences(stored.references ?? []);
        setCompliance(stored.compliance ?? DEFAULT_COMPLIANCE.map(c => ({ ...c, id: crypto.randomUUID() })));
        setAiSummary(stored.aiSummary ?? '');

        // Word count from writing studio
        const wsKey = `paper_writing_${id}`;
        const wsData = JSON.parse(localStorage.getItem(wsKey) || '{}');
        const totalWords = Object.values(wsData as Record<string, string>)
          .join(' ').split(/\s+/).filter(Boolean).length;
        setWordCount(totalWords);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load audit data');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // ─── Milestone Actions ───────────────────────────────────────────────────
  const toggleMilestone = (milId: string) => {
    setMilestones(prev => {
      const updated = prev.map(m => {
        if (m.id !== milId) return m;
        const completed = !m.completed;
        if (completed) addLog(`Milestone completed: "${m.label}"`, 'milestone');
        return { ...m, completed, completedAt: completed ? new Date().toISOString() : undefined };
      });
      persistState({ milestones: updated });
      return updated;
    });
  };

  const addMilestone = () => {
    const label = prompt('Enter milestone name:');
    if (!label?.trim()) return;
    const m: Milestone = { id: crypto.randomUUID(), label: label.trim(), completed: false };
    setMilestones(prev => {
      const updated = [...prev, m];
      persistState({ milestones: updated });
      return updated;
    });
    addLog(`Milestone added: "${label.trim()}"`, 'milestone');
  };

  const deleteMilestone = (milId: string) => {
    setMilestones(prev => {
      const updated = prev.filter(m => m.id !== milId);
      persistState({ milestones: updated });
      return updated;
    });
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  // ─── Tag Actions ─────────────────────────────────────────────────────────
  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    persistState({ tags: updated });
    setNewTag('');
    addLog(`Keyword tag added: "${newTag.trim()}"`, 'system');
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    setTags(updated);
    persistState({ tags: updated });
  };

  // ─── Reference Actions ───────────────────────────────────────────────────
  const addReference = () => {
    if (!newRef.title.trim()) { toast.error('Title is required'); return; }
    const ref: Reference = { ...newRef, id: crypto.randomUUID() };
    const updated = [...references, ref];
    setReferences(updated);
    persistState({ references: updated });
    setNewRef({ title: '', authors: '', doi: '', year: '', url: '' });
    setShowRefForm(false);
    addLog(`Reference added: "${ref.title}"`, 'reference');
    toast.success('Reference saved!');
  };

  const deleteReference = (refId: string) => {
    const updated = references.filter(r => r.id !== refId);
    setReferences(updated);
    persistState({ references: updated });
    addLog('Reference removed', 'reference');
  };

  const copyRefAPA = (ref: Reference) => {
    const citation = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.doi ? `https://doi.org/${ref.doi}` : ref.url}`;
    navigator.clipboard.writeText(citation);
    toast.success('APA citation copied!');
  };

  // ─── Compliance Actions ──────────────────────────────────────────────────
  const toggleCompliance = (cId: string) => {
    setCompliance(prev => {
      const updated = prev.map(c =>
        c.id === cId ? { ...c, checked: !c.checked } : c
      );
      persistState({ compliance: updated });
      return updated;
    });
  };

  const complianceScore = Math.round(
    (compliance.filter(c => c.checked).length / (compliance.length || 1)) * 100
  );

  // ─── AI Audit Summary ────────────────────────────────────────────────────
  const generateAISummary = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const completed = milestones.filter(m => m.completed).map(m => m.label);
      const pending = milestones.filter(m => !m.completed).map(m => m.label);
      const summary = `## AI Audit Summary — ${paper?.title || 'Research Project'}

**Progress Assessment:** ${progressPct}% complete (${completedCount}/${milestones.length} milestones).

**Completed Phases:** ${completed.length > 0 ? completed.join(', ') : 'None yet'}.

**Pending Phases:** ${pending.length > 0 ? pending.join(', ') : 'All phases complete — ready for submission!'}.

**References Catalogued:** ${references.length} sources tracked. ${references.length < 5 ? 'Consider expanding your literature base.' : 'Strong citation foundation established.'}

**Compliance Score:** ${complianceScore}% (${compliance.filter(c => c.checked).length}/${compliance.length} items cleared). ${complianceScore < 60 ? '⚠️ Several compliance items require attention before submission.' : '✅ Compliance posture is solid.'}

**Keywords:** ${tags.length > 0 ? tags.join(', ') : 'No keywords tagged yet — add keywords to improve discoverability.'}

**Recommendation:** ${progressPct < 50
        ? 'Focus on completing early-stage milestones. Ensure hypothesis is well-defined before data collection.'
        : progressPct < 80
          ? 'Strong momentum. Prioritize completing analysis and beginning the draft writing phase.'
          : 'Near completion. Initiate peer review cycle and address any remaining compliance requirements.'
      }`;
      setAiSummary(summary);
      persistState({ aiSummary: summary });
      setAiGenerating(false);
      addLog('AI Audit Summary generated', 'system');
      toast.success('AI Summary ready!');
    }, 1800);
  };

  // ─── Impact Score ─────────────────────────────────────────────────────────
  const impactScore = Math.min(100, Math.round(
    progressPct * 0.4 +
    Math.min(references.length * 5, 25) +
    complianceScore * 0.2 +
    tags.length * 2 +
    (wordCount > 500 ? 15 : wordCount > 100 ? 8 : 0)
  ));

  // ─── Export ───────────────────────────────────────────────────────────────
  const exportAudit = () => {
    const lines: string[] = [
      `RESEARCH AUDIT REPORT`,
      `Generated by UniMind — ${new Date().toLocaleDateString()}`,
      `${'─'.repeat(60)}`,
      ``,
      `PROJECT: ${paper?.title || 'Untitled'}`,
      `STATUS: ${paper?.status?.replace('_', ' ').toUpperCase() || 'N/A'}`,
      `STARTED: ${paper?.created_at ? new Date(paper.created_at).toLocaleDateString() : 'N/A'}`,
      ``,
      `PROGRESS: ${progressPct}% (${completedCount}/${milestones.length} milestones)`,
      `IMPACT SCORE: ${impactScore}/100`,
      `COMPLIANCE: ${complianceScore}%`,
      `WORD COUNT: ${wordCount}`,
      ``,
      `${'─'.repeat(60)}`,
      `MILESTONES`,
      `${'─'.repeat(60)}`,
      ...milestones.map(m => `[${m.completed ? '✓' : ' '}] ${m.label}${m.completedAt ? ` — ${formatTime(m.completedAt)}` : ''}`),
      ``,
      `${'─'.repeat(60)}`,
      `KEYWORDS / TAGS`,
      `${'─'.repeat(60)}`,
      tags.length > 0 ? tags.join(', ') : '(none)',
      ``,
      `${'─'.repeat(60)}`,
      `REFERENCES (${references.length})`,
      `${'─'.repeat(60)}`,
      ...references.map((r, i) =>
        `[${i + 1}] ${r.authors} (${r.year}). ${r.title}.${r.doi ? ` DOI: ${r.doi}` : ''}${r.url ? ` URL: ${r.url}` : ''}`
      ),
      ``,
      `${'─'.repeat(60)}`,
      `COMPLIANCE CHECKLIST`,
      `${'─'.repeat(60)}`,
      ...compliance.map(c => `[${c.checked ? '✓' : ' '}] [${c.severity.toUpperCase()}] ${c.label}`),
      ``,
      `${'─'.repeat(60)}`,
      `ACTIVITY LOG`,
      `${'─'.repeat(60)}`,
      ...activityLog.map(a => `${formatTime(a.timestamp)} — [${a.category.toUpperCase()}] ${a.action}`),
      ``,
      aiSummary ? `${'─'.repeat(60)}\n${aiSummary}` : '',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${(paper?.title || 'research').replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit report exported!');
    addLog('Audit report exported', 'system');
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-poppins text-slate-400">Loading Research Audit...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pb-16"
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
          <Activity className="w-5 h-5 text-indigo-400" />
          <span className="text-xs text-indigo-400/80 font-bold uppercase tracking-wider font-poppins">Research Audit File</span>
        </div>
      </div>

      {/* Title */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-poppins mb-1">Research Audit File</p>
            <h1 className="text-xl md:text-2xl font-extrabold text-white font-outfit leading-tight">{paper?.title || 'Untitled Project'}</h1>
            <p className="text-slate-400 text-sm font-poppins mt-1">{paper?.authors} · Started {paper?.created_at ? new Date(paper.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <button
            onClick={exportAudit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold font-poppins transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Report
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Progress', value: `${progressPct}%`, icon: <Target className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            { label: 'References', value: references.length, icon: <BookMarked className="w-3.5 h-3.5" />, color: 'text-purple-400' },
            { label: 'Compliance', value: `${complianceScore}%`, icon: <Shield className="w-3.5 h-3.5" />, color: complianceScore >= 70 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Impact Score', value: `${impactScore}/100`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-rose-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-black/20 border border-white/[0.05] rounded-xl p-3">
              <div className={`flex items-center gap-1.5 ${kpi.color} mb-1`}>
                {kpi.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider font-poppins">{kpi.label}</span>
              </div>
              <p className={`text-xl font-extrabold font-poppins ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-4">

          {/* ── BASIC: Milestone Tracker ── */}
          <SectionCard title="Research Milestones" icon={<Target className="w-4 h-4" />} accent="text-emerald-400">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400 font-poppins">{completedCount} / {milestones.length} complete</span>
                <span className="text-[11px] font-bold text-emerald-400 font-poppins">{progressPct}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/[0.04]">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/[0.04] group">
                  <button onClick={() => toggleMilestone(m.id)} className="shrink-0">
                    {m.completed
                      ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" style={{ width: 18, height: 18 }} />
                      : <Circle className="w-4.5 h-4.5 text-slate-600 group-hover:text-slate-400 transition-colors" style={{ width: 18, height: 18 }} />
                    }
                  </button>
                  <span className={`flex-1 text-[12.5px] font-poppins font-medium ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {m.label}
                  </span>
                  {m.completedAt && (
                    <span className="text-[10px] text-slate-600 font-poppins">{formatTime(m.completedAt)}</span>
                  )}
                  <button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-400 transition-all">
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addMilestone}
              className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors font-poppins"
            >
              <Plus style={{ width: 14, height: 14 }} /> Add Milestone
            </button>
          </SectionCard>

          {/* ── BASIC: Keyword Tags ── */}
          <SectionCard title="Keyword Tags" icon={<Hash className="w-4 h-4" />} accent="text-amber-400" defaultOpen={false}>
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {tags.map(tag => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 font-poppins"
                  >
                    <Tag style={{ width: 10, height: 10 }} />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-400 transition-colors ml-0.5">×</button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {tags.length === 0 && <p className="text-slate-500 text-[12px] font-poppins">No tags yet. Add keywords to improve discoverability.</p>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. machine learning, NLP..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:border-amber-500/30 outline-none font-poppins"
              />
              <button
                onClick={addTag}
                className="px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/20 rounded-xl text-amber-400 transition-all"
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </SectionCard>

          {/* ── INTERMEDIATE: Reference Manager ── */}
          <SectionCard title={`Reference Manager (${references.length})`} icon={<BookMarked className="w-4 h-4" />} accent="text-purple-400" defaultOpen={false}>
            <div className="space-y-2 mb-3">
              {references.length === 0 && (
                <p className="text-slate-500 text-[12px] font-poppins py-2">No references added yet. Track your sources here.</p>
              )}
              {references.map((ref, i) => (
                <div key={ref.id} className="p-3 rounded-xl bg-black/20 border border-white/[0.04] group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-200 font-poppins leading-snug">[{i + 1}] {ref.title}</p>
                      <p className="text-[10.5px] text-slate-500 font-poppins mt-0.5">{ref.authors} {ref.year ? `· ${ref.year}` : ''}</p>
                      {(ref.doi || ref.url) && (
                        <a
                          href={ref.doi ? `https://doi.org/${ref.doi}` : ref.url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 mt-1 font-poppins"
                        >
                          <Globe style={{ width: 10, height: 10 }} />
                          {ref.doi ? `DOI: ${ref.doi}` : ref.url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyRefAPA(ref)} className="p-1.5 text-slate-500 hover:text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all" title="Copy APA">
                        <Copy style={{ width: 12, height: 12 }} />
                      </button>
                      <button onClick={() => deleteReference(ref.id)} className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all">
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showRefForm ? (
              <div className="space-y-2 pt-3 border-t border-white/[0.04]">
                {[
                  { key: 'title', placeholder: 'Paper title *', required: true },
                  { key: 'authors', placeholder: 'Author(s)' },
                  { key: 'year', placeholder: 'Year' },
                  { key: 'doi', placeholder: 'DOI (e.g. 10.1000/xyz)' },
                  { key: 'url', placeholder: 'URL (if no DOI)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={placeholder}
                    value={(newRef as any)[key]}
                    onChange={e => setNewRef(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:border-purple-500/30 outline-none font-poppins"
                  />
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={addReference} className="flex-1 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-[12px] font-bold font-poppins transition-all">Save Reference</button>
                  <button onClick={() => setShowRefForm(false)} className="flex-1 py-2 rounded-xl bg-white/[0.04] text-slate-400 text-[12px] font-bold font-poppins transition-all hover:bg-white/[0.08]">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRefForm(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-purple-400 transition-colors font-poppins"
              >
                <Plus style={{ width: 14, height: 14 }} /> Add Reference
              </button>
            )}
          </SectionCard>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* ── BASIC: Activity Log ── */}
          <SectionCard title="Activity Log" icon={<Clock className="w-4 h-4" />} accent="text-blue-400">
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {activityLog.length === 0 && (
                <p className="text-slate-500 text-[12px] font-poppins">No activity yet.</p>
              )}
              {activityLog.map(log => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-poppins border ${categoryColors[log.category]}`}>
                    {log.category}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-slate-300 font-poppins leading-snug">{log.action}</p>
                    <p className="text-[10px] text-slate-600 font-poppins mt-0.5">{formatTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── ADVANCED: Compliance Checklist ── */}
          <SectionCard title="Research Compliance Checklist" icon={<Shield className="w-4 h-4" />} accent="text-rose-400" defaultOpen={false}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-400 font-poppins">{compliance.filter(c => c.checked).length}/{compliance.length} cleared</span>
              <div className={`flex items-center gap-1 text-[11px] font-bold font-poppins ${complianceScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceScore >= 70 ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <AlertTriangle style={{ width: 13, height: 13 }} />}
                {complianceScore}% compliant
              </div>
            </div>
            <div className="space-y-2">
              {compliance.map(item => (
                <div
                  key={item.id}
                  onClick={() => { toggleCompliance(item.id); addLog(`Compliance item ${item.checked ? 'unchecked' : 'checked'}: "${item.label}"`, 'system'); }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors group"
                >
                  {item.checked
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" style={{ width: 16, height: 16 }} />
                    : <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" style={{ width: 16, height: 16 }} />
                  }
                  <span className={`flex-1 text-[12px] font-poppins font-medium ${item.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-poppins ${
                    item.severity === 'high' ? 'bg-rose-500/15 text-rose-400'
                    : item.severity === 'medium' ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-slate-500/15 text-slate-400'
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── ADVANCED: Impact Score ── */}
          <SectionCard title="Impact Score Estimator" icon={<BarChart3 className="w-4 h-4" />} accent="text-rose-400" defaultOpen={false}>
            <div className="relative flex flex-col items-center py-4">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={impactScore >= 70 ? '#10b981' : impactScore >= 40 ? '#f59e0b' : '#f43f5e'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${impactScore * 2.638} 263.8`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white font-poppins">{impactScore}</span>
                  <span className="text-[9px] text-slate-500 font-poppins uppercase tracking-wider">/100</span>
                </div>
              </div>
              <p className="text-[12px] text-slate-400 font-poppins mt-3 text-center leading-relaxed">
                {impactScore >= 70 ? '🏆 Strong research impact potential' : impactScore >= 40 ? '📈 Moderate — keep building references & milestones' : '🔬 Early stage — complete more phases to increase score'}
              </p>
            </div>
            <div className="space-y-2 text-[11px] font-poppins text-slate-400">
              {[
                { label: 'Milestone Progress', value: progressPct, color: 'bg-emerald-500', weight: '40%' },
                { label: 'References', value: Math.min(references.length * 5, 25), color: 'bg-purple-500', weight: '25%' },
                { label: 'Compliance', value: complianceScore * 0.2, color: 'bg-rose-500', weight: '20%' },
                { label: 'Keywords & Content', value: Math.min(tags.length * 2 + (wordCount > 500 ? 15 : 0), 15), color: 'bg-amber-500', weight: '15%' },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-1"><span>{bar.label}</span><span className="text-white/40">{bar.weight} weight</span></div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, bar.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── ADVANCED: Word Count ── */}
          <SectionCard title="Writing Stats" icon={<FileText className="w-4 h-4" />} accent="text-cyan-400" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Words', value: wordCount, suffix: 'words' },
                { label: 'Est. Pages', value: Math.max(1, Math.round(wordCount / 275)), suffix: 'pages' },
              ].map(stat => (
                <div key={stat.label} className="bg-black/20 border border-white/[0.04] rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-poppins uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-cyan-400 font-poppins">{stat.value}</p>
                  <p className="text-[10px] text-slate-600 font-poppins">{stat.suffix}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 font-poppins mt-3">
              Writing stats sync from the <strong className="text-slate-400">Paper Writing Studio</strong>. Open that tab to start writing.
            </p>
          </SectionCard>

        </div>
      </div>

      {/* ── ADVANCED: AI Audit Summary (Full Width) ── */}
      <SectionCard title="AI Audit Summary Generator" icon={<Sparkles className="w-4 h-4" />} accent="text-primary-glow" defaultOpen={false}>
        {aiSummary ? (
          <div className="space-y-3">
            <div className="bg-black/30 border border-primary/10 rounded-xl p-4 text-[12.5px] text-slate-300 font-poppins leading-relaxed whitespace-pre-line">
              {aiSummary}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(aiSummary); toast.success('Copied!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] font-bold font-poppins transition-all"
              >
                <Copy style={{ width: 12, height: 12 }} /> Copy Summary
              </button>
              <button
                onClick={() => { setAiSummary(''); persistState({ aiSummary: '' }); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 text-[11px] font-bold font-poppins transition-all"
              >
                <Trash2 style={{ width: 12, height: 12 }} /> Clear
              </button>
              <button
                onClick={generateAISummary}
                disabled={aiGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-glow text-[11px] font-bold font-poppins transition-all"
              >
                {aiGenerating ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} /> : <Sparkles style={{ width: 12, height: 12 }} />}
                Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-[12.5px] text-slate-400 font-poppins leading-relaxed mb-4">
              Generate a comprehensive AI-written audit summary based on your milestones, references, compliance status, and activity log.
            </p>
            <button
              onClick={generateAISummary}
              disabled={aiGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-[13px] font-bold text-primary-glow font-poppins transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]"
            >
              {aiGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Summary...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate AI Audit Summary</>
              )}
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── ADVANCED: External Links ── */}
      <SectionCard title="External Resources & Links" icon={<Link2 className="w-4 h-4" />} accent="text-teal-400" defaultOpen={false}>
        <ExternalLinksWidget addLog={addLog} persistState={persistState} storageKey={storageKey} />
      </SectionCard>

    </motion.div>
  );
};

// ─── Sub-widget: External Links ───────────────────────────────────────────────
const ExternalLinksWidget = ({
  addLog, persistState, storageKey
}: {
  addLog: (action: string, cat: ActivityLog['category']) => void;
  persistState: (update: Record<string, any>) => void;
  storageKey: string;
}) => {
  const [links, setLinks] = useState<{ id: string; label: string; url: string }[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return stored.externalLinks ?? [];
    } catch { return []; }
  });
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addLink = () => {
    if (!newUrl.trim()) { toast.error('URL is required'); return; }
    const updated = [...links, { id: crypto.randomUUID(), label: newLabel || newUrl, url: newUrl }];
    setLinks(updated);
    persistState({ externalLinks: updated });
    setNewLabel(''); setNewUrl('');
    addLog(`External link added: "${newLabel || newUrl}"`, 'reference');
  };

  const removeLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    persistState({ externalLinks: updated });
  };

  return (
    <div className="space-y-2">
      {links.length === 0 && <p className="text-slate-500 text-[12px] font-poppins py-1">No external links added yet.</p>}
      {links.map(link => (
        <div key={link.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/[0.04] group">
          <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" style={{ width: 14, height: 14 }} />
          <a href={link.url} target="_blank" rel="noreferrer" className="flex-1 text-[12px] text-teal-400 hover:text-teal-300 font-poppins truncate">{link.label}</a>
          <button onClick={() => removeLink(link.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-400 transition-all">
            <Trash2 style={{ width: 12, height: 12 }} />
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <input
          type="text" placeholder="Label (optional)"
          value={newLabel} onChange={e => setNewLabel(e.target.value)}
          className="w-32 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:border-teal-500/30 outline-none font-poppins"
        />
        <input
          type="url" placeholder="https://..."
          value={newUrl} onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addLink()}
          className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-200 placeholder-slate-600 focus:border-teal-500/30 outline-none font-poppins"
        />
        <button onClick={addLink} className="px-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/20 rounded-xl text-teal-400 transition-all">
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
};
