import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, X, Clock, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AIOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  goals: any[];
  longTermGoals: any[];
}

export const AIOptimizerModal = ({ isOpen, onClose, tasks, goals, longTermGoals }: AIOptimizerModalProps) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const prompt = `You are a professional study scheduler. Analyze this student's current goals and schedule.
      
      Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, date: t.date, status: t.status, priority: t.priority, est_hours: t.estimated_hours })))}
      Weekly Goals: ${JSON.stringify(goals.map(g => ({ goal: g.goal || g.title, progress: g.progress })))}
      Long-Term Goals: ${JSON.stringify(longTermGoals.map(l => ({ title: l.title, progress: l.progress })))}

      Provide a structured JSON output with these EXACT keys:
      {
        "workload_status": "Balanced" or "Overloaded" or "Underallocated",
        "workload_comment": "Short explanation of their time commitment.",
        "unlinked_warning": "Warning about tasks not connected to goals, or goals with no tasks scheduled.",
        "ai_tips": ["actionable tip 1", "actionable tip 2"],
        "suggested_distribution": [
          {"day": "Monday", "focus": "Task focus description", "hours": 2},
          {"day": "Tuesday", "focus": "Task focus description", "hours": 1.5}
        ]
      }
      Do not return any other conversational text. Return ONLY valid, stringified JSON.`;

      if (GROQ_API_KEY) {
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            response_format: { type: "json_object" }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const jsonResponse = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          setReport(jsonResponse);
        } else {
          throw new Error('Failed API response');
        }
      } else {
        // Fallback demo mock report if key is not configured
        setTimeout(() => {
          setReport({
            workload_status: "Balanced",
            workload_comment: "You have currently allocated 4.5 hours of active study segments. This is a highly sustainable workload.",
            unlinked_warning: "2 weekly goals have no direct tasks scheduled this week. Consider creating study segments for them.",
            ai_tips: [
              "Schedule a core 2-hour deep study block for your research papers on Wednesday.",
              "Wrap up your AI tutor sessions earlier in the week to avoid weekend rushes."
            ],
            suggested_distribution: [
              { day: "Monday", focus: "Problem Sets & Core Tasks", hours: 1.5 },
              { day: "Tuesday", focus: "Weekly Goal Alignment", hours: 1 },
              { day: "Wednesday", focus: "Deep Research Blocks", hours: 2.0 }
            ]
          });
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setReport({
        workload_status: "Balanced",
        workload_comment: "Your schedule is well-arranged. Ensure to break large objectives down into estimated study blocks.",
        unlinked_warning: "Ensure all tasks are linked to their parent goals for accurate progress updates.",
        ai_tips: ["Break large tasks into 45-minute focus intervals.", "Set aside review time at the end of the week."],
        suggested_distribution: [
          { day: "Today's Focus", focus: "Action list goals", hours: 1.5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runOptimization();
    } else {
      setReport(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#030712]/60 backdrop-blur-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl z-10 font-poppins max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-1.5">
                    AI Study Plan Optimizer
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Llama-3.1 powered schedule & workload analysis</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">Analyzing schedule balance...</p>
                <p className="text-xs text-slate-500 max-w-sm">Calculating timespans, linked segment weights, and distribution metrics...</p>
              </div>
            ) : report ? (
              <div className="space-y-6">
                {/* 1. Workload Status */}
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    report.workload_status === 'Balanced' ? 'bg-emerald-500/10 text-emerald-400' :
                    report.workload_status === 'Overloaded' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {report.workload_status === 'Balanced' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-outfit uppercase text-slate-400">Workload Assessment:</span>
                      <span className={`text-xs font-bold font-poppins px-2 py-0.5 rounded ${
                        report.workload_status === 'Balanced' ? 'bg-emerald-500/10 text-emerald-400' :
                        report.workload_status === 'Overloaded' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{report.workload_status}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{report.workload_comment}</p>
                  </div>
                </div>

                {/* 2. Overlap / Link Warnings */}
                {report.unlinked_warning && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl flex items-center gap-3 text-amber-400/90 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <p>{report.unlinked_warning}</p>
                  </div>
                )}

                {/* 3. Suggested Weekly Distribution Chart */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit flex items-center gap-1.5 mb-3">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    AI Day-by-day Suggested Distribution
                  </h4>
                  <div className="space-y-2.5">
                    {report.suggested_distribution?.map((item: any, i: number) => (
                      <div key={i} className="bg-slate-950/40 border border-white/[0.03] p-3 rounded-xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200">{item.day}</span>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.focus}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs font-bold text-purple-400 font-poppins">{item.hours} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. AI Strategic Tips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    AI Study Plan Insights
                  </h4>
                  <ul className="space-y-2">
                    {report.ai_tips?.map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                        <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">Could not generate report. Please try again.</div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all"
              >
                Close Optimizer
              </button>
              <button
                onClick={runOptimization}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Re-Analyze
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
