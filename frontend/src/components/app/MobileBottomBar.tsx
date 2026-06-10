import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { turso } from '../../utils/tursoClient';
import {
  LayoutDashboard,
  Newspaper,
  StickyNote,
  Bot,
  MessageCircle,
  MoreHorizontal,
  Users,
  CalendarDays,
  FlaskConical,
  Trophy,
  Settings,
  LogOut,
  X,
  Award,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color?: string;
}

const primaryNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'UniHome', path: '/app', color: 'text-primary-glow' },
  { icon: Newspaper, label: 'UniFeed', path: '/app/feed', color: 'text-blue-400' },
  { icon: StickyNote, label: 'UniNote', path: '/app/notes', color: 'text-amber-400' },
  { icon: Bot, label: 'UniTutor', path: '/app/ai', color: 'text-purple-400' },
  { icon: MessageCircle, label: 'UniChat', path: '/app/messages', color: 'text-cyan-400' },
];

const moreNav: NavItem[] = [
  { icon: Trophy, label: 'UniBoard', path: '/app/leaderboard', color: 'text-yellow-400' },
  { icon: Users, label: 'UniGroup', path: '/app/communities', color: 'text-emerald-400' },
  { icon: CalendarDays, label: 'UniPlan', path: '/app/planner', color: 'text-orange-400' },
  { icon: FlaskConical, label: 'UniLab', path: '/app/research', color: 'text-rose-400' },
  { icon: Settings, label: 'Settings', path: '/app/settings', color: 'text-slate-300' },
];

export const MobileBottomBar = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await turso.auth.getUser();
      if (user) {
        const { data } = await turso.from('users').select('role').eq('id', user.id).single();
        if (data?.role?.toLowerCase() === 'admin') setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  // Check if any "more" item is active
  const isMoreActive = moreNav.some(item => isActive(item.path)) || 
    (isAdmin && isActive('/app/admin'));

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
              onClick={() => setMoreOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[95] md:hidden"
            >
              <div className="bg-slate-900/95 backdrop-blur-2xl border-t border-white/[0.08] rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
                {/* Handle + Close */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 rounded-full bg-white/20" />
                  </div>
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Nav Grid */}
                <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                  {moreNav.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreOpen(false)}
                        className="block outline-none"
                      >
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 ${
                            active
                              ? 'bg-white/[0.08] border border-white/[0.12]'
                              : 'bg-white/[0.02] border border-white/[0.04] active:bg-white/[0.06]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            active
                              ? 'bg-white/[0.08] shadow-lg'
                              : 'bg-white/[0.03]'
                          }`}>
                            <item.icon
                              className={`w-5 h-5 transition-colors ${active ? item.color || 'text-white' : 'text-white/50'}`}
                              strokeWidth={active ? 2.2 : 1.8}
                            />
                          </div>
                          <span className={`text-[10px] font-medium font-poppins ${active ? 'text-white' : 'text-white/50'}`}>
                            {item.label}
                          </span>
                        </motion.div>
                      </NavLink>
                    );
                  })}

                  {/* Admin Panel (conditional) */}
                  {isAdmin && (
                    <NavLink
                      to="/app/admin"
                      onClick={() => setMoreOpen(false)}
                      className="block outline-none"
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 ${
                          isActive('/app/admin')
                            ? 'bg-white/[0.08] border border-white/[0.12]'
                            : 'bg-white/[0.02] border border-white/[0.04] active:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isActive('/app/admin') ? 'bg-white/[0.08] shadow-lg' : 'bg-white/[0.03]'
                        }`}>
                          <Award
                            className={`w-5 h-5 transition-colors ${isActive('/app/admin') ? 'text-red-400' : 'text-white/50'}`}
                            strokeWidth={isActive('/app/admin') ? 2.2 : 1.8}
                          />
                        </div>
                        <span className={`text-[10px] font-medium font-poppins ${isActive('/app/admin') ? 'text-white' : 'text-white/50'}`}>
                          Admin
                        </span>
                      </motion.div>
                    </NavLink>
                  )}

                  {/* Logout */}
                  <button
                    onClick={async () => {
                      setMoreOpen(false);
                      await turso.auth.signOut();
                      window.location.href = '/auth';
                    }}
                    className="block outline-none w-full"
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 bg-red-500/[0.04] border border-red-500/[0.08] active:bg-red-500/[0.1]"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/[0.06]">
                        <LogOut className="w-5 h-5 text-red-400/70" strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-medium font-poppins text-red-400/70">
                        Logout
                      </span>
                    </motion.div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] md:hidden">
        <div className="bg-slate-900/80 backdrop-blur-2xl border-t border-l border-r border-slate-700 rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.3)] pb-[max(env(safe-area-inset-bottom),6px)]">
          <div className="flex items-center justify-around h-12 px-1">
            {primaryNav.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  state={item.path === '/app/ai' ? { newChat: Date.now() } : undefined}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 outline-none relative"
                >
                  {/* Active glow dot */}
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-primary-glow shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`w-4 h-4 transition-all duration-200 ${
                      active ? item.color || 'text-white' : 'text-white/40'
                    }`}
                    strokeWidth={active ? 2.2 : 1.6}
                  />
                  <span className={`text-[8px] font-medium font-poppins transition-colors duration-200 ${
                    active ? 'text-white' : 'text-white/35'
                  }`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 outline-none relative"
            >
              {isMoreActive && !moreOpen && (
                <motion.div
                  className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-primary-glow shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                />
              )}
              <MoreHorizontal
                className={`w-4 h-4 transition-all duration-200 ${
                  isMoreActive || moreOpen ? 'text-primary-glow' : 'text-white/40'
                }`}
                strokeWidth={isMoreActive || moreOpen ? 2.2 : 1.6}
              />
              <span className={`text-[8px] font-medium font-poppins transition-colors duration-200 ${
                isMoreActive || moreOpen ? 'text-white' : 'text-white/35'
              }`}>
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
