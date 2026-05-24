import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sparkles,
  Command,
  ChevronDown,
  X,
  TrendingUp,
  FileText,
  Users,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const quickSearchSuggestions = [
  { icon: TrendingUp, label: 'Trending in your department', color: 'text-emerald-400' },
  { icon: FileText, label: 'Recent uploaded notes', color: 'text-amber-400' },
  { icon: Users, label: 'Active study groups', color: 'text-cyan-400' },
  { icon: Zap, label: 'AI generated summaries', color: 'text-purple-400' },
];

const initialNotifications = [
  { id: 1, text: 'Dr. Rahman shared new lecture notes', time: '2m ago', unread: true },
  { id: 2, text: 'AI generated flashcards for Physics 301', time: '15m ago', unread: true },
  { id: 3, text: 'New member joined Quantum Computing group', time: '1h ago', unread: false },
];

export const TopBar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { theme, toggleTheme } = useTheme();

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      {/* Left: Search */}
      <div className="relative flex-1 max-w-xl">
        <div
          className={`flex items-center gap-2.5 h-10 px-4 rounded-xl border transition-all duration-300 ${
            searchFocused
              ? 'bg-white/[0.08] border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
              : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
          }`}
        >
          <Search className={`w-4 h-4 shrink-0 transition-colors ${searchFocused ? 'text-primary-glow' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search notes, people, communities..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08]">
            <Command className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium font-poppins">K</span>
          </div>
        </div>

        {/* Search Dropdown */}
        <AnimatePresence>
          {searchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-2">
                <p className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] font-poppins">
                  Quick Access
                </p>
                {quickSearchSuggestions.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
                  >
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-sm text-slate-300 group-hover:text-white font-poppins transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                <span className="text-[11px] text-slate-400 font-poppins">AI-powered semantic search across all your content</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] text-slate-400 group-hover:text-amber-400 transition-colors" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-slate-400 group-hover:text-blue-400 transition-colors" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
          >
            <Bell className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-200 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center font-poppins shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <h4 className="text-sm font-semibold text-white font-poppins">Notifications</h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-poppins">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/[0.03] last:border-0 ${
                          n.unread ? 'bg-primary/[0.03]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-primary-glow shrink-0 mt-1.5 shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
                          )}
                          <div className={n.unread ? '' : 'pl-5'}>
                            <p className="text-xs text-slate-200 font-poppins leading-relaxed">{n.text}</p>
                            <p className="text-[10px] text-slate-500 font-poppins mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-white/[0.06] px-4 py-2.5 text-center flex justify-between items-center">
                  <button onClick={markAllAsRead} className="text-[10px] text-slate-400 hover:text-slate-200 font-medium font-poppins transition-colors">
                    Mark all as read
                  </button>
                  <button onClick={() => setNotifications([])} className="text-[11px] text-primary-glow hover:text-primary font-semibold font-poppins transition-colors">
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-xl hover:bg-white/[0.06] transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold font-poppins shadow-md">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12px] font-medium text-slate-200 font-poppins leading-none">Scholar</p>
            <p className="text-[10px] text-slate-500 font-poppins leading-none mt-0.5">Online</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
