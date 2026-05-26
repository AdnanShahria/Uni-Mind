import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTopBarContext } from '../../contexts/TopBarContext';

interface SettingsPageLayoutProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  headerAction?: ReactNode;
}

export const SettingsPageLayout = ({ title, icon, children, headerAction }: SettingsPageLayoutProps) => {
  const { setLeftContent } = useTopBarContext();

  useEffect(() => {
    setLeftContent(
      <div className="flex items-center justify-between w-full pr-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/app/settings"
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
            {icon}
            {title}
          </h1>
        </div>
        {headerAction && (
          <div className="flex items-center">
            {headerAction}
          </div>
        )}
      </div>
    );
    return () => setLeftContent(null);
  }, [title, icon, headerAction, setLeftContent]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-8 max-w-5xl mx-auto flex flex-col min-h-full w-full">
      <div className="flex flex-col gap-6 pb-12">
        {children}
      </div>
    </motion.div>
  );
};
