import React from 'react';
import { Menu, Bell, Search, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TopAppBarProps {
  role: 'student' | 'lecturer' | 'admin';
  user: {
    avatar: string;
    abbr?: string;
  };
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopAppBar({ role, user, title = 'KSAS', showBack, onBack }: TopAppBarProps) {
  return (
    <header className="bg-surface/90 backdrop-blur-md shadow-sm sticky top-0 z-30 flex items-center justify-between px-margin-mobile md:px-gutter h-16 w-full border-b border-outline-variant/20">
      <div className="flex items-center gap-md">
        {showBack ? (
          <button 
            onClick={onBack}
            className="md:hidden text-on-surface-variant hover:bg-surface-variant/50 transition-colors p-2 rounded-full active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <button className="md:hidden text-primary hover:bg-surface-variant/50 transition-colors p-2 -ml-2 rounded-full active:scale-95 duration-200">
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <div className="w-8 h-8 bg-primary rounded-md hidden sm:flex items-center justify-center">
              <Shield className="w-5 h-5 text-on-primary" />
            </div>
          )}
          <h1 className="font-headline-md font-bold text-primary tracking-tight">
            {title}
            {role === 'admin' && title === 'KSAS' && <span className="font-normal text-on-surface-variant ml-2 hidden sm:inline">Admin</span>}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-md">
        {role === 'admin' && (
           <div className="hidden lg:flex items-center bg-surface-container rounded-full px-sm py-1.5 border border-outline-variant/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all w-64">
              <Search className="w-4 h-4 text-on-surface-variant mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 p-0 text-body-sm w-full text-on-surface placeholder:text-on-surface-variant" />
           </div>
        )}
        <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative active:scale-95 duration-200">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
        </button>
        
        {role === 'admin' && <div className="h-8 w-px bg-outline-variant/30 hidden sm:block mx-1"></div>}
        
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-variant flex items-center justify-center text-primary-container font-bold text-sm">
          {user.avatar ? (
            <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
          ) : (
             user.abbr || 'U'
          )}
        </div>
      </div>
    </header>
  );
}
