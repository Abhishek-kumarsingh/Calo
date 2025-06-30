"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  User,
  HelpCircle,
  FileText,
  MessageSquare,
  Shield,
  Database,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    console.log("Admin layout - Session status:", status);
    console.log("Admin layout - User role:", session?.user?.role);

    // Only redirect if the session is fully loaded (not loading)
    if (status !== "loading") {
      if (status === "unauthenticated") {
        console.log("Admin layout - User is not authenticated, redirecting to login");
        router.push("/auth/login");
      } else if (status === "authenticated" && session?.user?.role !== "admin") {
        console.log("Admin layout - User is not an admin, redirecting to dashboard");
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin area",
          variant: "destructive",
        });
        router.push("/dashboard");
      } else if (status === "authenticated" && session?.user?.role === "admin") {
        console.log("Admin layout - Admin user authenticated successfully");
      }
    } else {
      console.log("Admin layout - Session is still loading, waiting...");
    }
  }, [status, session, router, toast]);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    router.push("/auth/logout");
  };

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Interviews",
      href: "/admin/interviews",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Activity",
      href: "/admin/activity",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Question Bank",
      href: "/admin/question-bank",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "System Logs",
      href: "/admin/logs",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-red-500"></div>
          <div className="mt-4 flex items-center">
            <Shield className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-lg font-bold text-red-500">Loading Admin Panel</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-red-600 text-white shadow-lg transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-20 items-center justify-between px-4 bg-red-700">
            <Link
              href="/admin"
              className="flex items-center space-x-2 font-bold text-xl"
            >
              <Shield className="h-6 w-6" />
              <span className="text-white">Admin Panel</span>
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-800"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Admin badge */}
          <div className="bg-red-800 py-2 px-4 text-center">
            <Badge className="bg-white text-red-700 hover:bg-white">
              Administrator Access
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-white text-red-700"
                      : "text-white hover:bg-red-700"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-red-500 p-4 bg-red-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start space-x-2 px-2 text-white hover:bg-red-800"
                >
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-red-300 text-red-800">
                      {session?.user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">
                      {session?.user?.name || "Admin User"}
                    </span>
                    <span className="text-xs text-red-200">
                      {session?.user?.email || "admin@example.com"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  Admin Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>User Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-slate-900 px-4 md:px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-red-500"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <span className="text-sm font-medium text-red-500 hidden md:inline-block">
              Admin Control Panel
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                <span>Exit Admin Mode</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
