'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({
  children,
  className,
  padding = 'md',
  ...props
}: ResponsiveCardProps) {
  // Map padding sizes to Tailwind classes
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8 md:p-10',
  };

  return (
    <Card
      className={cn(paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </Card>
  );
}

interface ResponsiveCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardHeader({
  children,
  className,
  ...props
}: ResponsiveCardHeaderProps) {
  return (
    <CardHeader className={cn('px-0 pt-0', className)} {...props}>
      {children}
    </CardHeader>
  );
}

interface ResponsiveCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardTitle({
  children,
  className,
  ...props
}: ResponsiveCardTitleProps) {
  return (
    <CardTitle className={cn('text-lg sm:text-xl md:text-2xl', className)} {...props}>
      {children}
    </CardTitle>
  );
}

interface ResponsiveCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardDescription({
  children,
  className,
  ...props
}: ResponsiveCardDescriptionProps) {
  return (
    <CardDescription className={cn('text-sm sm:text-base', className)} {...props}>
      {children}
    </CardDescription>
  );
}

interface ResponsiveCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardContent({
  children,
  className,
  ...props
}: ResponsiveCardContentProps) {
  return (
    <CardContent className={cn('px-0', className)} {...props}>
      {children}
    </CardContent>
  );
}

interface ResponsiveCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCardFooter({
  children,
  className,
  ...props
}: ResponsiveCardFooterProps) {
  return (
    <CardFooter className={cn('px-0 pb-0 pt-4', className)} {...props}>
      {children}
    </CardFooter>
  );
}