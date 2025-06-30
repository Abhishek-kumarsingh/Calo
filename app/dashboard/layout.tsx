'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { logSystemEvent } from '@/lib/logger';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      logSystemEvent({
        action: 'unauthorized_access_attempt',
        category: 'auth',
        details: { path: window.location.pathname },
        severity: 'warning'
      });
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ErrorBoundary>
        <nav className="hidden md:flex w-64 p-4 border-r border-border">
          {/* Navigation content */}
        </nav>

        <div className="flex-1 flex flex-col min-h-screen">
          <ErrorBoundary>
            <header className="h-16 border-b border-border px-4 flex items-center justify-between">
              {/* Header content */}
            </header>

            <main className="flex-1 p-4 overflow-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  );
}