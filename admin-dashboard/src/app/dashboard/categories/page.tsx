'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Category } from '@/lib/types';
import { FolderOpen, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    nameRu: '',
    nameUz: '',
    nameEn: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Category[]>('/admin/categories');
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', {
        slug: formData.slug,
        name: {
          ru: formData.nameRu,
          uz: formData.nameUz,
          en: formData.nameEn,
        },
      });
      
      setFormData({ slug: '', nameRu: '', nameUz: '', nameEn: '' });
      setIsCreating(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await api.patch(`/admin/categories/${editingId}`, {
        slug: formData.slug,
        name: {
          ru: formData.nameRu,
          uz: formData.nameUz,
          en: formData.nameEn,
        },
      });
      
      setEditingId(null);
      setFormData({ slug: '', nameRu: '', nameUz: '', nameEn: '' });
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      slug: category.slug,
      nameRu: category.name.ru,
      nameUz: category.name.uz,
      nameEn: category.name.en,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ slug: '', nameRu: '', nameUz: '', nameEn: '' });
    setError(null);
  };

  if (isLoading) {
    return (
      <RoleGuard requiredRole="OWNER">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="OWNER">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus size={18} className="mr-2" />
              Add Category
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Category</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL identifier) *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., textile, vinyl, accessories"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (Russian) *
                  </label>
                  <Input
                    value={formData.nameRu}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
                    placeholder="Название"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (Uzbek)
                  </label>
                  <Input
                    value={formData.nameUz}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameUz: e.target.value }))}
                    placeholder="Nomi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (English)
                  </label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="Name"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit">
                  <Check size={16} className="mr-1" />
                  Create
                </Button>
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              {editingId === category.id ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slug
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={formData.nameRu}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
                      placeholder="Russian"
                      required
                    />
                    <Input
                      value={formData.nameUz}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameUz: e.target.value }))}
                      placeholder="Uzbek"
                    />
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      placeholder="English"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm">
                      <Check size={14} className="mr-1" />
                      Save
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent-blue/10 rounded-lg">
                        <FolderOpen size={24} className="text-accent-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category.name.ru}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Translations:</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">RU: {category.name.ru}</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">UZ: {category.name.uz}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>

        {categories.length === 0 && !isCreating && (
          <div className="text-center py-12 text-gray-500">
            No categories found. Click "Add Category" to create one.
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
