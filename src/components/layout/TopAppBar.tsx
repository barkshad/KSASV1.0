import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface TopAppBarProps {
  role: 'student' | 'lecturer' | 'admin';
  user: {
    name?: string;
    avatar?: string;
  };
  title?: string;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function TopAppBar({ role, user, title = 'KSAS' }: TopAppBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const profilePath = `/${role}/profile`;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-surface/95 backdrop-blur-md shadow-sm sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 w-full border-b border-outline-variant/20">

      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center md:hidden">
            <ShieldCheck className="w-5 h-5 text-on-primary" />
          </div>
          <div className="hidden md:block">
            {/* On desktop the sidebar shows branding, so just show page context */}
          </div>
          <span className="font-bold text-primary text-lg md:text-xl tracking-tight md:hidden">KSAS</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={cn(
              'flex items-center gap-2 ml-1 rounded-full transition-colors',
              menuOpen ? 'bg-surface-container' : 'hover:bg-surface-container'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center border-2 border-primary-container">
              {getInitials(user?.name)}
            </div>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">
                <p className="font-bold text-on-surface text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-on-surface-variant capitalize">{role}</p>
              </div>

              {/* Profile */}
              <button
                onClick={() => { navigate(profilePath); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
              >
                <User className="w-4 h-4 text-on-surface-variant" />
                Profile & Settings
              </button>

              {/* Logout */}
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors text-left font-bold border-t border-outline-variant/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
