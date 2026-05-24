import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { FolderType } from './types';
import { fadeIn } from './data';

interface FolderGridProps {
  folders: FolderType[];
  selectedFolder: string | null;
  toggleFolder: (name: string) => void;
  clearFolder: () => void;
}

export const FolderGrid = ({ folders, selectedFolder, toggleFolder, clearFolder }: FolderGridProps) => {
  return (
    <motion.div variants={fadeIn} className="mb-8">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins mb-3 px-1 flex justify-between items-center">
        <span>Folders {selectedFolder && <span className="text-primary normal-case font-normal ml-2 tracking-normal">- Filtered by: {selectedFolder}</span>}</span>
        {selectedFolder && (
          <button onClick={clearFolder} className="text-[10px] text-slate-400 hover:text-white normal-case tracking-normal">
            Clear Filter
          </button>
        )}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {folders.map((folder, i) => (
          <motion.div
            key={i}
            onClick={() => toggleFolder(folder.name)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -2 }}
            className={`p-4 rounded-2xl bg-gradient-to-br ${folder.color} border cursor-pointer group transition-all
              ${selectedFolder === folder.name ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#0B0F19] border-primary/50' : folder.borderColor}
            `}
          >
            <FolderOpen className={`w-8 h-8 transition-colors mb-3 ${selectedFolder === folder.name ? 'text-white' : 'text-white/30 group-hover:text-white/50'}`} />
            <p className="text-sm font-semibold text-white font-poppins">{folder.name}</p>
            <p className="text-[11px] text-slate-400 font-poppins mt-0.5">{folder.count} notes</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
