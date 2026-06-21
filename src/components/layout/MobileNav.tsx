import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  BookOpen,
  History,
  School,
  User,
  QrCode,
  BarChart,
  Settings,
  LayoutDashboard,
  LayoutGrid,
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileNavProps {
  role: 'student' | 'lecturer' | 'admin';
}

export function MobileNav({ role }: MobileNavProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student', icon: <LayoutDashboard className="w-6 h-6" />, label: 'Home' },
          { to: '/student/courses', icon: <School className="w-6 h-6" />, label: 'Courses' },
          { to: '/student/checkin', icon: <QrCode className="w-6 h-6" />, label: 'Check-In' },
          { to: '/student/analytics', icon: <BarChart className="w-6 h-6" />, label: 'Reports' },
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
          { to: '/admin/courses', icon: <BookOpen className="w-6 h-6" />, label: 'Courses' },
          { to: '/admin/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant/30 z-50 h-20 flex justify-around items-center px-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/student' || link.to === '/lecturer' || link.to === '/admin'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center w-16 text-[10px]',
              isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant'
            )
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center w-16 text-error text-[10px]"
      >
        <LogOut className="w-6 h-6" />
        <span>Logout</span>
      </button>
    </nav>
  );
}
