import { Globe, Search } from 'lucide-react';
import { useEffect } from 'react';
import { useTopBarContext } from '../../contexts/TopBarContext';

export const CommunitiesHeader = ({ onOpenSearch }: { onOpenSearch: () => void }) => {
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Communities
          </h1>
          <p className="text-xs text-slate-400 font-poppins mt-0.5 hidden sm:block">
            Join academic groups, departments, and research circles
          </p>
        </div>
        <div className="flex items-center gap-3 sm:hidden">
          <button 
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
          >
            <Search className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [onOpenSearch, setLeftContent]);

  return null;
};
