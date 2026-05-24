import { FileText, TrendingUp, Star } from 'lucide-react';

export const ResearchStats = () => {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-4">Your Impact</h3>
      <div className="space-y-4">
        {[
          { label: 'Papers Published', value: '3', icon: FileText, color: 'text-rose-400' },
          { label: 'Total Citations', value: '477', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'h-index', value: '4', icon: Star, color: 'text-amber-400' },
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
