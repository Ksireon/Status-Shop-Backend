'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shop } from '@/lib/types';
import { Building2, MapPin, Phone, Clock, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';

export default function BranchesPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    key: '',
    nameRu: '',
    nameUz: '',
    nameEn: '',
    city: '',
    address: '',
    phone: '',
    hours: '',
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data: any = await api.get('/admin/shops');
      setShops(data.data || data || []);
    } catch (err: any) {
      console.error('Failed to fetch shops:', err);
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/shops', {
        key: formData.key,
        name: {
          ru: formData.nameRu,
          uz: formData.nameUz,
          en: formData.nameEn,
        },
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        hours: formData.hours,
      });
      
      resetForm();
      setIsCreating(false);
      fetchShops();
    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await api.patch(`/admin/shops/${editingId}`, {
        key: formData.key,
        name: {
          ru: formData.nameRu,
          uz: formData.nameUz,
          en: formData.nameEn,
        },
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        hours: formData.hours,
      });
      
      resetForm();
      setEditingId(null);
      fetchShops();
    } catch (err: any) {
      setError(err.message || 'Failed to update branch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      await api.delete(`/admin/shops/${id}`);
      fetchShops();
    } catch (err: any) {
      setError(err.message || 'Failed to delete branch');
    }
  };

  const startEdit = (shop: Shop) => {
    setEditingId(shop.id);
    setFormData({
      key: shop.key,
      nameRu: shop.name.ru,
      nameUz: shop.name.uz,
      nameEn: shop.name.en,
      city: shop.city,
      address: shop.address,
      phone: shop.phone,
      hours: shop.hours,
    });
  };

  const resetForm = () => {
    setFormData({
      key: '',
      nameRu: '',
      nameUz: '',
      nameEn: '',
      city: '',
      address: '',
      phone: '',
      hours: '',
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
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

  return (
    <RoleGuard requiredRole="BRANCH_DIRECTOR">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branches</h1>
          <RoleGuard requiredRole="OWNER">
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus size={18} className="mr-2" />
                Add Branch
              </Button>
            )}
          </RoleGuard>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Create Form */}
        {isCreating && (
          <RoleGuard requiredRole="OWNER">
            <Card className="mb-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Branch</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key (unique identifier) *
                    </label>
                    <Input
                      value={formData.key}
                      onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g., main, branch1, south"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Tashkent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch Name (Russian) *
                  </label>
                  <Input
                    value={formData.nameRu}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
                    placeholder="e.g., Главный филиал"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch Name (Uzbek)
                    </label>
                    <Input
                      value={formData.nameUz}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameUz: e.target.value }))}
                      placeholder="e.g., Asosiy filial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch Name (English)
                    </label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      placeholder="e.g., Main Branch"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g., Tashkent, Example street 1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., +998901234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Working Hours *
                    </label>
                    <Input
                      value={formData.hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="e.g., 10:00-20:00"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit">
                    <Check size={16} className="mr-1" />
                    Create Branch
                  </Button>
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </RoleGuard>
        )}

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id}>
              {editingId === shop.id ? (
                <RoleGuard requiredRole="OWNER">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Key</label>
                        <Input
                          value={formData.key}
                          onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name (RU)</label>
                      <Input
                        value={formData.nameRu}
                        onChange={(e) => setFormData(prev => ({ ...prev, nameRu: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={formData.nameUz}
                        onChange={(e) => setFormData(prev => ({ ...prev, nameUz: e.target.value }))}
                        placeholder="Name (UZ)"
                      />
                      <Input
                        value={formData.nameEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                        placeholder="Name (EN)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                        required
                      />
                      <Input
                        value={formData.hours}
                        onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                        placeholder="Hours"
                        required
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
                </RoleGuard>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent-blue/10 rounded-lg">
                        <Building2 size={24} className="text-accent-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{shop.name.ru}</h3>
                        <p className="text-sm text-gray-500">Key: {shop.key}</p>
                      </div>
                    </div>
                    <RoleGuard requiredRole="OWNER">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => startEdit(shop)}
                          className="p-2 rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(shop.id)}
                          className="p-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </RoleGuard>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{shop.city}, {shop.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span>{shop.hours}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shop.isActive 
                        ? 'bg-accent-green/10 text-accent-green' 
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                    }`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>

        {shops.length === 0 && !isCreating && (
          <div className="text-center py-12 text-gray-500">
            No branches found. Click "Add Branch" to create one.
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
