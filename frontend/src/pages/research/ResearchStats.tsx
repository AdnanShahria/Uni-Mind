import { FileText, TrendingUp, Star } from 'lucide-react';

export const ResearchStats = ({ papers = [] }: { papers?: any[] }) => {
  const papersPublished = papers.filter(p => p.status === 'completed').length;
  const totalCitations = papers.reduce((sum, p) => sum + (p.citations || 0), 0);
  
  const citationsArray = papers.map(p => p.citations || 0).sort((a, b) => b - a);
  let hIndex = 0;
  for (let i = 0; i < citationsArray.length; i++) {
    if (citationsArray[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  return (
    <div className="rounded-2xl glass-card p-5">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-4">Your Impact</h3>
      <div className="space-y-4">
        {[
          { label: 'Papers Published', value: papersPublished.toString(), icon: FileText, color: 'text-rose-400' },
          { label: 'Total Citations', value: totalCitations.toString(), icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'h-index', value: hIndex.toString(), icon: Star, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-poppins flex items-center gap-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              {stat.label}
            </span>
            <span className="text-sm font-bold text-white font-outfit">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
