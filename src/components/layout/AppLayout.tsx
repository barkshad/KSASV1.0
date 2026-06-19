import React from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { TopAppBar } from './TopAppBar';

interface AppLayoutProps {
  role: 'student' | 'lecturer' | 'admin';
  user: any;
}

export function AppLayout({ role, user }: AppLayoutProps) {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col md:flex-row pb-20 md:pb-0 relative overflow-hidden">
      <DesktopSidebar role={role} user={user} />
      
      <main className="flex-1 flex flex-col min-w-0 md:ml-72 lg:ml-80 min-h-screen">
        <TopAppBar role={role} user={user} />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <Outlet />
        </div>
      </main>

      <MobileNav role={role} />
    </div>
  );
}
