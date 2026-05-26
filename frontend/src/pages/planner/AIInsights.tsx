import { Brain, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const AIInsights = ({ tasks, goals }: { tasks: any[], goals: any[] }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!tasks || tasks.length === 0) {
        setInsight("You have no tasks scheduled for this day. Add some tasks to get AI-powered study insights.");
        return;
      }
      setLoading(true);
      try {
        const prompt = `You are an AI study assistant. Given the following tasks and goals, provide a short (2 sentence) actionable insight or productivity tip. Use a friendly tone.
        Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })))}
        Goals: ${JSON.stringify(goals.map(g => ({ goal: g.goal, progress: g.progress })))}`;

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
              temperature: 0.7,
              max_tokens: 150
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            setInsight(data.choices?.[0]?.message?.content || "Keep up the good work!");
          } else {
            setInsight("Keep up the good work and stay focused on your goals!");
          }
        } else {
           setInsight("Keep up the good work! Add your Groq API key to get personalized insights.");
        }
      } catch (e) {
        setInsight("Keep up the good work and stay focused on your goals!");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchInsight, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [tasks, goals]);

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
        ) : (
          <p>{insight}</p>
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
