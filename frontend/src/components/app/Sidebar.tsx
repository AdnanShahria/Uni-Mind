import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  LogOut,
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
  { icon: Newspaper, label: 'Feed', path: '/app/feed', badge: '3', color: 'text-blue-400' },
  { icon: StickyNote, label: 'Notes', path: '/app/notes', color: 'text-amber-400' },
  { icon: Bot, label: 'AI Tutor', path: '/app/ai', color: 'text-purple-400' },
  { icon: Users, label: 'Communities', path: '/app/communities', color: 'text-emerald-400' },
  { icon: MessageCircle, label: 'Messages', path: '/app/messages', badge: '5', color: 'text-cyan-400' },
  { icon: CalendarDays, label: 'Study Planner', path: '/app/planner', color: 'text-orange-400' },
  { icon: FlaskConical, label: 'Research', path: '/app/research', color: 'text-rose-400' },
];

const bottomNav: NavItem[] = [
  { icon: Settings, label: 'Settings', path: '/app/settings', color: 'text-slate-400' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-[#050810]/95 backdrop-blur-xl z-40 select-none overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 rounded-xl border border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" className="w-full h-full object-cover" alt="UniMind" />
            <div className="absolute inset-0 bg-primary/10 blur-sm" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <span className="text-lg font-bold font-poppins tracking-wider text-slate-100 whitespace-nowrap">
                  Uni<span className="text-gradient">Mind</span>
                </span>
                <p className="text-[8px] text-primary-glow font-semibold uppercase tracking-[0.2em] leading-none mt-0.5 font-poppins">
                  Academic OS
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* AI Quick Action */}
        <div className="px-1 mb-3">
          <NavLink to="/app/ai">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group ${collapsed ? 'justify-center' : ''}`}
            >
              <Sparkles className="w-4.5 h-4.5 text-primary-glow shrink-0 group-hover:animate-pulse" style={{ width: 18, height: 18 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-slate-200 font-poppins whitespace-nowrap"
                  >
                    Ask AI Tutor
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </NavLink>
        </div>

        {/* Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pt-1 pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-[0.18em] font-poppins"
            >
              Main
            </motion.p>
          )}
        </AnimatePresence>

        {mainNav.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink key={item.path} to={item.path} end={item.path === '/app'}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${collapsed ? 'justify-center' : ''} ${
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-glow shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <item.icon
                  className={`shrink-0 transition-colors ${active ? item.color || 'text-primary-glow' : 'text-slate-500 group-hover:text-slate-300'}`}
                  style={{ width: 19, height: 19 }}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className={`text-[13px] font-medium font-poppins whitespace-nowrap ${active ? 'text-white' : ''}`}
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
                        className="ml-auto text-[10px] font-bold text-white bg-primary/80 rounded-full w-5 h-5 flex items-center justify-center font-poppins shrink-0"
                      >
                        {item.badge}
                      </motion.span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-glow animate-pulse" />
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] px-2 py-2 space-y-0.5 shrink-0">
        {bottomNav.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${collapsed ? 'justify-center' : ''} ${
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <item.icon className="shrink-0 text-slate-500 group-hover:text-slate-300" style={{ width: 19, height: 19 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[13px] font-medium font-poppins whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}

        {/* User avatar + Logout */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold font-poppins shrink-0 shadow-md">
            A
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[12px] font-medium text-slate-200 font-poppins truncate">Scholar</p>
                <p className="text-[10px] text-slate-500 font-poppins truncate">Free Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] -right-3 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-primary/30 transition-all shadow-lg z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </motion.aside>
  );
};
