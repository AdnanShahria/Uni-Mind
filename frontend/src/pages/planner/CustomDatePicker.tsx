import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CustomDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const CustomDatePicker = ({ selectedDate, onDateChange }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync viewDate when selectedDate changes from parent
  useEffect(() => {
    setViewDate(new Date(selectedDate));
  }, [selectedDate]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days of week
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calendar math
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (day: number, isCurrentMonth: 'prev' | 'current' | 'next') => {
    let targetDate: Date;
    if (isCurrentMonth === 'prev') {
      targetDate = new Date(viewYear, viewMonth - 1, day);
    } else if (isCurrentMonth === 'next') {
      targetDate = new Date(viewYear, viewMonth + 1, day);
    } else {
      targetDate = new Date(viewYear, viewMonth, day);
    }
    onDateChange(targetDate);
    setIsOpen(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    onDateChange(today);
    setViewDate(today);
    setIsOpen(false);
  };

  // Generate all grid cells
  const gridCells: { day: number; monthType: 'prev' | 'current' | 'next'; key: string }[] = [];

  // 1. Previous month padded days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    gridCells.push({ day, monthType: 'prev', key: `prev-${day}` });
  }

  // 2. Current month days
  for (let day = 1; day <= totalDays; day++) {
    gridCells.push({ day, monthType: 'current', key: `current-${day}` });
  }

  // 3. Next month padded days (to make the grid columns fit nicely, 42 cells total for 6 rows)
  const remainingCells = 42 - gridCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    gridCells.push({ day, monthType: 'next', key: `next-${day}` });
  }

  // Format date for button display
  const formatDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Date Toggle Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.98] px-4 py-2 rounded-xl transition-all cursor-pointer select-none font-poppins"
      >
        <CalendarIcon className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-medium text-white">{formatDateString(selectedDate)}</span>
      </button>

      {/* Custom Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-4 z-[100] select-none font-poppins"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-outfit uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                {monthNames[viewMonth]} {viewYear}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {weekDays.map((day) => (
                <span key={day} className="text-[10px] font-bold text-slate-500 uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {gridCells.map(({ day, monthType, key }) => {
                const cellDate = new Date(
                  viewYear,
                  monthType === 'prev' ? viewMonth - 1 : monthType === 'next' ? viewMonth + 1 : viewMonth,
                  day
                );
                
                const isSelected = cellDate.toDateString() === selectedDate.toDateString();
                const isToday = cellDate.toDateString() === new Date().toDateString();
                const isCurrentMonth = monthType === 'current';

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectDay(day, monthType)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs transition-all font-medium relative ${
                      isSelected
                        ? 'bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.4)] scale-105 z-10'
                        : isToday
                        ? 'bg-white/[0.05] border border-orange-500/40 text-orange-400 hover:bg-white/[0.08]'
                        : isCurrentMonth
                        ? 'text-slate-200 hover:bg-white/[0.05]'
                        : 'text-slate-600 hover:bg-white/[0.02]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.06] mt-4 pt-3">
              <button
                onClick={handleGoToToday}
                className="text-[10px] font-bold text-orange-400 hover:text-orange-300 hover:underline transition-colors font-outfit uppercase tracking-wider flex items-center gap-1"
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
