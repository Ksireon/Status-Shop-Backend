'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { Order, OrderStatusType } from '@/lib/types';
import { OrderStatusLabels, OrderStatusColors } from '@/lib/constants';
import { RoleGuard } from '@/components/guards/RoleGuard';

interface CustomerDetail {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  company: string | null;
  position: string | null;
  isActive: boolean;
  createdAt: string;
  orders: Order[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user details
        const userData: any = await api.get(`/admin/users/${customerId}`);
        
        // Fetch user's orders
        const ordersData: any = await api.get(`/admin/orders?userId=${customerId}`);
        
        setCustomer({
          ...userData,
          orders: ordersData.data || ordersData || [],
        });
      } catch (err: any) {
        console.error('Failed to fetch customer details:', err);
        setError(err.message || 'Failed to fetch customer details');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalSpent = () => {
    if (!customer?.orders) return 0;
    return customer.orders
      .filter(order => order.status !== 'CANCELED')
      .reduce((sum, order) => sum + order.total, 0);
  };

  const getOrderCount = () => {
    return customer?.orders?.length || 0;
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="BRANCH_DIRECTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </RoleGuard>
    );
  }

  if (error || !customer) {
    return (
      <RoleGuard requiredRole="BRANCH_DIRECTOR">
        <div className="text-center py-12">
          <p className="text-accent-red mb-4">{error || 'Customer not found'}</p>
          <Link href="/dashboard/customers">
            <Button>Back to Customers</Button>
          </Link>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="BRANCH_DIRECTOR">
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/customers" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-accent-blue" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {customer.name || 'Unknown Customer'}
                </h2>
                <p className="text-gray-500">{customer.email}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customer.isActive 
                      ? 'bg-accent-green/10 text-accent-green' 
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                  }`}>
                    {customer.isActive ? 'Active Customer' : 'Inactive Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 dark:border-slate-700 pt-4">
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.city && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.city}</p>
                    </div>
                  </div>
                )}

                {customer.company && (
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.company}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-accent-blue">{getOrderCount()}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-accent-green">{formatCurrency(getTotalSpent())}</p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <Card title="Order History">
              {customer.orders && customer.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Items</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-4 py-3 font-medium">
                            #{order.shortId || order.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              OrderStatusColors[order.status as OrderStatusType]
                            }`}>
                              {OrderStatusLabels[order.status as OrderStatusType]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.items?.length || 0} items
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-4 py-3">
                            <Link 
                              href={`/dashboard/orders/${order.id}`}
                              className="text-accent-blue hover:underline text-sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                  <p className="text-gray-500">No orders found for this customer</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
