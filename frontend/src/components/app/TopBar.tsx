import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sparkles,
  Command,
  X,
  TrendingUp,
  FileText,
  Users,
  Zap,
  Sun,
  Moon,
  MessageSquare,
  Heart,
  Megaphone,
  UserCheck,
  StickyNote,
  Users2,
  User,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { turso } from '../../utils/tursoClient';
import toast from 'react-hot-toast';
import { useTopBarContext } from '../../contexts/TopBarContext';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const quickSearchSuggestions = [
  { icon: TrendingUp, label: 'Trending in your department', color: 'text-emerald-400' },
  { icon: FileText, label: 'Recent uploaded notes', color: 'text-amber-400' },
  { icon: Users, label: 'Active study groups', color: 'text-cyan-400' },
  { icon: Zap, label: 'AI generated summaries', color: 'text-purple-400' },
];

const SearchResults = ({
  globalSearchQuery,
  isSearching,
  searchResults,
  onNavigate,
  onClear,
}: {
  globalSearchQuery: string;
  isSearching: boolean;
  searchResults: { notes: any[]; communities: any[]; users: any[] };
  onNavigate: (path: string) => void;
  onClear: () => void;
}) => {
  const hasResults =
    searchResults.notes.length > 0 ||
    searchResults.communities.length > 0 ||
    searchResults.users.length > 0;

  if (globalSearchQuery.length < 2) {
    return (
      <>
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
      </>
    );
  }

  if (isSearching) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-poppins">Searching...</span>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="py-8 text-center">
        <Search className="w-7 h-7 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-xs font-poppins">No results for</p>
        <p className="text-white text-sm font-semibold font-poppins mt-0.5">"{globalSearchQuery}"</p>
      </div>
    );
  }

  return (
    <>
      {searchResults.notes.length > 0 && (
        <div className="mb-1">
          <p className="px-3 py-1.5 text-[9px] font-bold text-amber-400/80 uppercase tracking-[0.2em] font-poppins">
            Notes
          </p>
          {searchResults.notes.map((n) => (
            <button
              key={n.id}
              onClick={() => { onNavigate('/app/notes'); onClear(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-200 font-medium font-poppins truncate block">{n.title}</span>
                <span className="text-[10px] text-slate-500 font-poppins">{n.folder_name || 'Unsorted'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchResults.communities.length > 0 && (
        <div className="mb-1">
          <p className="px-3 py-1.5 text-[9px] font-bold text-cyan-400/80 uppercase tracking-[0.2em] font-poppins">
            Communities
          </p>
          {searchResults.communities.map((c) => (
            <button
              key={c.id}
              onClick={() => { onNavigate('/app/communities'); onClear(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Users2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-200 font-medium font-poppins truncate block">{c.name}</span>
                <span className="text-[10px] text-slate-500 font-poppins capitalize">{c.type}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchResults.users.length > 0 && (
        <div className="mb-1">
          <p className="px-3 py-1.5 text-[9px] font-bold text-emerald-400/80 uppercase tracking-[0.2em] font-poppins">
            People
          </p>
          {searchResults.users.map((u) => (
            <button
              key={u.id}
              onClick={() => { onNavigate(`/app/profile/${u.id}`); onClear(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-200 font-medium font-poppins truncate block">{u.name}</span>
                <span className="text-[10px] text-slate-500 font-poppins truncate block">{u.institution || 'UniMind User'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export const TopBar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, toggleTheme } = useTheme();
  const { leftContent, globalSearchQuery, setGlobalSearchQuery } = useTopBarContext();
  const location = useLocation();
  const navigate = useNavigate();
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<{
    notes: any[];
    communities: any[];
    users: any[];
  }>({ notes: [], communities: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Close dropdown on route change
  useEffect(() => {
    setSearchFocused(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        desktopInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!globalSearchQuery || globalSearchQuery.length < 2) {
      setSearchResults({ notes: [], communities: [], users: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const pattern = `%${globalSearchQuery}%`;
        const [notesRes, commsRes, usersRes] = await Promise.all([
          // Fix: select folder name via join
          turso.from('notes').select('id, title, folders(name)').ilike('title', pattern).limit(4),
          turso.from('communities').select('id, name, type').ilike('name', pattern).limit(4),
          turso.from('users').select('id, name, institution, avatar_url').ilike('name', pattern).limit(4),
        ]);

        setSearchResults({
          notes: (notesRes.data || []).map((n: any) => ({
            ...n,
            folder_name: n.folders?.name || null,
          })),
          communities: commsRes.data || [],
          users: usersRes.data || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  const clearSearch = useCallback(() => {
    setGlobalSearchQuery('');
    setSearchResults({ notes: [], communities: [], users: [] });
  }, [setGlobalSearchQuery]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    setSearchFocused(false);
    setMobileSearchOpen(false);
  }, [navigate]);

  const getPageName = () => {
    const path = location.pathname;
    if (path.startsWith('/app/feed')) return 'UniFeed';
    if (path.startsWith('/app/notes')) return 'UniNote';
    if (path.startsWith('/app/ai')) return 'UniTutor';
    if (path.startsWith('/app/messages')) return 'UniChat';
    if (path.startsWith('/app/leaderboard')) return 'UniBoard';
    if (path.startsWith('/app/communities')) return 'UniGroup';
    if (path.startsWith('/app/planner')) return 'UniPlan';
    if (path.startsWith('/app/research')) return 'UniLab';
    if (path === '/app') return 'UniHome';
    return 'UniMind';
  };

  useEffect(() => {
    let channel: any;
    const initNotificationsAndProfile = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        const { data: notifs } = await turso
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(15);
        if (notifs) setNotifications(notifs);

        channel = turso
          .channel(`user-notifications-${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            async (payload: any) => {
              const { data: refetched } = await turso
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(15);
              if (refetched) {
                setNotifications(refetched);
                if (payload.eventType === 'INSERT') {
                  toast.success(payload.new.title || 'New notification received!', {
                    id: 'notification-bell-toast',
                    icon: '🔔',
                  });
                }
              }
            }
          )
          .subscribe();
      }
    };

    initNotificationsAndProfile();
    return () => { if (channel) turso.removeChannel(channel); };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await turso.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    const { data: { user } } = await turso.auth.getUser();
    if (user) {
      await turso.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      toast.success('All notifications marked as read', { id: 'notif-read-toast' });
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    const { data: { user } } = await turso.auth.getUser();
    if (user) {
      await turso.from('notifications').delete().eq('user_id', user.id);
      toast.success('Notifications cleared', { id: 'notif-clear-toast' });
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'comment': return <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
      case 'announcement': return <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'connection': return <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <>
      <header className="h-12 md:h-16 border-b md:border border-slate-700 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-2 md:px-6 z-30 shrink-0 rounded-b-[24px] md:rounded-b-[32px] rounded-t-none shadow-xl overflow-hidden">
        {/* Left */}
        <div className="relative flex-1 max-w-xl">
          {leftContent ? leftContent : (
            <div className="flex items-center gap-1.5 md:gap-2">
              <img src="/logo.png" className="w-5 h-5 md:w-7 md:h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" alt="UniMind" />
              <span className="text-[13px] md:text-[15px] font-bold text-white tracking-wide font-poppins">{getPageName()}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-4 shrink-0">

          {/* Mobile Search Button — hidden on notes (has its own) */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group hover:bg-primary/[0.08] border border-transparent hover:border-primary/[0.12]"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 group hover:bg-primary/[0.08] hover:shadow-[0_0_0_1px_rgba(var(--color-primary-rgb),0.15)] border border-transparent hover:border-primary/[0.12]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400 group-hover:text-amber-400 transition-colors" />
            ) : (
              <Moon className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400 group-hover:text-blue-400 transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 group hover:bg-primary/[0.08] hover:shadow-[0_0_0_1px_rgba(var(--color-primary-rgb),0.15)] border border-transparent hover:border-primary/[0.12]"
            >
              <Bell className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400 group-hover:text-slate-200 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 md:top-1.5 md:right-1.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-primary text-[8px] md:text-[9px] font-bold text-white flex items-center justify-center font-poppins shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  {unreadCount}
                </span>
              )}
            </button>

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
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 font-poppins">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/[0.03] last:border-0 flex gap-3 ${!n.is_read ? 'bg-primary/[0.03]' : ''}`}
                        >
                          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-xl bg-white/5 border border-white/5">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs ${!n.is_read ? 'text-white font-semibold' : 'text-slate-300'} font-poppins leading-snug truncate`}>
                                {n.title}
                              </p>
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />}
                            </div>
                            <p className="text-[11px] text-slate-400 font-poppins leading-relaxed mt-0.5">{n.content}</p>
                            <p className="text-[9px] text-slate-500 font-poppins mt-1">{formatTime(n.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-white/[0.06] px-4 py-2.5 text-center flex justify-between items-center">
                    <button onClick={markAllAsRead} className="text-[10px] text-slate-400 hover:text-slate-200 font-medium font-poppins transition-colors bg-transparent border-none cursor-pointer">
                      Mark all as read
                    </button>
                    <button onClick={clearAllNotifications} className="text-[10px] text-primary-glow hover:text-primary font-semibold font-poppins transition-colors bg-transparent border-none cursor-pointer">
                      Clear all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block relative w-56 lg:w-80 ml-2">
            <div
              className={`flex items-center gap-2.5 h-10 px-3 rounded-xl border transition-all duration-300 ${
                searchFocused || globalSearchQuery
                  ? 'bg-white/[0.08] border-primary/30 shadow-[0_0_0_1px_rgba(var(--color-primary-rgb),0.12),0_0_20px_rgba(var(--color-primary-rgb),0.08)]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.10] hover:bg-white/[0.05]'
              }`}
            >
              <Search className={`w-4 h-4 shrink-0 transition-colors ${searchFocused || globalSearchQuery ? 'text-primary-glow' : 'text-slate-500'}`} />
              <input
                ref={desktopInputRef}
                type="text"
                name="global-search"
                autoComplete="off"
                placeholder="Search anything... (⌘K)"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none font-poppins min-w-0"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {globalSearchQuery ? (
                <button
                  onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
                  className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] shrink-0">
                  <Command className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500 font-medium font-poppins">K</span>
                </div>
              )}
            </div>

            {/* Search Dropdown */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-slate-900/98 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    <SearchResults
                      globalSearchQuery={globalSearchQuery}
                      isSearching={isSearching}
                      searchResults={searchResults}
                      onNavigate={handleNavigate}
                      onClear={clearSearch}
                    />
                  </div>
                  <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                    <span className="text-[11px] text-slate-400 font-poppins">AI-powered semantic search</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm sm:hidden"
            onClick={() => setMobileSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-14 left-3 right-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Mobile Input Row */}
              <div className="flex items-center gap-2 p-2">
                <div className="flex-1 flex items-center gap-2.5 h-12 px-4 rounded-xl bg-white/[0.05] border border-primary/30 focus-within:bg-white/[0.08] transition-all">
                  <Search className="w-4 h-4 text-primary-glow shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search notes, people, communities..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] text-slate-200 placeholder-slate-500 outline-none font-poppins min-w-0"
                  />
                  {globalSearchQuery && (
                    <button onMouseDown={() => clearSearch()} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/10 shrink-0">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setMobileSearchOpen(false); clearSearch(); }}
                  className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Mobile Results */}
              <div className="px-2 pb-2 max-h-[55vh] overflow-y-auto scrollbar-thin">
                <SearchResults
                  globalSearchQuery={globalSearchQuery}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  onNavigate={handleNavigate}
                  onClear={() => { clearSearch(); setMobileSearchOpen(false); }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
