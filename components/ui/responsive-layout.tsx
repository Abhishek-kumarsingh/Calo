'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ResponsiveLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  type?: 'stack' | 'sidebar' | 'split' | 'grid';
  reverse?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveLayout({
  children,
  className,
  type = 'stack',
  reverse = false,
  gap = 'md',
  ...props
}: ResponsiveLayoutProps) {
  // Map gap sizes to Tailwind classes
  const gapSizes = {
    none: '',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6 md:gap-8',
    lg: 'gap-6 sm:gap-8 md:gap-12',
    xl: 'gap-8 sm:gap-12 md:gap-16',
  };

  // Layout type classes
  const layoutClasses = {
    stack: 'flex flex-col',
    sidebar: 'flex flex-col lg:flex-row',
    split: 'flex flex-col sm:flex-row',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  // Reverse order if needed
  const reverseClasses = {
    stack: reverse ? 'flex-col-reverse' : '',
    sidebar: reverse ? 'flex-col-reverse lg:flex-row-reverse' : '',
    split: reverse ? 'flex-col-reverse sm:flex-row-reverse' : '',
    grid: '', // Grid doesn't support reverse directly
  };

  return (
    <div
      className={cn(
        layoutClasses[type],
        reverseClasses[type],
        gapSizes[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveLayoutItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  width?: 'auto' | '1/4' | '1/3' | '1/2' | '2/3' | '3/4' | 'full';
}

export function ResponsiveLayoutItem({
  children,
  className,
  width = 'auto',
  ...props
}: ResponsiveLayoutItemProps) {
  // Map width values to Tailwind classes with better mobile support
  const widthClasses = {
    auto: '',
    '1/4': 'w-full sm:w-1/2 lg:w-1/4',
    '1/3': 'w-full sm:w-1/2 lg:w-1/3',
    '1/2': 'w-full sm:w-1/2',
    '2/3': 'w-full lg:w-2/3',
    '3/4': 'w-full lg:w-3/4',
    full: 'w-full',
  };

  return (
    <div
      className={cn(widthClasses[width], className)}
      {...props}
    >
      {children}
    </div>
  );
}