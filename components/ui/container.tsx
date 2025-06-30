'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'small' | 'large' | 'full';
}

export function Container({
  children,
  className,
  size = 'default',
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 md:px-8 lg:px-12',
        {
          'max-w-screen-xl': size === 'default',
          'max-w-screen-lg': size === 'small',
          'max-w-screen-2xl': size === 'large',
          'w-full': size === 'full',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}