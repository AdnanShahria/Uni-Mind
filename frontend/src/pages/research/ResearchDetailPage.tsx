import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Award, BookOpen, FlaskConical,
  Sparkles, Loader2, Copy, Users, Plus, Trash2, Save,
  Activity, PenLine
} from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

export const ResearchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paper, setPaper] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar');
  const [userId, setUserId] = useState<string | null>(null);

  // Advanced Interactive Options State
  const [citations, setCitations] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('to_read');
  const [citationOpenStyle, setCitationOpenStyle] = useState<'APA' | 'MLA' | 'IEEE'>('APA');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Collaborators for this paper/project
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('Co-Author');

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const { data: { user } } = await turso.auth.getUser();
        if (!user) {
          toast.error('Please login first');
          navigate('/auth');
          return;
        }
        setUserId(user.id);
        setUserName(user.user_metadata?.name || 'Scholar');

        // Fetch single paper by ID using dynamic endpoint
        const { data: fetchedPapers, error } = await turso
          .from('research_papers')
          .select('*')
          .eq('id', id);

        if (error || !fetchedPapers || fetchedPapers.length === 0) {
          toast.error('Research paper not found');
          navigate('/app/research');
          return;
        }

        const currentPaper = fetchedPapers[0];
        setPaper(currentPaper);
        setCitations(currentPaper.citations || 0);
        setStatus(currentPaper.status || 'to_read');
        setNotes(currentPaper.abstract || '');

        // Fetch collaborators for this user
        const { data: collabs } = await turso
          .from('research_collaborators')
          .select('*')
          .eq('user_id', user.id);

        if (collabs) {
          setCollaborators(collabs);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load paper details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaperDetails();
  }, [id, navigate]);

  // Premium action: Update citations
  const handleUpdateCitations = async (increment: boolean) => {
    const newValue = Math.max(0, citations + (increment ? 1 : -1));
    setCitations(newValue);
    try {
      await turso
        .from('research_papers')
        .update({ citations: newValue })
        .eq('id', id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync citations');
    }
  };

  // Premium action: Persistent Notes Save
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await turso
        .from('research_papers')
        .update({ abstract: notes })
        .eq('id', id);
      toast.success('Research notes auto-saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  // Premium action: Change Status
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await turso
        .from('research_papers')
        .update({ status: newStatus })
        .eq('id', id);
      toast.success(`Project status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync status');
    }
  };

  // Premium action: AI copilot generator
  const triggerAiAnalysis = () => {
    setAiGenerating(true);
    // Simulate premium AI multi-perspective paper analysis
    setTimeout(() => {
      setAiAnalysis({
        methodology: "Simulated methodology assessment finds high rigor, edge-computing focus, and potential constraints in bandwidth latency.",
        contributions: [
          "Establishes a novel decentralized edge caching schema optimized for high concurrency.",
          "Demonstrates a 27% latency reduction compared to classic centralized models.",
          "Provides open-source benchmark suite for sub-10ms response latency verification."
        ],
        weaknesses: "Requires significant edge node memory resources, which could restrict mobile deployment.",
        nextSteps: "Recommend integrating a lightweight WebAssembly compilation target to run securely on resource-constrained IoT gateways."
      });
      setAiGenerating(false);
      toast.success('AI Analysis Completed!');
    }, 1500);
  };

  // Premium action: Collaborator Management
  const handleAddCollaborator = async () => {
    if (!newCollabName.trim()) return;
    try {
      const newCollab = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: newCollabName,
        role: newCollabRole,
        avatar: newCollabName.substring(0, 2).toUpperCase(),
        color: ['from-rose-500 to-pink-500', 'from-blue-500 to-teal-500', 'from-purple-500 to-indigo-500', 'from-amber-500 to-orange-500'][Math.floor(Math.random() * 4)],
        created_at: new Date().toISOString()
      };

      await turso.from('research_collaborators').insert(newCollab);
      setCollaborators(prev => [...prev, newCollab]);
      setNewCollabName('');
      toast.success(`${newCollabName} added as collaborator!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add collaborator');
    }
  };

  const handleDeleteCollaborator = async (collabId: string) => {
    try {
      await turso.from('research_collaborators').delete().eq('id', collabId);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
      toast.success('Collaborator removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove collaborator');
    }
  };

  // Copy Citation logic
  const handleCopyCitation = (style: 'APA' | 'MLA' | 'IEEE') => {
    let citation = '';
    const authors = paper.authors || userName;
    const year = new Date(paper.created_at).getFullYear();
    const title = paper.title;
    const journal = 'arXiv Preprint / UniMind Research';

    if (style === 'APA') {
      citation = `${authors} (${year}). ${title}. ${journal}.`;
    } else if (style === 'MLA') {
      citation = `${authors}. "${title}." ${journal}, ${year}.`;
    } else if (style === 'IEEE') {
      citation = `${authors}, "${title}," ${journal}, ${year}.`;
    }

    navigator.clipboard.writeText(citation);
    toast.success(`${style} Citation copied!`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-poppins text-slate-400">Loading premium research portal...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6"
    >
      {/* Premium Back Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/app/research')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold font-poppins bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-xl border border-white/[0.06]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research Hub
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/research/${id}/audit`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 text-[11px] font-bold font-poppins transition-all"
          >
            <Activity className="w-3.5 h-3.5" /> Audit File
          </button>
          <button
            onClick={() => navigate(`/app/research/${id}/write`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 text-purple-400 text-[11px] font-bold font-poppins transition-all"
          >
            <PenLine className="w-3.5 h-3.5" /> Write Paper
          </button>
          <div className="flex items-center gap-2 ml-1">
            <BookOpen className="w-5 h-5 text-rose-400" />
            <span className="text-xs text-rose-400/80 font-bold uppercase tracking-wider font-poppins">Premium Scholar Workspace</span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Metadata, Status, Citations, Persistent Journal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Paper Metadata Glass Card */}
          <div className="rounded-2xl glass-card p-6 md:p-8 relative overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0c1425] via-[#090d16] to-[#05070a]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg font-poppins font-medium uppercase tracking-wider">
                Research Project
              </span>
              <span className="text-[10px] text-slate-400 bg-white/[0.06] px-2.5 py-1 rounded-lg font-poppins flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Start: {new Date(paper.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold font-outfit text-white leading-tight mb-4 group-hover:text-primary-glow transition-colors">
              {paper.title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-poppins font-medium">{paper.authors || userName}</p>
            <p className="text-slate-500 text-xs md:text-sm font-poppins mt-1">UniMind Labs · {new Date(paper.created_at).getFullYear()}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
              {/* Citations Indicator */}
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-poppins">Citations</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-extrabold text-emerald-400 font-poppins">{citations}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdateCitations(true)} className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors text-xs">+</button>
                    <button onClick={() => handleUpdateCitations(false)} className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors text-xs">-</button>
                  </div>
                </div>
              </div>

              {/* Status Segmented Control */}
              <div className="col-span-1 sm:col-span-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-poppins">Workspace status</span>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {['to_read', 'reading', 'writing', 'completed'].map((st) => (
                    <button 
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`text-[10px] font-bold font-poppins px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                        status === st 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Research Journal Notebook Card */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-poppins flex items-center gap-2">
                  <Award className="w-5 h-5 text-rose-400" /> Research Notes & Abstract Journal
                </h3>
                <p className="text-xs text-slate-400 font-poppins mt-0.5">Keep track of findings, references, or next steps</p>
              </div>
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Notebook
              </button>
            </div>

            <div className="relative">
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your research summary, paper critique, key points to verify, or thoughts here..."
                rows={12}
                className="w-full bg-black/30 border border-white/[0.06] rounded-xl p-4 text-[13px] text-slate-200 placeholder-slate-500 focus:border-rose-500/30 focus:shadow-[0_0_15px_rgba(244,63,94,0.05)] outline-none transition-all font-mono leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis, Citation Builder, Collaborators */}
        <div className="space-y-6">

          {/* Premium AI Co-Pilot Analytics Box */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-gradient-to-br from-[#0e0f19] to-[#080911] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" /> AI Research Co-Pilot
            </h3>
            <p className="text-[12px] text-slate-400 font-poppins leading-relaxed mb-4">
              Get an instant deep analysis of this project's potential impacts, limitations, and future steps.
            </p>

            {aiAnalysis ? (
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                  <h4 className="text-[10px] text-primary-glow font-bold uppercase tracking-wider font-poppins">Methodology Assess</h4>
                  <p className="text-[12px] text-slate-300 font-poppins mt-1 leading-normal">{aiAnalysis.methodology}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                  <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-poppins">Core Contributions</h4>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-[11.5px] text-slate-300 font-poppins leading-normal">
                    {aiAnalysis.contributions.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                  <h4 className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-poppins">Future Next Steps</h4>
                  <p className="text-[12px] text-slate-300 font-poppins mt-1 leading-normal">{aiAnalysis.nextSteps}</p>
                </div>
                <button 
                  onClick={() => setAiAnalysis(null)}
                  className="w-full text-center py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-slate-400 hover:text-slate-200 rounded-lg transition-colors font-poppins"
                >
                  Clear AI Insights
                </button>
              </div>
            ) : (
              <button 
                onClick={triggerAiAnalysis}
                disabled={aiGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-[12px] font-bold text-primary-glow transition-all"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Engaging Deep Analyzer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Insight Summary
                  </>
                )}
              </button>
            )}
          </div>

          {/* Interactive Collaborators widget */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
            <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Research Collaborators
            </h3>

            {/* Collaborators List */}
            <div className="space-y-2">
              {collaborators.length === 0 ? (
                <p className="text-slate-500 text-xs font-poppins py-2">No collaborators assigned to your projects yet.</p>
              ) : (
                collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-2.5 bg-black/25 border border-white/[0.04] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${collab.color} flex items-center justify-center font-bold text-xs text-white`}>
                        {collab.avatar}
                      </div>
                      <div>
                        <p className="text-[12.5px] font-semibold text-slate-200 font-poppins">{collab.name}</p>
                        <p className="text-[10px] text-slate-500 font-poppins mt-0.5">{collab.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCollaborator(collab.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Collaborator Form */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <input 
                type="text"
                placeholder="Collaborator Name..."
                value={newCollabName}
                onChange={(e) => setNewCollabName(e.target.value)}
                className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-200 focus:border-emerald-500/30 outline-none transition-all font-poppins"
              />
              <div className="flex gap-2">
                <select 
                  value={newCollabRole}
                  onChange={(e) => setNewCollabRole(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-slate-400 focus:border-emerald-500/30 outline-none transition-all font-poppins"
                >
                  <option value="Co-Author">Co-Author</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Principal Investigator">P.I.</option>
                  <option value="Advisor">Advisor</option>
                </select>
                <button 
                  onClick={handleAddCollaborator}
                  className="px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/20 rounded-xl text-emerald-400 hover:text-emerald-300 font-semibold transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Premium Citation Generator / Bibliography Card */}
          <div className="rounded-2xl glass-card p-6 border border-white/[0.06] bg-[#090d16] space-y-4">
            <h3 className="text-sm font-bold text-white font-poppins flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Bibliography Center
            </h3>
            
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
              {(['APA', 'MLA', 'IEEE'] as const).map((style) => (
                <button 
                  key={style}
                  onClick={() => setCitationOpenStyle(style)}
                  className={`text-[10px] font-bold font-poppins px-3 py-1 rounded-lg uppercase transition-all ${
                    citationOpenStyle === style 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 relative group/cite">
              <p className="text-[11.5px] text-slate-300 font-mono leading-relaxed pr-8">
                {citationOpenStyle === 'APA' && `${paper.authors || userName} (${new Date(paper.created_at).getFullYear()}). ${paper.title}. UniMind Research Library.`}
                {citationOpenStyle === 'MLA' && `${paper.authors || userName}. "${paper.title}." UniMind Research Library, ${new Date(paper.created_at).getFullYear()}.`}
                {citationOpenStyle === 'IEEE' && `[1] ${paper.authors || userName}, "${paper.title}," UniMind Research Library, ${new Date(paper.created_at).getFullYear()}.`}
              </p>
              <button 
                onClick={() => handleCopyCitation(citationOpenStyle)}
                className="absolute right-2 top-2 p-1.5 bg-white/[0.03] hover:bg-white/[0.1] text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 🧪 Premium Advanced Research Tools Row (Coming Soon) */}
      <div className="pt-6 border-t border-white/[0.06] space-y-4">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white font-poppins">🧪 Advanced Research Laboratory Tools (Beta)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "AI Peer Review Simulator",
              desc: "Simulate a rigorous double-blind peer review before submission. Receives suggestions on strength of claims, code reproduction metrics, and structural improvements.",
              gradient: "from-indigo-500/10 to-purple-500/10",
              border: "border-indigo-500/20"
            },
            {
              title: "LaTeX Collaborative Workspace",
              desc: "Write papers in LaTeX simultaneously with co-authors. Includes automatic equation renderers, PDF compilation previews, and real-time cursor sync on the edge.",
              gradient: "from-rose-500/10 to-pink-500/10",
              border: "border-rose-500/20"
            },
            {
              title: "Grant Funding Matcher",
              desc: "AI-scans your research abstract and automatically matches your project to thousands of active government, institutional, or private venture capital research grants.",
              gradient: "from-emerald-500/10 to-teal-500/10",
              border: "border-emerald-500/20"
            },
            {
              title: "Bibliography Auto-Publisher",
              desc: "Automate citation formatting into over 4,000 journal-specific bibliography styles and export directly to EndNote, BibTeX, or Zotero libraries in one-click.",
              gradient: "from-amber-500/10 to-orange-500/10",
              border: "border-amber-500/20"
            }
          ].map((tool, idx) => (
            <div key={idx} className={`rounded-2xl bg-gradient-to-br ${tool.gradient} border ${tool.border} p-5 relative overflow-hidden group`}>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary/20 text-primary-glow font-bold text-[9px] uppercase tracking-wider font-poppins animate-pulse">
                Coming Soon
              </div>
              <h4 className="text-[13px] font-bold text-slate-200 font-poppins group-hover:text-white transition-colors">{tool.title}</h4>
              <p className="text-[11.5px] text-slate-400 font-poppins mt-2 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
