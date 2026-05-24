import { motion } from 'framer-motion';
import { FileText, TrendingUp, Bookmark, ExternalLink } from 'lucide-react';

export const ResearchPapersList = ({ displayPapers }: { displayPapers: any[] }) => {
  return (
    <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white font-poppins flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          Research Papers
        </h3>
        <div className="flex items-center gap-2">
          {['All', 'Reading', 'Writing', 'Completed'].map((f) => (
            <button key={f} className={`text-[11px] font-poppins px-3 py-1 rounded-lg transition-colors ${
              f === 'All' ? 'bg-primary/10 text-primary-glow font-semibold' : 'text-slate-500 hover:text-white'
            }`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {displayPapers.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm font-poppins">No papers yet.</div>
        ) : (
          displayPapers.map((paper, i) => (
            <motion.div
              key={paper.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 font-poppins group-hover:text-white transition-colors">
                    {paper.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-poppins mt-1">{paper.authors} · {paper.journal} · {paper.year}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-medium font-poppins px-2 py-0.5 rounded-md ${
                      paper.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      paper.status === 'reading' ? 'bg-blue-500/10 text-blue-400' :
                      paper.status === 'writing' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-poppins flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {paper.citations} citations
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="w-7 h-7 rounded-lg hover:bg-amber-500/10 flex items-center justify-center text-slate-600 hover:text-amber-400 transition-colors">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-slate-600 hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
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
