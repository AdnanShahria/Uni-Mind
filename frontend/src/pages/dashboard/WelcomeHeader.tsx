import { Clock } from 'lucide-react';

import { useEffect } from 'react';
import { useTopBarContext } from '../../contexts/TopBarContext';

export const WelcomeHeader = ({ userName }: { userName: string }) => {
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-2 md:gap-3 w-full min-w-0 overflow-hidden pr-1 md:pr-2">
        <div className="min-w-0">
          <h1 className="text-sm md:text-lg sm:text-xl font-bold font-outfit text-white tracking-tight truncate">
            Welcome back, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 font-poppins mt-0.5 hidden md:block">
            Here's what's happening in your academic workspace today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[10px] text-slate-400 font-poppins">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [userName, setLeftContent]);

  return null;
};
