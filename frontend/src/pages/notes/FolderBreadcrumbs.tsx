import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface FolderBreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

export const FolderBreadcrumbs = ({ items, onNavigate }: FolderBreadcrumbsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 overflow-x-auto custom-scrollbar"
    >
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-colors text-slate-300 hover:text-white shrink-0"
      >
        <Home className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold font-poppins hidden sm:inline">Home</span>
      </button>

      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
          <button
            onClick={() => onNavigate(item.id)}
            className={`px-2 sm:px-3 py-1.5 rounded-lg border transition-colors text-sm font-semibold font-poppins ${
              idx === items.length - 1
                ? 'bg-primary/10 border-primary/30 text-primary-glow'
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </motion.div>
  );
};
