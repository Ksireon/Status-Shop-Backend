'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Product, PaginatedResponse } from '@/lib/types';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.categoryId) params.append('categoryId', options.categoryId);
      if (options.search) params.append('search', options.search);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response: any = await api.get(`/admin/products${queryString}`);
      
      // Handle different response formats
      if (response && Array.isArray(response.data)) {
        setProducts(response.data);
        setMeta(response.meta || { total: response.data.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else if (response && response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setMeta(response.data.meta || { total: response.data.data.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else if (Array.isArray(response)) {
        setProducts(response);
        setMeta({ total: response.length, page: options.page || 1, limit: options.limit || 10, totalPages: 1 });
      } else {
        console.error('Unexpected response format:', response);
        setProducts([]);
        setError('Unexpected data format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.categoryId, options.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (productId: string) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      await fetchProducts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      return false;
    }
  };

  return {
    products,
    meta,
    isLoading,
    error,
    refetch: fetchProducts,
    deleteProduct,
  };
}
