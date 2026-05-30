import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ExternalLink, Plus } from 'lucide-react';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';

export const PaperSearch = ({ userId }: { userId: string | null }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`);
      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = Array.from(xmlDoc.getElementsByTagName('entry'));
      
      const parsedResults = entries.map(entry => {
        const idNode = entry.getElementsByTagName('id')[0];
        const titleNode = entry.getElementsByTagName('title')[0];
        const summaryNode = entry.getElementsByTagName('summary')[0];
        const publishedNode = entry.getElementsByTagName('published')[0];
        const authorNodes = Array.from(entry.getElementsByTagName('author'));
        
        const authors = authorNodes.map(a => a.getElementsByTagName('name')[0]?.textContent).join(', ');
        
        return {
          id: idNode?.textContent || Math.random().toString(),
          title: titleNode?.textContent?.replace(/\n/g, ' ').trim() || 'Untitled',
          abstract: summaryNode?.textContent?.trim() || 'No abstract available.',
          authors: authors || 'Unknown Authors',
          year: publishedNode?.textContent?.substring(0, 4) || new Date().getFullYear().toString(),
          link: idNode?.textContent || '#',
        };
      });
      setResults(parsedResults);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search arXiv');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (paper: any) => {
    if (!userId) {
      toast.error('You must be logged in to save papers');
      return;
    }
    setSavingId(paper.id);
    try {
      await turso.from('research_papers').insert([{
        user_id: userId,
        title: paper.title,
        authors: paper.authors,
        journal: 'arXiv',
        year: paper.year,
        citations: 0,
        status: 'reading',
        abstract: paper.abstract
      }]);
      toast.success('Paper saved to your library!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save paper');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="lg:col-span-2 rounded-2xl glass-card overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search arXiv for papers (e.g. 'Machine Learning')..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-[13px] text-slate-200 placeholder-slate-500 focus:border-primary/30 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] outline-none transition-all font-poppins"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[12px] font-poppins">Searching arXiv...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-500 text-[13px] font-poppins">
            Enter a query to search over 2 million academic papers.
          </div>
        ) : (
          results.map((paper, i) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a href={paper.link} target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-slate-200 font-poppins hover:text-primary-glow transition-colors flex items-center gap-2">
                    {paper.title}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                  <p className="text-[12px] text-emerald-400/80 font-poppins mt-1.5">{paper.authors}</p>
                  <p className="text-[11px] text-slate-500 font-poppins mt-1">arXiv · {paper.year}</p>
                  
                  <div className="mt-3 bg-black/20 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[12px] text-slate-400 font-poppins leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 mt-1">
                  <button
                    onClick={() => handleSave(paper)}
                    disabled={savingId === paper.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-[11px] font-semibold text-primary-glow transition-all"
                  >
                    {savingId === paper.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
