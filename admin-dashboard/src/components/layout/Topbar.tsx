'use client';

import React from 'react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Topbar() {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDark).toString());
  };

  React.useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'Admin'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
            <User size={20} className="text-accent-blue" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
