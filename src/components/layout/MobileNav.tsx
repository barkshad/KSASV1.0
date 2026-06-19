import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Shield, BookOpen, History, School, User, QrCode, BarChart, Settings, Calendar, LayoutDashboard, LayoutGrid, Users } from 'lucide-react';

interface MobileNavProps {
  role: 'student' | 'lecturer' | 'admin';
}

export function MobileNav({ role }: MobileNavProps) {
  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student', icon: <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAITcUBGwbF7SXAw-LQV5eSRtjllmi2B040EoQ6GV_GB74vd_MfvFUGxHA9w53uLGMDKhbDQmyf8_QKKj7YafFoM4CSDssuoP70kdbFFbbRqtsoNv3KewOcxQYRpeFSuVnR2JRNKeIWr5EVDFnz2XWBNhQufBholhGx1KseQwjaAZed9V-oKMi0Wr_cyV5sb2imTcT1RGhDqb2_pEAQuF8n3ghmLX3xtCT7lnkTs2EG8ivctjJBZfrnH6kWjseKxk2hMcn390BaG9lu" className="w-6 h-6 object-contain" alt="Home" />, label: 'Home' },
          { to: '/student/courses', icon: <School className="w-6 h-6" />, label: 'Courses' },
          { to: '/student/checkin', icon: <QrCode className="w-6 h-6" />, label: 'Check-in' },
          { to: '/student/analytics', icon: <BarChart className="w-6 h-6" />, label: 'History' },
          { to: '/student/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
        ];
      case 'lecturer':
        return [
          { to: '/lecturer', icon: <LayoutDashboard className="w-6 h-6" />, label: 'Home' },
          { to: '/lecturer/courses', icon: <BookOpen className="w-6 h-6" />, label: 'Courses' },
          { to: '/lecturer/live', icon: <QrCode className="w-6 h-6" />, label: 'Live' },
          { to: '/lecturer/risk', icon: <History className="w-6 h-6" />, label: 'Risk' },
          { to: '/lecturer/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: <LayoutGrid className="w-6 h-6" />, label: 'Dashboard' },
          { to: '/admin/users', icon: <Users className="w-6 h-6" />, label: 'Users' },
          { to: '/admin/reports', icon: <BarChart className="w-6 h-6" />, label: 'Reports' },
          { to: '/admin/more', icon: <Settings className="w-6 h-6" />, label: 'More' },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 pb-safe px-4 bg-surface-container dark:bg-surface-container-highest shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t border-outline-variant/30 z-50 rounded-t-xl">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/student' || link.to === '/lecturer' || link.to === '/admin'}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-in-out w-16",
              isActive ? "bg-secondary-container dark:bg-secondary-container text-on-secondary-container rounded-full px-5 py-1" : "text-on-surface-variant dark:text-outline-variant hover:text-primary"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn("mb-1", isActive && "text-on-secondary-container")}>{link.icon}</div>
              <span className={cn("font-label-md text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {link.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
