'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Shield, Database, Server, Mail } from 'lucide-react';

export default function SettingsPage() {
  return (
    <RoleGuard requiredRole="OWNER">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="System Information">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Server size={20} className="text-accent-blue" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">API Status</p>
                  <p className="text-sm text-accent-green">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Database size={20} className="text-accent-blue" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Database</p>
                  <p className="text-sm text-gray-500">PostgreSQL 15</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Shield size={20} className="text-accent-blue" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Security</p>
                  <p className="text-sm text-gray-500">JWT Authentication</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Application Settings">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value="Status Shop"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Support Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    type="email"
                    value="support@status.uz"
                    disabled
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Language
                </label>
                <select
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                >
                  <option>Russian</option>
                  <option>Uzbek</option>
                  <option>English</option>
                </select>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 mb-4">
                To modify these settings, please update the configuration files on the server.
              </p>
              <Button variant="secondary" disabled>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
