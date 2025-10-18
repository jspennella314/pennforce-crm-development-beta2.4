'use client';

import LightningSidebar from './LightningSidebar';
import LightningTopbar from './LightningTopbar';
import ConsoleTabs from './ConsoleTabs';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex bg-[#f3f3f3]">
      {/* Lightning Sidebar - Blue Rail */}
      <LightningSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Lightning Topbar */}
        <LightningTopbar />

        {/* Console Tabs */}
        <ConsoleTabs />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
