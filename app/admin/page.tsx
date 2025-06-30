"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Users,
  ArrowUpRight,
  MessageSquare,
  UserCheck,
  Loader2,
  ServerCrash,
  BarChart3,
  Shield,
  Settings,
  FileText,
  Database,
  Activity,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

interface DashboardStats {
  counts: {
    totalUsers: number;
    totalInterviews: number;
    totalCandidates: number;
    activeUsers: number;
    newUsers: number;
    newInterviews: number;
    completedInterviews: number;
  };
  distribution: {
    userRoles: {
      admin: number;
      user: number;
    };
  };
  recent: {
    users: any[];
    interviews: any[];
  };
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch dashboard statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        setError(error.message || "Failed to fetch dashboard statistics");
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [toast]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="bg-red-500 text-white p-3 rounded-full mb-6">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Loading Admin Dashboard</h2>
        <p className="text-lg text-muted-foreground">Please wait while we fetch the system data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <div className="bg-red-500 text-white p-4 rounded-full mb-6">
          <ServerCrash className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-3">Admin Dashboard Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button className="bg-red-500 hover:bg-red-600" onClick={() => window.location.reload()}>
          <BarChart3 className="h-4 w-4 mr-2" /> Reload Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Banner */}
      <div className="bg-red-500 dark:bg-red-700 text-white p-4 rounded-lg mb-8 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Admin Control Panel</h1>
              <p className="text-white/80">
                System administration and monitoring interface
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/admin/logs">
                <FileText className="h-4 w-4 mr-2" />
                System Logs
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500 text-white rounded-full mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage user accounts, roles, and permissions
              </p>
              <Button className="w-full" asChild>
                <Link href="/admin/users">
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-500 text-white rounded-full mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed system analytics and reports
              </p>
              <Button className="w-full" asChild>
                <Link href="/admin/analytics">
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-500 text-white rounded-full mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Activity Monitoring</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track user activity and system events
              </p>
              <Button className="w-full" asChild>
                <Link href="/admin/activity">
                  Monitor Activity
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats cards */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 mr-2 text-red-500" />
          <h2 className="text-xl font-bold">System Statistics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.counts.totalUsers || 0}</p>
                </div>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Users className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500 font-medium">{stats?.counts.newUsers || 0} new</span>
                <span>in last 7 days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                  <p className="text-3xl font-bold">{stats?.counts.totalInterviews || 0}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500 font-medium">{stats?.counts.newInterviews || 0} new</span>
                <span>in last 7 days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold">{stats?.counts.activeUsers || 0}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Active in last 24 hours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{stats?.counts.completedInterviews || 0}</p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Completed interviews</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 mr-2 text-red-500" />
          <h2 className="text-xl font-bold">Analytics Overview</h2>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
          <AnalyticsCharts
            userRoles={stats?.distribution.userRoles || { admin: 0, user: 0 }}
            interviewStats={{
              completed: stats?.counts.completedInterviews || 0,
              inProgress: Math.floor((stats?.counts.totalInterviews || 0) * 0.3) || 0, // Estimate
              scheduled: Math.floor((stats?.counts.totalInterviews || 0) * 0.2) || 0, // Estimate
            }}
          />
          <div className="mt-4 flex justify-end">
            <Button asChild>
              <Link href="/admin/analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View Detailed Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          <h2 className="text-xl font-bold">System Alerts</h2>
        </div>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500 text-white rounded-full">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">System Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-black/20 rounded border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">High CPU Usage Detected</p>
                      <p className="text-xs text-muted-foreground">Server load exceeded 80% for 15 minutes</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-white dark:bg-black/20 rounded border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Database Backup Completed</p>
                      <p className="text-xs text-muted-foreground">Daily backup successfully created</p>
                      <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/admin/logs">
                      View All System Logs
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-500" />
              <CardTitle>Recent Users</CardTitle>
            </div>
            <CardDescription>
              Recently registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats?.recent.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-red-200">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback className="bg-red-100 text-red-700">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"} className={user.role === "admin" ? "bg-red-500" : ""}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4">
            <Button className="w-full bg-red-500 hover:bg-red-600" asChild>
              <Link href="/admin/users">Manage All Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <CardTitle>Recent Interviews</CardTitle>
            </div>
            <CardDescription>
              Recently created interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats?.recent.interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div>
                    <p className="font-medium">{interview.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(interview.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={interview.status === "completed" ? "default" : "outline"}
                    className={interview.status === "completed" ? "bg-green-500" :
                              interview.status === "in_progress" ? "bg-blue-500" : ""}
                  >
                    {interview.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4">
            <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
              <Link href="/admin/interviews">View All Interviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
