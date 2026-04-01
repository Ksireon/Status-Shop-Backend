'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardStats, Order } from '@/lib/types';
import { OrderStatusLabels, OrderStatusColors, OrderStatus } from '@/lib/constants';
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-accent-blue/10 rounded-lg">
          <Icon size={24} className="text-accent-blue" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp size={16} className="text-accent-green" />
          ) : (
            <TrendingDown size={16} className="text-accent-red" />
          )}
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {trend.value}%
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      )}
    </Card>
  );
}

interface DashboardHomeProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export function DashboardHome({ stats, isLoading }: DashboardHomeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          subtitle={`+${formatCurrency(stats.recentRevenue)} this month`}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          subtitle={`${stats.recentOrders} this month`}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Package}
        />
        {stats.totalCustomers !== undefined && (
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
          />
        )}
        {stats.totalProducts !== undefined && (
          <StatCard
            title="Active Products"
            value={stats.totalProducts}
            icon={Package}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders by Status">
          <div className="space-y-3">
            {stats.ordersByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      item.status === 'COMPLETED' ? 'success' :
                      item.status === 'CANCELED' ? 'danger' :
                      item.status === 'PENDING' ? 'warning' :
                      'info'
                    }
                  >
                    {OrderStatusLabels[item.status]}
                  </Badge>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Products">
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name.ru}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.totalQuantity} sold
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(product.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Orders" headerAction={
        <Link href="/dashboard/orders" className="text-accent-blue hover:underline text-sm">
          View all
        </Link>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestOrders.map((order) => (
                <tr key={order.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium">#{order.shortId}</td>
                  <td className="px-4 py-3">{order.user.name || order.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${OrderStatusColors[order.status]}`}>
                      {OrderStatusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
