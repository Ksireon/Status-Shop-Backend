'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order, OrderStatusType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderStatusLabels, OrderStatusColors } from '@/lib/constants';
import { ArrowLeft, Package, User, MapPin, CreditCard, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const statusFlow: OrderStatusType[] = ['PENDING', 'PROCESSING', 'DELIVERING', 'COMPLETED'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasRole } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get<Order>(`/admin/orders/${params.id}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const updateStatus = async (newStatus: OrderStatusType) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getNextStatus = (currentStatus: OrderStatusType): OrderStatusType | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/dashboard/orders" className="text-accent-blue hover:underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);
  const canUpdateStatus = hasRole('MANAGER') && order.status !== 'CANCELED' && order.status !== 'COMPLETED';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/orders" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order #{order.shortId}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${OrderStatusColors[order.status]}`}>
          {OrderStatusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Order Items">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.productName.ru}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.productPrice)}
                      {item.color && ` · Color: ${item.color}`}
                      {item.meters && ` · ${item.meters}m`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-2xl font-bold text-accent-blue">{formatCurrency(order.total)}</span>
            </div>
          </Card>

          <Card title="Order Timeline">
            <div className="space-y-4">
              {statusFlow.map((status, index) => {
                const isCompleted = statusFlow.indexOf(order.status) >= index;
                const isCurrent = order.status === status;
                
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-accent-green text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                    }`}>
                      {isCompleted ? index + 1 : ''}
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrent ? 'text-accent-blue' : 'text-gray-900 dark:text-white'}`}>
                        {OrderStatusLabels[status]}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer Information">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Delivery Information">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.deliveryType === 'PICKUP' ? 'Pickup' : 'Delivery'}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={18} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.shop.name.ru}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Payment Information">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</p>
                <p className="text-sm text-gray-500">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </Card>

          {canUpdateStatus && nextStatus && (
            <Card title="Actions">
              <div className="space-y-3">
                <Button
                  onClick={() => updateStatus(nextStatus)}
                  isLoading={isUpdating}
                  className="w-full"
                >
                  Mark as {OrderStatusLabels[nextStatus]}
                </Button>
                {order.status !== 'CANCELED' && (
                  <Button
                    variant="danger"
                    onClick={() => updateStatus('CANCELED')}
                    isLoading={isUpdating}
                    className="w-full"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
