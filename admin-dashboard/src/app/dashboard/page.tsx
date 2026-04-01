'use client';

import React, { useEffect, useState } from 'react';
import { DashboardHome } from '@/components/charts/DashboardHome';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/admin/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      <DashboardHome stats={stats} isLoading={isLoading} />
    </div>
  );
}
