'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw',
  priority = false,
  quality = 85,
  fill = false,
  objectFit = 'cover',
  rounded = 'none',
  ...props
}: ResponsiveImageProps) {
  // Map rounded values to Tailwind classes
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Map object-fit values to Tailwind classes
  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  return (
    <div className={cn('relative', fill && 'w-full h-full', className)}>
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        quality={quality}
        fill={fill}
        className={cn(
          objectFitClasses[objectFit],
          roundedClasses[rounded],
          'transition-opacity duration-300'
        )}
        {...props}
      />
    </div>
  );
}