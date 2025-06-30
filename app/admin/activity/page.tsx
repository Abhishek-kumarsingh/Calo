"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ActivityTracker } from "@/components/admin/activity-tracker";
import Link from "next/link";
import {
  Loader2,
  ServerCrash,
  Activity,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface ActivityStats {
  totalUsers: number;
  totalInterviews: number;
  activeUsers: number;
  completedInterviews: number;
  averageInterviewDuration: number;
  totalQuestionsGenerated: number;
}

export default function ActivityPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");

  // Fetch activity stats
  const fetchActivityStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from the API
      const response = await fetch(`/api/admin/activity/stats?days=${period}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch activity statistics");
      }

      const data = await response.json();
      setStats(data);
      setLoading(false);

    } catch (error: any) {
      console.error("Error fetching activity stats:", error);
      setError(error.message || "Failed to fetch activity statistics");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch activity statistics",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Load data on component mount and when period changes
  useEffect(() => {
    fetchActivityStats();
  }, [period]);

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading activity data...</p>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading Activity Data</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchActivityStats}>
          <Activity className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activity Tracking</h1>
            <p className="text-muted-foreground">
              Monitor user activity and system usage
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Advanced Analytics
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Activity Overview</h2>
          <p className="text-muted-foreground">
            System activity for the selected time period
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <span>Active in last {period} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <p className="text-3xl font-bold">{stats?.totalInterviews || 0}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <span>Total interviews conducted</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                <p className="text-3xl font-bold">{stats?.averageInterviewDuration || 0} min</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <span>Average interview duration</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <div className="mb-8">
        <ActivityTracker />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Completion</CardTitle>
            <CardDescription>
              Completed vs. total interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative h-40 w-40">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="hsl(220 14.3% 95.9%)"
                    strokeWidth="20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="hsl(142.1 76.2% 36.3%)"
                    strokeWidth="20"
                    strokeDasharray={`${(stats?.completedInterviews || 0) / (stats?.totalInterviews || 1) * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {Math.round((stats?.completedInterviews || 0) / (stats?.totalInterviews || 1) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {stats?.completedInterviews || 0} completed out of {stats?.totalInterviews || 0} total interviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions Generated</CardTitle>
            <CardDescription>
              Total questions generated by the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-5xl font-bold mb-4">
                {stats?.totalQuestionsGenerated?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Average {Math.round((stats?.totalQuestionsGenerated || 0) / (stats?.totalInterviews || 1))} questions per interview
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
