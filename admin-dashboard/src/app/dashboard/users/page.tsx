'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Search, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { RoleGuard } from '@/components/guards/RoleGuard';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  isActive: boolean;
  shopId: string | null;
}

interface Shop {
  id: string;
  name: {
    ru: string;
    uz: string;
    en: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'MANAGER',
    phone: '',
    shopId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data: any = await api.get('/admin/users');
      setUsers(data.data || data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const data: any = await api.get('/admin/shops');
      setShops(data.data || data || []);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        role: formData.role,
        phone: formData.phone || undefined,
        shopId: formData.shopId || undefined,
      });
      
      resetForm();
      setIsCreating(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await api.patch(`/admin/users/${editingId}`, {
        email: formData.email,
        name: formData.name || undefined,
        role: formData.role,
        phone: formData.phone || undefined,
        shopId: formData.shopId || undefined,
        isActive: formData.isActive,
      });
      
      resetForm();
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const startEdit = (user: UserData) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role,
      phone: user.phone || '',
      shopId: user.shopId || '',
      isActive: user.isActive,
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'MANAGER',
      phone: '',
      shopId: '',
      isActive: true,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus size={18} className="mr-2" />
              Add User
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+998901234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    required
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="BRANCH_DIRECTOR">Branch Director</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Shop/Branch
                  </label>
                  <select
                    value={formData.shopId}
                    onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="">No shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name.ru}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                New users will be created as active by default.
              </p>

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

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    {editingId === user.id ? (
                      // Edit Mode Row
                      <tr className="bg-accent-blue/5 dark:bg-accent-blue/10 border-b border-accent-blue/20">
                        <td colSpan={5} className="px-4 py-4">
                          <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <Input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                <Input
                                  value={formData.name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Full name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                <Input
                                  value={formData.phone}
                                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="+998901234567"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <select
                                  value={formData.role}
                                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                  required
                                >
                                  <option value="MANAGER">Manager</option>
                                  <option value="BRANCH_DIRECTOR">Branch Director</option>
                                  <option value="OWNER">Owner</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Shop</label>
                                <select
                                  value={formData.shopId}
                                  onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                >
                                  <option value="">No shop</option>
                                  {shops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                      {shop.name.ru}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="w-4 h-4 text-accent-blue rounded"
                                  />
                                  <span className="text-sm">Active</span>
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button type="submit" size="sm">
                                <Check size={14} className="mr-1" />
                                Save Changes
                              </Button>
                              <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>
                                <X size={14} className="mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      // View Mode Row
                      <tr className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                              <User size={20} className="text-accent-blue" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{user.name || 'No name'}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'OWNER' ? 'bg-accent-red/10 text-accent-red' :
                            user.role === 'BRANCH_DIRECTOR' ? 'bg-accent-amber/10 text-accent-amber' :
                            'bg-accent-blue/10 text-accent-blue'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.shopId ? shops.find(s => s.id === user.shopId)?.name.ru || 'Unknown' : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-accent-green/10 text-accent-green' 
                              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(user)}
                              className="p-2 rounded-lg text-accent-blue hover:bg-accent-blue/10 transition-colors"
                              title="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                              title="Deactivate user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !isCreating && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No users found matching your search.' : 'No users found. Click "Add User" to create one.'}
            </div>
          )}
        </Card>
      </div>
    </RoleGuard>
  );
}
