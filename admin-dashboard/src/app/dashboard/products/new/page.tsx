'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Category } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
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
  images: { file?: File; url?: string; label: string; preview?: string }[];
}

export default function NewProductPage() {
  const router = useRouter();
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
    const fetchCategories = async () => {
      try {
        const data = await api.get<Category[]>('/admin/categories');
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, create the product without images
      const productPayload = {
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

      const product: any = await api.post('/admin/products', productPayload);
      const productId = product.id || product.data?.id;

      // Then upload images if any
      if (productId && formData.images.length > 0) {
        for (const image of formData.images) {
          if (image.file) {
            // Upload file using multipart/form-data
            const formDataUpload = new FormData();
            formDataUpload.append('image', image.file);
            formDataUpload.append('label', image.label || '');
            
            const uploadResponse = await fetch(`http://64.112.127.107:3000/api/v1/admin/products/${productId}/images/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: formDataUpload,
            });
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({ message: 'Upload failed' }));
              console.error('Image upload failed:', errorData);
            }
          } else if (image.url) {
            // Add URL-based image
            await api.post(`/admin/products/${productId}/images`, {
              url: image.url,
              label: image.label,
            });
          }
        }
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.message || 'Failed to create product');
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file: File, label: string) => {
    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { file, label, preview }],
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      // Revoke object URL to prevent memory leaks
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview!);
      }
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Product Images
            </label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              images={formData.images}
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button type="submit" isLoading={isLoading}>
              Create Product
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
