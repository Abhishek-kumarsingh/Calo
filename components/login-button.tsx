'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

export function LoginButton({
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
}: LoginButtonProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogin}
    >
      {showIcon && <LogIn className="h-4 w-4 mr-2" />}
      Sign in
    </Button>
  );
}
