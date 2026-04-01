'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Order, OrderStatusType, PaginatedResponse } from '@/lib/types';

interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: OrderStatusType | '';
  search?: string;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response: any = await api.get(`/admin/orders${queryString}`);
      
      // Handle different response formats
      if (response && Array.isArray(response.data)) {
        setOrders(response.data);
        setMeta(response.meta || { total: response.data.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else if (response && response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
        setMeta(response.data.meta || { total: response.data.data.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else if (Array.isArray(response)) {
        setOrders(response);
        setMeta({ total: response.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else {
        console.error('Unexpected response format:', response);
        setOrders([]);
        setError('Unexpected data format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.status, options.search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: OrderStatusType) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      await fetchOrders();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      return false;
    }
  };

  return {
    orders,
    meta,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
  };
}
