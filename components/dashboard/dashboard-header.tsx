"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { dashboardConfig } from "@/config/dashboard";

export function DashboardHeader() {
  const pathname = usePathname();
  
  // Find the current page title from the navigation items
  const currentPage = dashboardConfig.sidebarNav.find(
    item => pathname === item.href || pathname?.startsWith(item.href + "/")
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>InterviewAI</span>
          </Link>
          <div className="hidden md:block ml-4">
            <h1 className="font-medium text-lg">
              {currentPage?.title || "Dashboard"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}