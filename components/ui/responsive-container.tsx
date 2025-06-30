'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: React.ElementType;
}

export function ResponsiveContainer({
  children,
  className,
  size = 'lg',
  as: Component = 'div',
  ...props
}: ResponsiveContainerProps) {
  const containerClass = size === 'full' 
    ? 'w-full px-4 sm:px-6 md:px-8 lg:px-12'
    : `container-${size}`;
    
  return (
    <Component
      className={cn(containerClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
}