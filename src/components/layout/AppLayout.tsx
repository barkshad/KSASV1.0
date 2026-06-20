import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { TopAppBar } from './TopAppBar';
import { useAuth } from '../../hooks/useAuth';
import { Toaster } from 'react-hot-toast';

interface AppLayoutProps {
  role: 'student' | 'lecturer' | 'admin';
  user?: any;
}

export function AppLayout({ role, user: propUser }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    } else if (!loading && user && user.role !== role && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, navigate, role]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const activeUser = propUser || user;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col md:flex-row pb-20 md:pb-0 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{
          style: {
              background: 'var(--color-surface-container-highest)',
              color: 'var(--color-on-surface)',
              borderRadius: '0.75rem',
          }
      }} />
      <DesktopSidebar role={role} user={activeUser} />
      
      <main className="flex-1 flex flex-col min-w-0 md:ml-72 lg:ml-80 min-h-screen">
        <TopAppBar role={role} user={activeUser} />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <Outlet />
        </div>
      </main>

      <MobileNav role={role} />
    </div>
  );
}
