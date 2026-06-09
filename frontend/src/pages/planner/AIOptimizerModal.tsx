import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, X, AlertTriangle, ShieldCheck, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../utils/aiClient';

export interface ProposedTask {
  title: string;
  date: string; // ISO format
  estimated_hours: number;
  weekly_goal_id?: string;
  long_term_goal_id?: string;
}

interface AIOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  goals: any[];
  longTermGoals: any[];
  onApplySchedule: (newTasks: ProposedTask[]) => Promise<void>;
}

export const AIOptimizerModal = ({ isOpen, onClose, tasks, goals, longTermGoals, onApplySchedule }: AIOptimizerModalProps) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const prompt = `You are a professional study scheduler. Analyze this student's current goals and schedule.
      Today's Date: ${today}
      
      Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, date: t.date, status: t.status, priority: t.priority, est_hours: t.estimated_hours })))}
      Weekly Goals: ${JSON.stringify(goals.map(g => ({ id: g.id, goal: g.goal || g.title, progress: g.progress })))}
      Long-Term Goals: ${JSON.stringify(longTermGoals.map(l => ({ id: l.id, title: l.title, progress: l.progress })))}

      Provide a structured JSON output with these EXACT keys:
      {
        "workload_status": "Balanced" or "Overloaded" or "Underallocated",
        "workload_comment": "Short explanation of their time commitment.",
        "unlinked_warning": "Warning about tasks not connected to goals, or goals with no tasks scheduled.",
        "ai_tips": ["actionable tip 1", "actionable tip 2"],
        "suggested_distribution": [
          {"day": "Monday", "focus": "Task focus description", "hours": 2}
        ],
        "suggested_tasks": [
          {
            "title": "Clear actionable task title",
            "date": "YYYY-MM-DDTHH:MM:SSZ", // Must be within the next 7 days from Today
            "estimated_hours": 1.5,
            "weekly_goal_id": "the goal ID if it helps achieve a weekly goal (optional)",
            "long_term_goal_id": "the goal ID if it helps achieve a long term goal (optional)"
          }
        ]
      }
      Do not return any other conversational text. Return ONLY valid, stringified JSON. Ensure suggested_tasks is an array.`;

      if (AGENT_ROUTER_API_KEY || GROQ_API_KEY) {
        const responseContent = await callAI(
          [{ role: 'user', content: prompt }],
          {
            groqModel: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            responseFormat: { type: "json_object" }
          }
        );
        const jsonResponse = JSON.parse(responseContent || '{}');
        setReport(jsonResponse);
      } else {
        // Fallback demo mock report if key is not configured
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
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
            ],
            suggested_tasks: [
              { title: "Complete CS assignment draft", date: tomorrow.toISOString(), estimated_hours: 2 },
              { title: "Review Math Chapter 5", date: tomorrow.toISOString(), estimated_hours: 1.5 }
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
        ],
        suggested_tasks: []
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleApply = async () => {
    if (!report?.suggested_tasks || report.suggested_tasks.length === 0) {
      toast.error('No tasks to apply.');
      return;
    }
    setIsApplying(true);
    try {
      await onApplySchedule(report.suggested_tasks);
      toast.success('AI Schedule applied!');
      onClose();
    } catch (error) {
      toast.error('Failed to apply schedule.');
    } finally {
      setIsApplying(false);
    }
  };

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
            className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl z-10 font-poppins max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-1.5">
                    AI Auto-Scheduler
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Generates optimized tasks based on your goals</p>
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
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-200">Generating optimal schedule...</p>
                  <p className="text-xs text-slate-500 max-w-sm">Calculating goal requirements and finding time gaps...</p>
                </div>
              ) : report ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Workload Status */}
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        report.workload_status === 'Balanced' ? 'bg-emerald-500/10 text-emerald-400' :
                        report.workload_status === 'Overloaded' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {report.workload_status === 'Balanced' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-outfit uppercase text-slate-400">Workload: <span className={
                          report.workload_status === 'Balanced' ? 'text-emerald-400' :
                          report.workload_status === 'Overloaded' ? 'text-rose-400' : 'text-amber-400'
                        }>{report.workload_status}</span></div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.workload_comment}</p>
                      </div>
                    </div>

                    {/* AI Tips */}
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-outfit mb-2">Strategy Tips</h4>
                      <ul className="space-y-1.5">
                        {report.ai_tips?.slice(0, 2).map((tip: string, i: number) => (
                          <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-orange-400 shrink-0 mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Generated Tasks List */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3 font-outfit">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      Proposed AI Schedule
                    </h4>
                    {report.suggested_tasks && report.suggested_tasks.length > 0 ? (
                      <div className="space-y-2">
                        {report.suggested_tasks.map((task: any, idx: number) => {
                          const dateObj = new Date(task.date);
                          const isToday = dateObj.toDateString() === new Date().toDateString();
                          return (
                            <div key={idx} className="bg-slate-950/50 border border-white/[0.05] p-3 rounded-xl flex items-center justify-between gap-4">
                              <div>
                                <h5 className="text-sm font-semibold text-white">{task.title}</h5>
                                <div className="flex items-center gap-3 mt-1 text-[11px] font-poppins">
                                  <span className={isToday ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                                    {isToday ? 'Today' : dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-400">{task.estimated_hours} hrs est.</span>
                                </div>
                              </div>
                              {task.weekly_goal_id || task.long_term_goal_id ? (
                                <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md shrink-0 font-semibold border border-purple-500/20">
                                  Goal Linked
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                        No new tasks suggested at this time. You're on track!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">Could not generate schedule. Please try again.</div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center border-t border-white/[0.06] pt-4 mt-2 shrink-0">
              <button
                onClick={runOptimization}
                disabled={loading}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-transparent hover:bg-white/[0.08] rounded-xl transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Regenerate
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={loading || isApplying || !report?.suggested_tasks?.length}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {isApplying ? 'Applying...' : 'Apply AI Schedule'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

