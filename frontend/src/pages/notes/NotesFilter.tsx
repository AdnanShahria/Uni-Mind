import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3X3, List, ArrowDownUp, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { fadeIn } from './data';

interface NotesFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterActive: boolean;
  setFilterActive: (val: boolean) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (val: 'list' | 'grid') => void;
  sortBy?: 'date' | 'name' | 'pages';
  setSortBy?: (val: 'date' | 'name' | 'pages') => void;
}

export const NotesFilter = ({
  searchQuery,
  setSearchQuery,
  filterActive,
  setFilterActive,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
}: NotesFilterProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <motion.div variants={fadeIn} className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-white/[0.06] shadow-inner">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none font-poppins"
          />
        </div>
        
        {/* Sort Dropdown */}
        {setSortBy && sortBy && (
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`h-9 px-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 active:scale-95 ${isSortOpen ? 'bg-primary/15 text-primary-glow border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}
              title="Sort Notes"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline font-poppins">
                {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'}
              </span>
            </button>
            
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                >
                  {[
                    { id: 'date', label: 'Last Modified' },
                    { id: 'name', label: 'Alphabetical' },
                    { id: 'pages', label: 'Document Size' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setSortBy(option.id as any); setIsSortOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs text-left hover:bg-white/[0.06] transition-colors font-poppins"
                    >
                      <span className={sortBy === option.id ? 'text-white font-medium' : 'text-slate-400'}>
                        {option.label}
                      </span>
                      {sortBy === option.id && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <button 
          onClick={() => setFilterActive(!filterActive)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 ${filterActive ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]' : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}
          title="Filter Notes"
        >
          <Filter className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center p-0.5 bg-white/[0.03] border border-white/[0.08] rounded-xl shadow-inner">
          <button 
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${viewMode === 'grid' ? 'bg-white/[0.1] text-white shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'}`}
            title="Grid View"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${viewMode === 'list' ? 'bg-white/[0.1] text-white shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'}`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </>
  );
};
