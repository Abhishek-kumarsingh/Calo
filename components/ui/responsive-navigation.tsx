'use client';

import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './button';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/logout-button';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { LoginButton } from '@/components/login-button';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent' | 'minimal';
  position?: 'static' | 'sticky';
}

export function ResponsiveNavigation({
  items,
  logo,
  actions,
  className,
  variant = 'default',
  position = 'static',
}: ResponsiveNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Variant styles
  const variantStyles = {
    default: 'bg-background border-b',
    transparent: 'bg-transparent',
    minimal: 'bg-background/50 backdrop-blur-sm border-b',
  };

  // Position styles
  const positionStyles = {
    static: '',
    sticky: 'sticky top-0 z-40',
  };

  return (
    <header className={cn(
      'w-full',
      variantStyles[variant],
      positionStyles[position],
      className
    )}>
      <div className="container-lg flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                item.isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted'
              )}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Actions (e.g., buttons) */}
        <div className="hidden md:flex items-center space-x-2">
          {actions}
          {session ? <ProfileDropdown /> : <LoginButton />}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container py-4 flex flex-col space-y-1">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                    item.isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 mt-2 border-t flex flex-col space-y-2">
                {actions}
                <div className="pt-2 mt-2 border-t">
                  {session ? (
                    <LogoutButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                    />
                  ) : (
                    <LoginButton
                      variant="default"
                      size="sm"
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}