'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  Users,
  UserCog,
  Building2,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  minRole: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, minRole: UserRole.MANAGER },
  { label: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, minRole: UserRole.MANAGER },
  { label: 'Products', href: '/dashboard/products', icon: Package, minRole: UserRole.BRANCH_DIRECTOR },
  { label: 'Categories', href: '/dashboard/categories', icon: FolderOpen, minRole: UserRole.OWNER },
  { label: 'Customers', href: '/dashboard/customers', icon: Users, minRole: UserRole.BRANCH_DIRECTOR },
  { label: 'Users', href: '/dashboard/users', icon: UserCog, minRole: UserRole.OWNER },
  { label: 'Branches', href: '/dashboard/branches', icon: Building2, minRole: UserRole.OWNER },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3, minRole: UserRole.BRANCH_DIRECTOR },
  { label: 'Support', href: '/dashboard/support', icon: MessageSquare, minRole: UserRole.BRANCH_DIRECTOR },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, minRole: UserRole.OWNER },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasRole, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) => hasRole(item.minRole as any));

  return (
    <aside className="w-64 bg-sidebar h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-dark">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Status Shop</h1>
            <p className="text-gray-400 text-xs">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-blue text-white'
                      : 'text-gray-400 hover:bg-sidebar-dark hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-dark">
        {user && (
          <div className="mb-4 px-4">
            <p className="text-white font-medium text-sm truncate">{user.name || user.email}</p>
            <p className="text-gray-400 text-xs capitalize">{user.role.toLowerCase()}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-sidebar-dark hover:text-accent-red transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
