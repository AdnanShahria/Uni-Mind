import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Code, FileQuestion } from 'lucide-react';

const iconMap: Record<string, any> = {
  BookOpen,
  Lightbulb,
  Code,
  FileQuestion
};

export const SuggestedPrompts = ({
  prompts,
  handlePromptClick
}: {
  prompts: any[];
  handlePromptClick: (prompt: string) => void;
}) => {
  if (prompts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8"
    >
      {prompts.map((item, i) => {
        const Icon = iconMap[item.icon] || BookOpen;
        return (
          <motion.button
            key={item.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            onClick={() => handlePromptClick(item.prompt)}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.06] transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
              <Icon className={`w-4.5 h-4.5 ${item.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 font-poppins group-hover:text-white">{item.label}</p>
              <p className="text-[10px] text-slate-500 font-poppins mt-0.5">{item.prompt}</p>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
