i didn'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import Link from 'next/link';
import { ResponsiveContainer } from './responsive-container';

interface FooterColumn {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

interface ResponsiveFooterProps {
  logo?: React.ReactNode;
  columns?: FooterColumn[];
  bottomText?: React.ReactNode;
  className?: string;
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'minimal' | 'centered';
}

export function ResponsiveFooter({
  logo,
  columns = [],
  bottomText,
  className,
  containerSize = 'lg',
  variant = 'default',
}: ResponsiveFooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Variant styles
  const variantStyles = {
    default: '',
    minimal: 'py-6',
    centered: 'text-center',
  };
  
  // Column layout based on variant
  const columnLayout = {
    default: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8',
    minimal: 'flex flex-col sm:flex-row justify-between items-start sm:items-center',
    centered: 'flex flex-col items-center',
  };

  return (
    <footer className={cn(
      'bg-muted/30 border-t',
      variantStyles[variant],
      className
    )}>
      <ResponsiveContainer size={containerSize}>
        {variant === 'default' && (
          <>
            <div className="py-12">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                {/* Logo and description */}
                <div className="md:max-w-xs">
                  {logo}
                  <p className="mt-4 text-sm text-muted-foreground">
                    InterviewAI helps you streamline your hiring process with AI-powered interviews and analytics.
                  </p>
                </div>
                
                {/* Footer columns */}
                <div className={columnLayout.default}>
                  {columns.map((column, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="font-medium text-sm">{column.title}</h4>
                      <ul className="space-y-2">
                        {column.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link 
                              href={link.href}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom bar */}
            <div className="py-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {currentYear} InterviewAI. All rights reserved.
              </p>
              {bottomText}
            </div>
          </>
        )}
        
        {variant === 'minimal' && (
          <div className={columnLayout.minimal}>
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              {logo}
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 sm:mb-0">
              {columns.flatMap(column => column.links).map((link, index) => (
                <Link 
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {currentYear} InterviewAI
            </p>
          </div>
        )}
        
        {variant === 'centered' && (
          <div className="py-8">
            <div className={columnLayout.centered}>
              <div className="mb-6">
                {logo}
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
                {columns.flatMap(column => column.links).map((link, index) => (
                  <Link 
                    key={index}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                © {currentYear} InterviewAI. All rights reserved.
              </p>
              
              {bottomText && (
                <div className="mt-4">
                  {bottomText}
                </div>
              )}
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </footer>
  );
}