'use client';

import { forwardRef } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  (
    {
      variant = 'outline',
      size = 'default',
      className = '',
      showIcon = true,
      iconOnly = false,
    },
    ref
  ) => {
    const handleLogout = async () => {
      await signOut({ callbackUrl: '/auth/login' });
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        onClick={handleLogout}
      >
        {showIcon && <LogOut className={`h-4 w-4 ${!iconOnly ? 'mr-2' : ''}`} />}
        {!iconOnly && 'Sign out'}
      </Button>
    );
  }
);
