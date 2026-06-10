import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { FolderType } from './types';
import { fadeIn } from './data';

interface FolderGridProps {
  folders: FolderType[];
  onFolderClick: (folderId: string) => void;
}

export const FolderGrid = ({ folders, onFolderClick }: FolderGridProps) => {
  return (
    <motion.div variants={fadeIn} className="mb-8">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-3 px-1 flex justify-between items-center">
        <span>Folders</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {folders.map((folder, i) => (
          <motion.button
            key={folder.name}
            onClick={() => onFolderClick(folder.id)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className={`
              relative overflow-hidden text-left
              px-4 sm:px-5 py-4 rounded-2xl border transition-all duration-300
              group flex flex-col sm:flex-row items-start gap-3 sm:gap-4 hover:-translate-y-1
              bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]
            `}
          >
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${folder.color} border ${folder.borderColor} shrink-0`}>
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[13px] sm:text-sm font-semibold text-white font-poppins truncate">{folder.name}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-poppins mt-0.5 truncate">{folder.count} items</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
