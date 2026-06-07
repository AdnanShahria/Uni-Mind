import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, Sparkles, Loader2, Copy, ChevronDown, Activity, PenLine } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const ResearchPapersList = ({ displayPapers }: { displayPapers: any[] }) => {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [citationOpenId, setCitationOpenId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Reading' | 'Writing' | 'Completed'>('All');

  const filteredPapers = displayPapers.filter(paper => {
    if (activeFilter === 'All') return true;
    return paper.status?.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleSummarize = async (paper: any) => {
    if (summaries[paper.id]) {
      // Toggle off if already summarized
      const newSummaries = { ...summaries };
      delete newSummaries[paper.id];
      setSummaries(newSummaries);
      return;
    }

    if (!paper.abstract) {
      toast.error('No abstract available to summarize.');
      return;
    }

    setSummarizingId(paper.id);
    try {
      if (!GROQ_API_KEY) throw new Error('No Groq API Key');

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert research assistant. Read the following paper abstract and provide a concise, 3-bullet-point summary of the core findings or contributions. Keep it very short and easy to read.' },
            { role: 'user', content: `Title: ${paper.title}\n\nAbstract: ${paper.abstract}` }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const summary = data.choices[0].message.content;
      setSummaries(prev => ({ ...prev, [paper.id]: summary }));
    } catch (error) {
      console.error(error);
      // Fallback if no API key
      setTimeout(() => {
        setSummaries(prev => ({ 
          ...prev, 
          [paper.id]: "• Key finding 1 is simulated.\n• Key finding 2 is also simulated.\n• Groq API key is missing."
        }));
        setSummarizingId(null);
      }, 1000);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleCopyCitation = (paper: any, style: 'APA' | 'MLA' | 'IEEE') => {
    let citation = '';
    const authors = paper.authors;
    const year = paper.year;
    const title = paper.title;
    const journal = paper.journal || 'arXiv Preprint';

    if (style === 'APA') {
      citation = `${authors} (${year}). ${title}. ${journal}.`;
    } else if (style === 'MLA') {
      citation = `${authors}. "${title}." ${journal}, ${year}.`;
    } else if (style === 'IEEE') {
      citation = `${authors}, "${title}," ${journal}, ${year}.`;
    }

    navigator.clipboard.writeText(citation);
    toast.success(`${style} Citation copied!`);
    setCitationOpenId(null);
  };

  return (
    <div className="lg:col-span-2 rounded-2xl glass-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          My Library
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Reading', 'Writing', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`text-[11px] font-poppins px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === f ? 'bg-primary/10 text-primary-glow font-semibold' : 'text-slate-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filteredPapers.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-500 text-sm font-poppins">No papers yet. Search and save papers!</div>
        ) : (
          filteredPapers.map((paper, i) => (
            <motion.div
              key={paper.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-5 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/app/research/${paper.id}`} 
                    className="text-[14px] font-semibold text-slate-200 font-poppins hover:text-primary-glow group-hover:text-white transition-colors block cursor-pointer"
                  >
                    {paper.title}
                  </Link>
                  <p className="text-[12px] text-slate-400 font-poppins mt-1.5">{paper.authors}</p>
                  <p className="text-[11px] text-slate-500 font-poppins mt-0.5">{paper.journal} · {paper.year}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`text-[10px] font-bold font-poppins px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      paper.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      paper.status === 'reading' ? 'bg-blue-500/10 text-blue-400' :
                      paper.status === 'writing' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {paper.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-poppins flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> {paper.citations} citations
                    </span>
                    
                    <button 
                      onClick={() => handleSummarize(paper)}
                      disabled={summarizingId === paper.id}
                      className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        summaries[paper.id] 
                          ? 'bg-primary/20 text-primary-glow border border-primary/30' 
                          : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
                      }`}
                    >
                      {summarizingId === paper.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {summaries[paper.id] ? 'Hide Summary' : 'AI Summarize'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {summaries[paper.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 relative">
                          <Sparkles className="absolute top-4 right-4 w-4 h-4 text-primary/40" />
                          <h4 className="text-[11px] font-semibold text-primary-glow font-poppins uppercase tracking-wider mb-2">AI Summary</h4>
                          <div className="text-[12.5px] text-slate-300 font-poppins leading-relaxed whitespace-pre-wrap">
                            {summaries[paper.id]}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Quick access: Audit + Write */}
                  <div className="flex gap-1.5 mb-1">
                    <Link
                      to={`/app/research/${paper.id}/audit`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-poppins transition-all"
                      title="Open Audit File"
                    >
                      <Activity style={{ width: 11, height: 11 }} /> Audit
                    </Link>
                    <Link
                      to={`/app/research/${paper.id}/write`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-[10px] font-bold font-poppins transition-all"
                      title="Open Writing Studio"
                    >
                      <PenLine style={{ width: 11, height: 11 }} /> Write
                    </Link>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setCitationOpenId(citationOpenId === paper.id ? null : paper.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors text-[11px] font-semibold font-poppins"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Cite
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <AnimatePresence>
                      {citationOpenId === paper.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-32 bg-[#0a0f1c] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-10"
                        >
                          {['APA', 'MLA', 'IEEE'].map((style) => (
                            <button
                              key={style}
                              onClick={() => handleCopyCitation(paper, style as any)}
                              className="w-full text-left px-4 py-2 text-[12px] text-slate-300 font-poppins hover:bg-primary/20 hover:text-primary-glow transition-colors"
                            >
                              {style} Format
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
