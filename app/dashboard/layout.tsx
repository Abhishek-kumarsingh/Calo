'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { logSystemEvent } from '@/lib/logger';
import { ResponsiveNavigation } from '@/components/ui/responsive-navigation';
import { Sparkles } from 'lucide-react';

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
        {/* Mobile Navbar */}
        {(() => {
          const dashboardConfig = require("@/config/dashboard").dashboardConfig;
          const { usePathname } = require('next/navigation');
          const pathname = usePathname();
          // Map sidebarNav to ResponsiveNavigation items
          const items = dashboardConfig.sidebarNav.map((item: { title: string; href: string; icon: React.ComponentType<{ className?: string }>; role?: string }) => ({
            label: item.title,
            href: item.href,
            icon: React.createElement(item.icon, { className: 'h-5 w-5' }),
            isActive: pathname === item.href || pathname?.startsWith(item.href + "/"),
            role: item.role,
          }));
          // Filter by role if session exists
          const userRole = session?.user?.role || "user";
          const filteredItems = items.filter((item: { role?: string }) => !item.role || item.role === userRole);
          return (
            <div className="md:hidden w-full">
              <ResponsiveNavigation
                items={filteredItems}
                logo={<span className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-primary" />InterviewAI</span>}
                position="sticky"
              />
            </div>
          );
        })()}
        {/* Sidebar for desktop */}
        <nav className="hidden md:flex w-64 p-4 border-r border-border bg-card">
          {/* Sidebar navigation */}
          {(() => {
            const DashboardNav = require("@/components/dashboard/dashboard-nav").DashboardNav;
            const dashboardConfig = require("@/config/dashboard").dashboardConfig;
            return <DashboardNav items={dashboardConfig.sidebarNav} />;
          })()}
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