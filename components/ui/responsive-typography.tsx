'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function ResponsiveH1({ children, className, as: Component = 'h1', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('heading-xl text-wrap-balance', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ResponsiveH2({ children, className, as: Component = 'h2', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('heading-lg text-wrap-balance', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ResponsiveH3({ children, className, as: Component = 'h3', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('heading-md text-wrap-balance', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ResponsiveH4({ children, className, as: Component = 'h4', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('heading-sm text-wrap-balance', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ResponsiveParagraph({ children, className, as: Component = 'p', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('text-base sm:text-lg leading-relaxed mb-4 sm:mb-6', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ResponsiveText({ children, className, as: Component = 'span', ...props }: TypographyProps) {
  return (
    <Component
      className={cn('text-sm sm:text-base leading-normal', className)}
      {...props}
    >
      {children}
    </Component>
  );
}