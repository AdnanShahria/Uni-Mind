import { Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommunitiesFilter = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  onCreateCommunity,
  isSearchModalOpen,
  setIsSearchModalOpen
}: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filter: string;
  setFilter: (val: string) => void;
  onCreateCommunity: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (val: boolean) => void;
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap sm:flex-nowrap">
        {/* Desktop Search */}
        <div className="hidden sm:flex flex-1 max-w-md items-center gap-2.5 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-white/[0.06]">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search communities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins" 
          />
        </div>
        
        {/* Filters and Create Button Wrapper */}
        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
          <div 
            className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-none pr-4"
            style={{ 
              WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent 100%)', 
              maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent 100%)' 
            }}
          >
            {['All', 'Department', 'Batch', 'Research Group', 'Interest Group'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium font-poppins transition-colors ${
                  filter === f ? 'bg-primary/10 border border-primary/20 text-primary-glow' : 'bg-white/[0.02] sm:bg-transparent hover:bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.04] sm:border-transparent'
                }`}
              >
                {f === 'Research Group' ? 'Research' : f === 'Interest Group' ? 'Interest' : f}
              </button>
            ))}
          </div>

          <button 
            onClick={onCreateCommunity}
            className="flex items-center justify-center gap-1.5 p-1.5 sm:px-4 sm:py-2 rounded-full sm:rounded-xl bg-primary hover:bg-primary-glow text-white text-[10px] sm:text-xs font-semibold font-poppins transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Community</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm sm:hidden px-4 pt-20"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2.5 h-12 px-4 rounded-xl bg-white/[0.04] border border-primary/30 focus-within:bg-white/[0.06]">
                <Search className="w-4 h-4 text-primary-glow" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search communities..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] text-slate-200 placeholder-slate-500 outline-none font-poppins" 
                />
              </div>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
