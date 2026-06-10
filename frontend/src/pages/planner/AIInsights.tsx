import { Brain, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../utils/aiClient';

export const AIInsights = ({ tasks, goals }: { tasks: any[], goals: any[] }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateInsight = async () => {
    if (!tasks || tasks.length === 0) {
      setInsight("You have no tasks scheduled for this day. Add some tasks to get AI-powered study insights.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are an AI study assistant. Given the following tasks and goals, provide a short (2 sentence) actionable insight or productivity tip. Use a friendly tone.
      Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })))}
      Goals: ${JSON.stringify(goals.map(g => ({ goal: g.goal, progress: g.progress })))}`;

      if (AGENT_ROUTER_API_KEY || GROQ_API_KEY) {
        const insightContent = await callAI(
          [{ role: 'user', content: prompt }],
          {
            groqModel: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 150
          }
        );
        setInsight(insightContent || "Keep up the good work!");
      } else {
         setInsight("Keep up the good work! Add your API keys to get personalized insights.");
      }
    } catch (e) {
      setInsight("Keep up the good work and stay focused on your goals!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500/[0.06] to-primary/[0.06] border border-purple-500/[0.12] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold text-white font-poppins">AI Study Insight</span>
      </div>
      <div className="text-[12px] text-slate-300 font-poppins leading-relaxed min-h-[40px]">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating insight...
          </div>
        ) : insight ? (
          <p>{insight}</p>
        ) : (
          <button 
            onClick={generateInsight}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors text-xs font-medium"
          >
            Generate Insight
          </button>
        )}
      </div>
      {!loading && tasks?.length > 0 && (
        <button className="mt-3 text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins flex items-center gap-1 transition-colors">
          Optimize Schedule <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
