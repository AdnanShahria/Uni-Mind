import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { turso } from '../../utils/tursoClient';
import {
  LayoutDashboard,
  Newspaper,
  StickyNote,
  Bot,
  Users,
  MessageCircle,
  CalendarDays,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Award,
  Trophy,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  color?: string;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app', color: 'text-primary-glow' },
  { icon: Trophy, label: 'Leaderboard', path: '/app/leaderboard', color: 'text-yellow-400' },
  { icon: Newspaper, label: 'Feed', path: '/app/feed', badge: '3', color: 'text-blue-400' },
  { icon: StickyNote, label: 'Notes', path: '/app/notes', color: 'text-amber-400' },
  { icon: Bot, label: 'AI Tutor', path: '/app/ai', color: 'text-purple-400' },
  { icon: Users, label: 'Communities', path: '/app/communities', color: 'text-emerald-400' },
  { icon: MessageCircle, label: 'Messages', path: '/app/messages', badge: '5', color: 'text-cyan-400' },
  { icon: CalendarDays, label: 'Study Planner', path: '/app/planner', color: 'text-orange-400' },
  { icon: FlaskConical, label: 'Research', path: '/app/research', color: 'text-rose-400' },
];

const bottomNav: NavItem[] = [
  { icon: Settings, label: 'Settings', path: '/app/settings', color: 'text-slate-300' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Scholar');
  const [userInitial, setUserInitial] = useState('S');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        const { data } = await turso.from('users').select('name, avatar_url, role').eq('id', user.id).single();
        const name = data?.name || user.user_metadata?.name || 'Scholar';
        const role = data?.role || user.user_metadata?.role || '';
        setUserName(name);
        setUserInitial(name[0].toUpperCase());
        setAvatarUrl(data?.avatar_url || '');
        setIsAdmin(role.toLowerCase() === 'admin');
      }
    };
    fetchUser();
    
    window.addEventListener('profile-updated', fetchUser);
    return () => {
      window.removeEventListener('profile-updated', fetchUser);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative h-[calc(100vh-2rem)] z-40 shrink-0">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 220 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="h-full flex flex-col bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] select-none overflow-hidden sidebar-radius"
      >
        {/* Brand Header */}
        <div className="h-[64px] flex items-center px-4 shrink-0 relative">
          <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          
          <div className="flex items-center gap-3 min-w-0 w-full">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.1] to-white/[0.02] border border-white/[0.1] flex items-center justify-center overflow-hidden shrink-0 shadow-lg"
            >
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt={userName} />
              ) : (
                <span className="text-white font-bold text-base font-poppins">{userInitial}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1"
                >
                  <span className="text-[13px] font-bold font-poppins text-white whitespace-nowrap truncate block drop-shadow-md tracking-wide">
                    {userName}
                  </span>
                  <p className="text-[8px] text-white/50 font-semibold uppercase tracking-[0.2em] leading-none mt-0.5 font-poppins">
                    Academic OS
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* AI Quick Action */}
          <div className="mb-4 px-1">
            {collapsed ? (
              <motion.div
                onClick={() => setCollapsed(false)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center px-3 mx-1 py-2 card-radius bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-300 cursor-pointer backdrop-blur-sm group"
              >
                <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full border border-white/[0.08] transition-all duration-300 z-10 bg-transparent group-hover:border-white/[0.2]">
                  <ChevronRight 
                    className="text-white/50 group-hover:text-white transition-colors duration-300"
                    style={{ width: 14, height: 14 }}
                    strokeWidth={2}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-5 gap-2 h-[38px]">
                <div className="col-span-4 block h-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 card-radius bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-300 group h-full cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-purple-400/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 ease-out skew-x-12" />
                    <img src="/logo.png" className="w-4.5 h-4.5 shrink-0 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-transform duration-300" style={{ width: 18, height: 18 }} alt="UniMind" />
                    <span className="text-[12px] font-bold text-white tracking-wide font-poppins whitespace-nowrap truncate">
                      UniMind
                    </span>
                  </motion.div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCollapsed(true)}
                  className="col-span-1 h-full card-radius bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all shadow-lg backdrop-blur-md group"
                >
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Label */}
          <AnimatePresence>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 pb-1 pt-1 text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] font-poppins"
              >
                Main
              </motion.p>
            )}
          </AnimatePresence>

          {(() => {
            const navItems = [...mainNav];
            if (isAdmin) {
              navItems.push({ icon: Award, label: 'Admin Panel', path: '/app/admin', color: 'text-red-400' });
            }
            return navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/app'} className="block outline-none" state={item.path === '/app/ai' ? { newChat: Date.now() } : undefined}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-3.5 pl-4 pr-3 py-2 card-radius transition-all duration-300 cursor-pointer group ${collapsed ? 'justify-center px-3 mx-1' : ''} ${
                      active
                        ? 'bg-white/[0.06] border border-white/[0.1] shadow-[0_2px_12px_rgba(0,0,0,0.15)] text-white backdrop-blur-md'
                        : 'bg-white/[0.015] border border-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.03] hover:border-white/[0.06] backdrop-blur-sm'
                    }`}
                  >
                  {/* Active background glow */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.04] to-transparent opacity-50"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Active Indicator — Glowing Curly Brace */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-0 bottom-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    >
                      <svg
                        width="8" height="30" viewBox="0 0 8 30"
                        className={item.color || 'text-[#a5f3fc]'}
                        style={{ filter: 'drop-shadow(0 0 5px currentColor) drop-shadow(0 0 8px currentColor)' }}
                      >
                        <path
                          d="M1,1 C3,1 3.5,3.5 3.5,7 C3.5,10 6,13 7,15 C6,17 3.5,20 3.5,23 C3.5,26.5 3,29 1,29 A1,1 0 0,1 0,28 L0,2 A1,1 0 0,1 1,1 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.div>
                  )}

                  <div className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-full border transition-all duration-300 z-10 ${
                    active 
                      ? 'border-[#87CEEB]/30 bg-transparent drop-shadow-[0_0_8px_rgba(135,206,235,0.2)]' 
                      : 'border-white/[0.08] bg-transparent group-hover:border-white/[0.2]'
                  }`}>
                    <item.icon
                      className={`transition-colors duration-300 ${active ? item.color || 'text-white' : 'text-white/50 group-hover:text-white'}`}
                      style={{ width: 14, height: 14 }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.15 }}
                        className={`text-[12.5px] font-medium font-poppins whitespace-nowrap z-10 ${active ? 'text-white drop-shadow-sm' : ''}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {item.badge && (
                    <AnimatePresence>
                      {!collapsed ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="ml-auto text-[9px] font-bold text-white bg-white/10 backdrop-blur-md rounded-full w-4 h-4 flex items-center justify-center font-poppins shrink-0 shadow-lg border border-white/[0.08] z-10"
                        >
                          {item.badge}
                        </motion.span>
                      ) : (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse z-10" />
                      )}
                    </AnimatePresence>
                  )}
                  </motion.div>
                </NavLink>
              );
            });
          })()}
        </nav>

        {/* Bottom section */}
        <div className="p-3 space-y-2 shrink-0 relative">
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          
          {bottomNav.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink key={item.path} to={item.path} className="block outline-none">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3.5 pl-3 pr-3 py-2 card-radius transition-all duration-300 cursor-pointer group ${collapsed ? 'justify-center px-3 mx-1' : ''} ${
                    active
                      ? 'bg-white/[0.06] border border-white/[0.1] shadow-[0_2px_12px_rgba(0,0,0,0.15)] text-white backdrop-blur-md'
                      : 'bg-white/[0.015] border border-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.03] hover:border-white/[0.06] backdrop-blur-sm'
                  }`}
                >
                  {/* Active Indicator — Glowing Curly Brace */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-bottom-active-indicator"
                      className="absolute left-0 top-0 bottom-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    >
                      <svg
                        width="8" height="30" viewBox="0 0 8 30"
                        className={item.color || 'text-[#a5f3fc]'}
                        style={{ filter: 'drop-shadow(0 0 5px currentColor) drop-shadow(0 0 8px currentColor)' }}
                      >
                        <path
                          d="M1,1 C3,1 3.5,3.5 3.5,7 C3.5,10 6,13 7,15 C6,17 3.5,20 3.5,23 C3.5,26.5 3,29 1,29 A1,1 0 0,1 0,28 L0,2 A1,1 0 0,1 1,1 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.div>
                  )}

                  <div className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-full border transition-all duration-300 z-10 ${
                    active 
                      ? 'border-[#87CEEB]/30 bg-transparent drop-shadow-[0_0_8px_rgba(135,206,235,0.2)]' 
                      : 'border-white/[0.08] bg-transparent group-hover:border-white/[0.2]'
                  }`}>
                    <item.icon 
                      className={`transition-colors duration-300 ${active ? item.color || 'text-white' : 'text-white/50 group-hover:text-white'}`}
                      style={{ width: 14, height: 14 }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`text-[12.5px] font-medium font-poppins whitespace-nowrap z-10 ${active ? 'text-white drop-shadow-sm' : ''}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </NavLink>
            );
          })}

          {/* Normal LogOut Button */}
          <button
            onClick={async () => {
              await turso.auth.signOut();
              window.location.href = '/auth.html';
            }}
            className="block w-full outline-none mt-1"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3.5 pl-3 pr-3 py-2 card-radius transition-all duration-300 cursor-pointer group bg-white/[0.015] border border-white/[0.03] hover:bg-red-500/[0.05] hover:border-red-500/[0.1] backdrop-blur-sm ${collapsed ? 'justify-center px-3 mx-1' : ''}`}
            >
              <div className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-full border transition-all duration-300 z-10 border-white/[0.08] bg-transparent group-hover:border-red-500/[0.2]`}>
                <LogOut 
                  className="transition-colors duration-300 text-white/50 group-hover:text-red-400"
                  style={{ width: 14, height: 14 }}
                  strokeWidth={2}
                />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[12.5px] font-medium font-poppins whitespace-nowrap z-10 text-white/60 group-hover:text-red-400 transition-colors"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </div>
  );
};

