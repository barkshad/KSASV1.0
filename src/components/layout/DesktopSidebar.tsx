import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, School, BarChart, Calendar, Settings,
  BookOpen, Clock, Users, FileText, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DesktopSidebarProps {
  role: 'student' | 'lecturer' | 'admin';
  user: {
    name: string;
    id?: string;
    uid?: string;
    department?: string;
    avatar?: string;
    role?: string;
  };
}

function AvatarCircle({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-12 w-12 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0 border-2 border-primary-container`}>
      {initials}
    </div>
  );
}

export { AvatarCircle };

export function DesktopSidebar({ role, user }: DesktopSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const profilePath = `/${role}/profile`;
  const displayId = user.uid || user.id || '';

  const roleLabel = {
    student: 'Student',
    lecturer: 'Lecturer',
    admin: 'Administrator',
  }[role];

  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/student/courses', icon: <School className="w-5 h-5" />, label: 'My Courses' },
          { to: '/student/analytics', icon: <BarChart className="w-5 h-5" />, label: 'Attendance Reports' },
          { to: '/student/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Academic Calendar' },
          { to: '/student/profile', icon: <Settings className="w-5 h-5" />, label: 'Settings & Profile' },
        ];
      case 'lecturer':
        return [
          { to: '/lecturer', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/lecturer/courses', icon: <BookOpen className="w-5 h-5" />, label: 'My Courses' },
          { to: '/lecturer/risk', icon: <Clock className="w-5 h-5" />, label: 'Risk Monitor' },
          { to: '/lecturer/reports', icon: <BarChart className="w-5 h-5" />, label: 'Attendance Reports' },
          { to: '/lecturer/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Academic Calendar' },
          { to: '/lecturer/profile', icon: <Settings className="w-5 h-5" />, label: 'Settings & Profile' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
          { to: '/admin/academics', icon: <School className="w-5 h-5" />, label: 'Academics' },
          { to: '/admin/courses', icon: <BookOpen className="w-5 h-5" />, label: 'Courses' },
          { to: '/admin/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
          { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings & Profile' },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="hidden md:flex flex-col bg-surface text-on-surface h-full w-72 lg:w-80 rounded-r-2xl shadow-xl fixed left-0 top-0 z-40 border-r border-outline-variant/20">
      
      {/* Brand Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-outline-variant/20">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-on-primary" />
        </div>
        <div>
          <span className="font-bold text-xl text-primary tracking-tight">KSAS</span>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Kabarak Smart Attendance
          </p>
        </div>
      </div>

      {/* User Profile Snippet */}
      <button
        onClick={() => navigate(profilePath)}
        className="mx-4 mt-4 mb-2 flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors group text-left"
      >
        <AvatarCircle name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-on-surface truncate">{user.name}</p>
          <p className="text-xs text-on-surface-variant truncate">{displayId}</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
            {roleLabel}
          </span>
        </div>
      </button>

      <div className="mx-4 mb-3 border-b border-outline-variant/20" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/lecturer' || link.to === '/admin'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl mx-1 transition-colors duration-150',
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )
            }
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 pb-6 pt-2 border-t border-outline-variant/20 mt-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/20 transition-colors duration-150 font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
