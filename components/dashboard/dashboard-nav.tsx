"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DashboardNavProps {
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    role?: string;
  }[];
}

export function DashboardSidebar({ items }: DashboardNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";
  const [collapsed, setCollapsed] = useState(false);

  // Filter items based on user role
  const filteredItems = items.filter(item => !item.role || item.role === userRole);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-card border-r border-border shadow-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* User Profile */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex-shrink-0">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-primary">
              {session?.user?.name?.[0] || "U"}
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate">{session?.user?.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{session?.user?.email || ""}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}