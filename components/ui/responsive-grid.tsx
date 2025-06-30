'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
  className,
  ...props
}: ResponsiveGridProps) {
  // Map gap sizes to Tailwind classes with responsive adjustments
  const gapSizes = {
    none: '',
    xs: 'gap-1.5 sm:gap-2',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6 md:gap-6',
    lg: 'gap-6 sm:gap-8 md:gap-8',
    xl: 'gap-8 sm:gap-10 md:gap-12',
  };

  // Create responsive grid template columns
  const gridCols = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cn('grid', gridCols, gapSizes[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}