import { motion } from 'framer-motion';
import { Plus, TerminalSquare, Code2, PlayCircle, Users, FolderGit2 } from 'lucide-react';

export const CodeSpacesTab = () => {
  return (
    <motion.div
      key="code-spaces-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] md:text-base font-bold text-white font-poppins flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" /> Collaborative Code Spaces
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 font-poppins mt-0.5">Shared environments for pair programming</p>
        </div>
        <button className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-all">
          <Plus className="w-4 h-4" /> New Sandbox
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Mock Code Space 1 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center hover:border-emerald-500/30 transition-colors cursor-pointer group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins group-hover:text-emerald-400 transition-colors">Data Structures Project 1</h4>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">Python</span>
            </div>
            <p className="text-[11px] text-slate-400 font-poppins mb-2 line-clamp-2">Implementing Graph traversal algorithms (BFS/DFS). Needs help with memory optimization.</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-poppins">
              <span className="flex items-center gap-1"><FolderGit2 className="w-3 h-3" /> Updated 2h ago</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 3 editors</span>
            </div>
          </div>
          <button className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-white/5 hover:bg-emerald-500 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center gap-2">
            <PlayCircle className="w-4 h-4" /> Open IDE
          </button>
        </div>

        {/* Mock Code Space 2 */}
        <div className="rounded-2xl glass-card p-4 md:p-5 border border-white/[0.06] bg-[#090d16] flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center hover:border-blue-500/30 transition-colors cursor-pointer group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <TerminalSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-[13px] md:text-sm font-bold text-white font-poppins group-hover:text-blue-400 transition-colors">Machine Learning Model Tuning</h4>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded font-mono">Jupyter</span>
            </div>
            <p className="text-[11px] text-slate-400 font-poppins mb-2 line-clamp-2">Fine-tuning hyperparameters for the vision model. Compute is shared.</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-poppins">
              <span className="flex items-center gap-1"><FolderGit2 className="w-3 h-3" /> Updated 5m ago</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1 editor</span>
            </div>
          </div>
          <button className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-white/5 hover:bg-blue-500 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-poppins transition-colors flex items-center justify-center gap-2">
            <PlayCircle className="w-4 h-4" /> Open IDE
          </button>
        </div>
      </div>
    </motion.div>
  );
};
