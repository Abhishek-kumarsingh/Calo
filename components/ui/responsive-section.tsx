'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { ResponsiveContainer } from './responsive-container';

interface ResponsiveSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing?: 'none' | 'sm' | 'default' | 'lg';
  className?: string;
  containerClassName?: string;
  id?: string;
}

export function ResponsiveSection({
  children,
  containerSize = 'lg',
  spacing = 'default',
  className,
  containerClassName,
  id,
  ...props
}: ResponsiveSectionProps) {
  // Map spacing to Tailwind classes with improved responsive behavior
  const spacingClasses = {
    none: '',
    sm: 'section-spacing-sm',
    default: 'section-spacing',
    lg: 'py-10 sm:py-16 md:py-20 lg:py-28 xl:py-32',
  };

  return (
    <section
      id={id}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      <ResponsiveContainer size={containerSize} className={containerClassName}>
        {children}
      </ResponsiveContainer>
    </section>
  );
}