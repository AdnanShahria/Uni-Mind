import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TopBarProvider, useTopBarContext } from '../../contexts/TopBarContext';

const AppLayoutInner = () => {
  const { isAppFullScreen } = useTopBarContext();
  return (
    <div className={`flex h-screen bg-background overflow-hidden font-poppins selection:bg-primary/30 selection:text-white transition-all duration-300 ${isAppFullScreen ? 'p-0 gap-0' : 'p-4 gap-4'}`}>
      {/* Global Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] mix-blend-screen pointer-events-none animate-blob" />
      <div className="fixed top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[150px] mix-blend-screen pointer-events-none animate-blob animation-delay-2000" />
      <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[150px] mix-blend-screen pointer-events-none animate-blob animation-delay-4000" />

      {/* Sidebar */}
      {!isAppFullScreen && <Sidebar />}

      {/* Main Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${isAppFullScreen ? 'gap-0' : 'gap-4'}`}>
        {!isAppFullScreen && <TopBar />}

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-slate-900/40 backdrop-blur-md relative transition-all duration-300 ${isAppFullScreen ? 'rounded-none border-0 shadow-none' : 'rounded-3xl border border-white/[0.05] shadow-2xl'}`}>
          <Outlet />
        </main>
      </div>
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
