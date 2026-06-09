import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Code, FileQuestion, Brain, FlaskConical, Calculator, ScrollText } from 'lucide-react';

const iconMap: Record<string, any> = {
  BookOpen,
  Lightbulb,
  Code,
  FileQuestion,
  Brain,
  FlaskConical,
  Calculator,
  ScrollText,
};

// Fallback prompts shown when DB has no prompts
const DEFAULT_PROMPTS = [
  {
    id: 'p1',
    label: 'Explain a concept',
    prompt: 'Explain to me highly cooperatively about ...',
    icon: 'BookOpen',
    color: 'text-blue-400',
  },
  {
    id: 'p2',
    label: 'Create flashcards',
    prompt: 'Create flashcards for the key topics in ...',
    icon: 'Brain',
    color: 'text-purple-400',
  },
  {
    id: 'p3',
    label: 'Solve a problem',
    prompt: 'How do I solve ... step by step?',
    icon: 'Calculator',
    color: 'text-emerald-400',
  },
  {
    id: 'p4',
    label: 'Summarize notes',
    prompt: 'Summarize the key points of ...',
    icon: 'ScrollText',
    color: 'text-amber-400',
  },
  {
    id: 'p5',
    label: 'Quiz me',
    prompt: 'Quiz me on ... with 5 practice questions',
    icon: 'FileQuestion',
    color: 'text-rose-400',
  },
  {
    id: 'p6',
    label: 'Explain with code',
    prompt: 'Explain ... with a code example and complexity analysis',
    icon: 'Code',
    color: 'text-cyan-400',
  },
  {
    id: 'p7',
    label: 'Brainstorm ideas',
    prompt: 'Help me brainstorm 10 creative ideas for ...',
    icon: 'Lightbulb',
    color: 'text-yellow-400',
  },
  {
    id: 'p8',
    label: 'Review my writing',
    prompt: 'Please review and improve this text for clarity and tone: ...',
    icon: 'FileText',
    color: 'text-indigo-400',
  },
  {
    id: 'p9',
    label: 'Simplify text',
    prompt: 'Rewrite the following text so a 10-year-old could understand it: ...',
    icon: 'BookOpen',
    color: 'text-pink-400',
  },
  {
    id: 'p10',
    label: 'Debate a topic',
    prompt: 'Act as a devil\'s advocate and debate me on the topic of ...',
    icon: 'Brain',
    color: 'text-red-400',
  },
];

export const SuggestedPrompts = ({
  prompts,
  handlePromptClick
}: {
  prompts: any[];
  handlePromptClick: (prompt: string) => void;
}) => {
  const displayPrompts = prompts.length > 0 ? prompts : DEFAULT_PROMPTS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6"
    >
      <p className="text-[11px] text-slate-500 font-poppins uppercase tracking-wider font-semibold mb-3 text-center">
        Try asking...
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {displayPrompts.map((item, i) => {
          const Icon = iconMap[item.icon] || BookOpen;
          return (
            <motion.button
              key={item.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              onClick={() => handlePromptClick(item.prompt)}
              className={`items-center gap-2 md:gap-3 p-2.5 md:p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.06] transition-all text-left group hover:scale-[1.02] active:scale-[0.98] ${
                i >= 4 ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.10] transition-colors">
                <Icon className={`w-4 h-4 md:w-[18px] md:h-[18px] ${item.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs font-semibold text-slate-200 font-poppins group-hover:text-white transition-colors truncate">{item.label}</p>
                <p className="hidden md:block text-[10px] text-slate-500 font-poppins mt-0.5 truncate">{item.prompt}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
