import { Brain, ChevronRight } from 'lucide-react';

export const AIInsights = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500/[0.06] to-primary/[0.06] border border-purple-500/[0.12] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold text-white font-poppins">AI Study Insight</span>
      </div>
      <p className="text-[12px] text-slate-300 font-poppins leading-relaxed">
        Based on your study patterns, you're most productive between <span className="text-white font-medium">9-11 AM</span>. I recommend scheduling your hardest tasks during this window.
      </p>
      <button className="mt-3 text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins flex items-center gap-1 transition-colors">
        Optimize Schedule <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
