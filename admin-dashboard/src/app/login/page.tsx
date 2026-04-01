'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Store } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Clear any stale auth data on login page load (only once)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login...', { email });
      const response = await api.login(email, password);
      console.log('Login successful:', response.user);
      
      // Use window.location for full page navigation to /dashboard
      console.log('Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-blue rounded-2xl mb-4 shadow-lg shadow-accent-blue/30">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Status Shop</h1>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-accent-red/20 border border-accent-red/30 text-accent-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all"
                placeholder="admin@status.uz"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg"
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Test accounts:
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-500 text-center">
              <p>owner@status.uz / Status_shop_owner123</p>
              <p>director@status.uz / Status_shop_director123</p>
              <p>manager@status.uz / Status_shop_manager123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
