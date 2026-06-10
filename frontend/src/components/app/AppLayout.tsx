import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomBar } from './MobileBottomBar';
import { TopBarProvider, useTopBarContext } from '../../contexts/TopBarContext';

const AppLayoutInner = () => {
  const { isAppFullScreen } = useTopBarContext();
  return (
    <div
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      className={`flex h-[100dvh] bg-background overflow-hidden font-poppins selection:bg-primary/30 selection:text-white transition-all duration-300 ${isAppFullScreen ? 'p-0 gap-0' : 'p-0 gap-0 md:p-4 md:gap-4'}`}>
      {/* Global Background Effects - Optimized for Performance */}
      <div className="fixed inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none animate-blob" />
      <div className="fixed top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none animate-blob animation-delay-2000" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none animate-blob animation-delay-4000" />

      {/* Sidebar — Desktop Only */}
      {!isAppFullScreen && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Main Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${isAppFullScreen ? 'gap-0' : 'gap-0 md:gap-4'}`}>
        {!isAppFullScreen && <TopBar />}

        {/* Page Content */}
        <main className={`flex-1 flex flex-col overflow-y-scroll overflow-x-hidden bg-slate-900/40 backdrop-blur-md relative transition-all duration-300 pb-[calc(3rem+env(safe-area-inset-bottom)+0.5rem)] md:pb-0 ${isAppFullScreen ? 'rounded-none border-0 shadow-none' : 'rounded-none md:rounded-3xl border-0 md:border md:border-white/[0.05] shadow-none md:shadow-2xl'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar — Mobile Only */}
      {!isAppFullScreen && <MobileBottomBar />}
    </div>
  );
};

export const AppLayout = () => {
  return (
    <TopBarProvider>
      <AppLayoutInner />
    </TopBarProvider>
  );
};
