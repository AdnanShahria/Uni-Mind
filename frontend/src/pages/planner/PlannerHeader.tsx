import { CalendarDays } from 'lucide-react';
import { useEffect } from 'react';
import { useTopBarContext } from '../../contexts/TopBarContext';

interface PlannerHeaderProps {
  userName: string;
}

export const PlannerHeader = ({ userName }: PlannerHeaderProps) => {
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between gap-3 w-full pr-2">
        <div className="min-w-0 flex flex-col shrink-0">
          <h1 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center gap-2 truncate">
            <CalendarDays className="w-5 h-5 text-orange-400" />
            {userName}'s Planner
          </h1>
          <p className="text-[10px] text-slate-400 font-poppins mt-0.5 hidden lg:block">
            AI-optimized study schedule for peak performance
          </p>
        </div>
      </div>
    );
    return () => setLeftContent(null);
  }, [userName, setLeftContent]);

  return null;
};

