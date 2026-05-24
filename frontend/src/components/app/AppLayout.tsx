import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-poppins selection:bg-primary/30 selection:text-white">
      {/* Background effects (subtle, won't compete with content) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-8%] w-[40%] h-[40%] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-secondary/[0.04] blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
