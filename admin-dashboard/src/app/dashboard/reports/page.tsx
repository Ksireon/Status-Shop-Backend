'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart, Download, Calendar } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';

export default function ReportsPage() {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportToCSV = () => {
    if (!stats) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', formatCurrency(stats.totalRevenue)],
      ['Recent Revenue (30 days)', formatCurrency(stats.recentRevenue)],
      ['Total Orders', stats.totalOrders],
      ['Recent Orders (30 days)', stats.recentOrders],
      ['Pending Orders', stats.pendingOrders],
      ...stats.ordersByStatus.map(s => [`Orders - ${s.status}`, s.count]),
      ...stats.topProducts.map((p, i) => [`Top Product ${i + 1} - ${p.name.ru}`, formatCurrency(p.totalRevenue)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `status-shop-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <RoleGuard requiredRole="BRANCH_DIRECTOR">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <Button variant="secondary" onClick={exportToCSV} disabled={!stats || isLoading}>
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-12 text-gray-500">Failed to load reports</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Revenue Overview" headerAction={
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Last 30 days</span>
              </div>
            }>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Total Revenue</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Revenue (Last 30 Days)</span>
                  <span className="text-xl font-semibold text-accent-blue">{formatCurrency(stats.recentRevenue)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Total Orders</span>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Orders (Last 30 Days)</span>
                  <span className="text-xl font-semibold text-accent-green">{stats.recentOrders}</span>
                </div>
              </div>
            </Card>

            <Card title="Orders by Status">
              <div className="space-y-4">
                {stats.ordersByStatus.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
                      <span className="text-sm text-gray-500">{item.count} orders</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-accent-blue h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Top Products by Revenue" className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Quantity Sold</th>
                      <th className="px-4 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((product, index) => (
                      <tr key={product.productId} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700">
                        <td className="px-4 py-3 font-medium">#{index + 1}</td>
                        <td className="px-4 py-3">{product.name.ru}</td>
                        <td className="px-4 py-3">{product.totalQuantity}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(product.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
