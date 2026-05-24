import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { fadeIn } from './data';

interface NotesFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterActive: boolean;
  setFilterActive: (val: boolean) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (val: 'list' | 'grid') => void;
}

export const NotesFilter = ({
  searchQuery,
  setSearchQuery,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
}: NotesFilterProps) => {
  return (
    <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
      <div className="flex-1 max-w-md flex items-center gap-2.5 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-white/[0.06]">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins"
        />
      </div>
      <button 
        onClick={() => setFilterActive(!filterActive)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${filterActive ? 'bg-primary/10 border-primary/20 text-primary-glow border' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-slate-400 hover:text-white'}`}
      >
        <Filter className="w-4 h-4" />
      </button>
      <button 
        onClick={() => setViewMode('grid')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-primary/10 border-primary/20 text-primary-glow border' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-slate-400 hover:text-white'}`}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button 
        onClick={() => setViewMode('list')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-primary/10 border-primary/20 text-primary-glow border' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-slate-400 hover:text-white'}`}
      >
        <List className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
