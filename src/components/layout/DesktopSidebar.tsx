import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, School, BarChart, Calendar, Settings, BookOpen, Clock, Users, FileText } from 'lucide-react';

interface DesktopSidebarProps {
  role: 'student' | 'lecturer' | 'admin';
  user: {
    name: string;
    id: string;
    department: string;
    avatar: string;
  };
}

export function DesktopSidebar({ role, user }: DesktopSidebarProps) {
  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/student/courses', icon: <School className="w-5 h-5" />, label: 'My Courses' },
          { to: '/student/analytics', icon: <BarChart className="w-5 h-5" />, label: 'Attendance Reports' },
          { to: '/student/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Academic Calendar' },
          { to: '/student/profile', icon: <Settings className="w-5 h-5" />, label: 'Settings', bottom: true },
        ];
      case 'lecturer':
        return [
          { to: '/lecturer', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/lecturer/courses', icon: <BookOpen className="w-5 h-5" />, label: 'My Courses' },
          { to: '/lecturer/risk', icon: <Clock className="w-5 h-5" />, label: 'Risk Monitor' },
          { to: '/lecturer/reports', icon: <BarChart className="w-5 h-5" />, label: 'Attendance Reports' },
          { to: '/lecturer/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Academic Calendar' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
          { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
          { to: '/admin/academics', icon: <School className="w-5 h-5" />, label: 'Academics' },
          { to: '/admin/courses', icon: <BookOpen className="w-5 h-5" />, label: 'Courses' },
          { to: '/admin/reports', icon: <FileText className="w-5 h-5" />, label: 'Reports' },
          { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', bottom: true },
        ];
    }
  };

  const links = getLinks();
  const topLinks = links.filter((l) => !l.bottom);
  const bottomLinks = links.filter((l) => l.bottom);

  return (
    <aside className="hidden md:flex flex-col py-lg space-y-base bg-surface text-on-surface h-full w-72 lg:w-80 rounded-r-xl shadow-xl fixed left-0 top-0 z-40 overflow-y-auto border-r border-outline-variant/20">
      <div className="px-gutter mb-xl flex items-center gap-sm">
        <img
          src="https://lh3.googleusercontent.com/aida/AP1WRLu2mQve9UxRQsu0A1RfcBO5LGyq7zz6UXNQRNchp0aCKPz2ZDZFrIqz9WBmoZPRT9IilfmfPwkT40GZnjgD1N7oQ3dLCt3lFGbCkTF2TMjvSL1JiX1HEVCD-QEfFfmLUaFX-AEHkWbavE42ktf3TV1dwwdRJg2EdjTWgWPPrhrEK_e4Bbog9er7FSUOT9HQf0wlbWh2O0y1-s-_lEcIKERN9LG9-1Jp7iPQlH4N8wsNKfC5XKgp4SJqO0R6"
          alt="KSAS Logo"
          className="h-10 w-auto object-contain"
        />
        <div className="flex flex-col">
           <span className="font-title-lg font-bold text-primary">KSAS</span>
           {role === 'admin' && <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Admin Central</span>}
        </div>
      </div>

      <div className="px-gutter flex items-center gap-md mb-xl border-b border-outline-variant/20 pb-md">
        <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-primary-container">
          <img src={user.avatar} className="h-full w-full object-cover" alt={user.name} />
        </div>
        <div>
          <p className="font-bold text-on-surface">{user.name}</p>
          <p className="font-body-sm text-on-surface-variant">{user.id}</p>
          <p className="font-label-md text-secondary mt-1">{user.department}</p>
        </div>
      </div>

      <nav className="flex-1 px-sm space-y-1">
        {topLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/lecturer' || link.to === '/admin'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-md px-md py-3 rounded-lg mx-2 transition-colors duration-200",
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant"
              )
            }
          >
            {link.icon}
            <span className="font-body-md">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {bottomLinks.length > 0 && (
        <div className="px-sm pb-lg mt-auto pt-md border-t border-outline-variant/20">
          {bottomLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-md px-md py-3 rounded-lg mx-2 transition-colors duration-200",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant"
                )
              }
            >
              {link.icon}
              <span className="font-body-md">{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
}
