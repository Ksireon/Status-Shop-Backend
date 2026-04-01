'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/lib/types';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const { hasRole } = useAuth();
  const canEdit = hasRole('BRANCH_DIRECTOR');
  const canDelete = hasRole('OWNER');

  const { products, meta, isLoading, error, deleteProduct } = useProducts({
    page,
    limit: 10,
    categoryId,
    search,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<Category[]>('/admin/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name.ru}"?`)) {
      return;
    }
    await deleteProduct(product.id);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        {canEdit && (
          <Link href="/dashboard/products/new">
            <Button>
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary">
              <Search size={18} />
            </Button>
          </form>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.ru}
              </option>
            ))}
          </select>
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
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name.ru}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name.ru}</p>
                            <p className="text-xs text-gray-500">{product.name.uz}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{product.type}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">{product.stockQuantity}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.isActive ? 'success' : 'default'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Link
                              href={`/dashboard/products/${product.id}`}
                              className="p-2 rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                            >
                              <Edit size={16} />
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">No products found</div>
            )}

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * meta.limit + 1} to {Math.min(page * meta.limit, meta.total)} of {meta.total} products
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
