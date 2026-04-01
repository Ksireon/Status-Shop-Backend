'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusLabels, OrderStatusColors, OrderStatus } from '@/lib/constants';
import { Order, OrderStatusType } from '@/lib/types';
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'DELIVERING', label: 'Delivering' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatusType | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { orders, meta, isLoading, error } = useOrders({
    page,
    limit: 10,
    status,
    search,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Search by order ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">
              <Search size={18} />
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatusType | '');
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-accent-red">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-4 py-3 font-medium">#{order.shortId}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.user.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${OrderStatusColors[order.status]}`}>
                          {OrderStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-accent-blue hover:underline"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">No orders found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * meta.limit + 1} to {Math.min(page * meta.limit, meta.total)} of {meta.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {meta.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={page === meta.totalPages}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
