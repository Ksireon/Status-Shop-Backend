'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRoleType } from '@/lib/constants';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRoleType;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasRole(requiredRole)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
