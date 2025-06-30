import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  Sparkles,
  Shield,
  PieChart,
  LineChart,
  BarChart,
  Database,
  FileText,
} from "lucide-react";

export const dashboardConfig = {
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Real Analytics",
      href: "/dashboard/real-analytics",
      icon: BarChart,
    },
    {
      title: "Real Analytics",
      href: "/dashboard/real-analytics",
      icon: BarChart,
    },
    {
      title: "Enhanced Dashboard",
      href: "/dashboard/enhanced-dashboard",
      icon: PieChart,
    },
    {
      title: "Interviews",
      href: "/dashboard/interviews",
      icon: MessageSquare,
    },
    {
      title: "AI Assistant",
      href: "/dashboard/ai-assistant",
      icon: Sparkles,
    },
    {
      title: "Question Bank",
      href: "/dashboard/question-bank",
      icon: FileText,
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    // Admin section is conditionally shown based on user role
    {
      title: "Admin",
      href: "/dashboard/admin",
      icon: Shield,
      role: "admin",
    },
  ],
};