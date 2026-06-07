import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  subtitle?: string; // Optional subtitle for secondary info like locations
  isCustom?: boolean;
  isAction?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}

export const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(o => o.value === value);

  // Filter options based on query (excluding action items which are shown separately)
  const filteredOptions = options.filter(opt => {
    if (opt.isAction) return false;
    return opt.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const actionOptions = options.filter(opt => opt.isAction);

  const portalContainer = document.getElementById('auth-container') || document.body;

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      setSearchQuery('');
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const modalContent = (
    <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setIsOpen(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg flex flex-col bg-[#0b1121]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] overflow-hidden max-h-[85vh]"
      >
        {/* Header with Title and Close Button */}
        <div className="p-4 sm:p-5 border-b border-white/[0.04] bg-slate-950/40 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-100 font-outfit">
            Select {placeholder.replace('Select ', '')}
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Premium Glassmorphic Searchbar */}
        <div className="p-3 sm:p-4 border-b border-white/[0.04] bg-slate-950/20">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950/60 border border-white/10 outline-none text-sm text-slate-100 placeholder-slate-500 focus:border-primary-glow/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all font-poppins"
            />
          </div>
        </div>

        {/* Scrollable Options List */}
        <div className="overflow-y-auto flex-1 custom-scrollbar py-2">
          {filteredOptions.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-500 font-poppins flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-slate-700 mb-2" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              let textClass = "text-slate-300 hover:text-white";
              if (opt.isCustom) {
                textClass = "text-emerald-400 hover:text-emerald-300 font-medium";
              } else if (isSelected) {
                textClass = "text-white font-semibold bg-white/10";
              }

              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 sm:px-6 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.06] flex items-center justify-between cursor-pointer ${textClass}`}
                >
                  <div className="flex flex-col text-left truncate pr-4">
                    <span className="text-sm sm:text-base truncate">{opt.label}</span>
                    {opt.subtitle && (
                      <span className="text-[11px] sm:text-xs text-slate-500 font-light truncate mt-1">{opt.subtitle}</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-primary-glow animate-pulse shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Fixed Footer for Action Buttons */}
        {actionOptions.length > 0 && (
          <div className="border-t border-white/[0.06] bg-slate-950/60 p-2 sm:p-3 shrink-0">
            {actionOptions.map((opt, idx) => (
              <button
                key={`action-${opt.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-glow/10 hover:bg-primary-glow/20 border border-primary-glow/20 transition-all duration-200 text-primary-glow font-semibold text-sm cursor-pointer"
              >
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className={`relative w-full ${disabled ? 'pointer-events-none opacity-60' : 'opacity-100'} transition-all duration-300`}>
      {/* Click trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`w-full h-11 bg-slate-950/40 border border-white/5 rounded-xl px-4 flex items-center justify-between text-left text-xs sm:text-sm outline-none transition-all duration-300 select-none ${
          disabled 
            ? 'text-slate-500 border-white/5 cursor-not-allowed' 
            : 'text-slate-200 hover:border-primary-glow/30 focus:border-primary-glow/30 cursor-pointer'
        }`}
      >
        <span className={value ? "text-slate-100 truncate" : "text-slate-500 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-glow' : ''}`} />
      </button>

      {/* Floating Dropdown Modal via Portal */}
      {portalContainer && createPortal(
        <AnimatePresence>
          {isOpen && modalContent}
        </AnimatePresence>,
        portalContainer
      )}
    </div>
  );
};


