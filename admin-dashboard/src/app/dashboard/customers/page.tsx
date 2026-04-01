'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { RoleGuard } from '@/components/guards/RoleGuard';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isActive: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('role', 'USER');
        params.append('page', page.toString());
        params.append('limit', '10');
        if (search) params.append('q', search);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        console.log('Fetching customers:', `/admin/users${queryString}`);
        
        const response: any = await api.get(`/admin/users${queryString}`);
        console.log('Customers response:', response);
        
        // Handle different response formats
        if (response && Array.isArray(response.data)) {
          setCustomers(response.data);
          setMeta(response.meta || { total: response.data.length, page: 1, limit: 10, totalPages: 1 });
        } else if (response && response.data && Array.isArray(response.data.data)) {
          // Double wrapped response
          setCustomers(response.data.data);
          setMeta(response.data.meta || { total: response.data.data.length, page: 1, limit: 10, totalPages: 1 });
        } else if (Array.isArray(response)) {
          // Direct array response
          setCustomers(response);
          setMeta({ total: response.length, page: 1, limit: 10, totalPages: 1 });
        } else {
          console.error('Unexpected response format:', response);
          setError('Unexpected data format from server');
          setCustomers([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch customers:', err);
        setError(err.message || 'Failed to fetch customers');
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, search]);

  if (isLoading) {
    return (
      <RoleGuard requiredRole="BRANCH_DIRECTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard requiredRole="BRANCH_DIRECTOR">
        <div className="text-center py-12">
          <p className="text-accent-red mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="BRANCH_DIRECTOR">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        </div>

        <Card>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                            <User size={20} className="text-accent-blue" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{customer.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{customer.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-accent-green/10 text-accent-green' 
                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500">
                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} customers
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
        </Card>
      </div>
    </RoleGuard>
  );
}
