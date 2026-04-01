'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Product, Category } from '@/lib/types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormData {
  categoryId: string;
  type: 'textile' | 'vinyl' | 'bag';
  nameRu: string;
  nameUz: string;
  nameEn: string;
  descriptionRu: string;
  descriptionUz: string;
  descriptionEn: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  images: { url: string; label: string; id?: string }[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProductFormData>({
    categoryId: '',
    type: 'textile',
    nameRu: '',
    nameUz: '',
    nameEn: '',
    descriptionRu: '',
    descriptionUz: '',
    descriptionEn: '',
    price: 0,
    stockQuantity: 0,
    isActive: true,
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([
          api.get<Product>(`/admin/products/${productId}`),
          api.get<Category[]>('/admin/categories'),
        ]);
        
        setCategories(categoriesData);
        
        setFormData({
          categoryId: productData.categoryId,
          type: productData.type,
          nameRu: productData.name.ru || '',
          nameUz: productData.name.uz || '',
          nameEn: productData.name.en || '',
          descriptionRu: productData.description?.ru || '',
          descriptionUz: productData.description?.uz || '',
          descriptionEn: productData.description?.en || '',
          price: productData.price,
          stockQuantity: productData.stockQuantity,
          isActive: productData.isActive,
          images: productData.images?.map(img => ({ 
            url: img.url, 
            label: img.label || '', 
            id: img.id 
          })) || [],
        });
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load product data');
      } finally {
        setIsFetching(false);
      }
    };
    
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        categoryId: formData.categoryId,
        type: formData.type,
        name: {
          ru: formData.nameRu,
          uz: formData.nameUz,
          en: formData.nameEn,
        },
        description: {
          ru: formData.descriptionRu,
          uz: formData.descriptionUz,
          en: formData.descriptionEn,
        },
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        isActive: formData.isActive,
      };

      await api.patch(`/admin/products/${productId}`, payload);
      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setError(err.message || 'Failed to update product');
      setIsLoading(false);
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', label: '' }],
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageField = (index: number, field: 'url' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, [field]: value } : img),
    }));
  };

  const handleAddImage = async (index: number) => {
    const image = formData.images[index];
    if (!image.url.trim()) return;

    try {
      await api.post(`/admin/products/${productId}/images`, {
        url: image.url,
        label: image.label,
      });
      // Refresh product data
      const updatedProduct = await api.get<Product>(`/admin/products/${productId}`);
      setFormData(prev => ({
        ...prev,
        images: updatedProduct.images?.map(img => ({ 
          url: img.url, 
          label: img.label || '', 
          id: img.id 
        })) || [],
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to add image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/admin/product-images/${imageId}`);
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId),
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/products" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.ru}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                required
              >
                <option value="textile">Textile</option>
                <option value="vinyl">Vinyl</option>
                <option value="bag">Bag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name (Russian) *
            </label>
            <Input
              value={formData.nameRu}
              onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
              placeholder="Enter product name in Russian"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name (Uzbek)
              </label>
              <Input
                value={formData.nameUz}
                onChange={(e) => setFormData(prev => ({ ...prev, nameUz: e.target.value }))}
                placeholder="Enter product name in Uzbek"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name (English)
              </label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Enter product name in English"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Russian)
            </label>
            <textarea
              value={formData.descriptionRu}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionRu: e.target.value }))}
              placeholder="Enter description in Russian"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Uzbek)
              </label>
              <textarea
                value={formData.descriptionUz}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionUz: e.target.value }))}
                placeholder="Enter description in Uzbek"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                placeholder="Enter description in English"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (UZS) *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Quantity *
              </label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-accent-blue rounded border-gray-300 focus:ring-accent-blue"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button type="submit" isLoading={isLoading}>
              Update Product
            </Button>
            <Link href="/dashboard/products">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
