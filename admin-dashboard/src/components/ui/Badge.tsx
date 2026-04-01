import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200',
    primary: 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20',
    success: 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20',
    warning: 'bg-accent-amber/10 text-accent-amber dark:bg-accent-amber/20',
    danger: 'bg-accent-red/10 text-accent-red dark:bg-accent-red/20',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
