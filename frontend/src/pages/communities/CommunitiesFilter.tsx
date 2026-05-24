import { Search } from 'lucide-react';

export const CommunitiesFilter = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter
}: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filter: string;
  setFilter: (val: string) => void;
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 max-w-md flex items-center gap-2.5 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-white/[0.06]">
        <Search className="w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search communities..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins" 
        />
      </div>
      {['All', 'Department', 'Batch', 'Research Group', 'Interest Group'].map((f) => (
        <button 
          key={f} 
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-xl text-xs font-medium font-poppins transition-colors ${
            filter === f ? 'bg-primary/10 border border-primary/20 text-primary-glow' : 'hover:bg-white/[0.04] text-slate-400 hover:text-white'
          }`}
        >
          {f === 'Research Group' ? 'Research' : f === 'Interest Group' ? 'Interest' : f}
        </button>
      ))}
    </div>
  );
};
