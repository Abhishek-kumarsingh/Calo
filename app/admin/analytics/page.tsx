"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ServerCrash,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  RefreshCcw,
  TrendingUp,
  Layers,
  AlertTriangle,
  CheckCircle,
  FileText,
  Code,
  MessageSquare,
} from "lucide-react";
import { UserBehaviorCharts } from "@/components/admin/user-behavior-charts";
import { SystemPerformanceCharts } from "@/components/admin/system-performance-charts";

// Define interfaces for analytics data
interface UserEngagement {
  date: string;
  interviewCount: number;
  uniqueUserCount: number;
}

interface CompletionRate {
  rate: string;
  completed: number;
  total: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface DomainPopularity {
  _id: string;
  count: number;
}

interface UserRetention {
  returningUsers: number;
  totalUsers: number;
  retentionRate: string;
  userDetails: Array<{
    user: string;
    interviewCount: number;
    daysBetween: number;
  }>;
}

interface SystemLogsByCategory {
  _id: string;
  count: number;
}

interface ErrorRate {
  _id: string;
  categories: Array<{
    category: string;
    count: number;
  }>;
  totalErrors: number;
}

interface InterviewDuration {
  _id: string;
  averageDuration: number;
  count: number;
}

interface QuestionTypeDistribution {
  _id: string;
  count: number;
}

interface AnalyticsData {
  userBehavior: {
    engagement: UserEngagement[];
    completionRate: CompletionRate;
    domainPopularity: DomainPopularity[];
    retention: UserRetention;
  };
  systemPerformance: {
    logsByCategory: SystemLogsByCategory[];
    errorRates: ErrorRate[];
    interviewDurationTrend: InterviewDuration[];
    questionTypeDistribution: QuestionTypeDistribution[];
  };
  period: {
    days: number;
    start: string;
    end: string;
  };
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("30");
  const [activeTab, setActiveTab] = useState<string>("user-behavior");

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/analytics?period=${period}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      setError(error.message || "Failed to fetch analytics data");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  // Loading state
  if (loading && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  // Error state
  if (error && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading Analytics</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchAnalyticsData}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into user behavior and system performance
        </p>
      </div>

      {/* Period selector and refresh button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalyticsData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user-behavior" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>User Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="system-performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>System Performance</span>
          </TabsTrigger>
        </TabsList>

        {analyticsData && (
          <>
            <TabsContent value="user-behavior" className="mt-6">
              <UserBehaviorCharts data={analyticsData.userBehavior} />
            </TabsContent>

            <TabsContent value="system-performance" className="mt-6">
              <SystemPerformanceCharts data={analyticsData.systemPerformance} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Key Metrics Summary */}
      {analyticsData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold">{analyticsData.userBehavior.completionRate.rate}%</p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>{analyticsData.userBehavior.completionRate.completed} of {analyticsData.userBehavior.completionRate.total} interviews completed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Retention</p>
                    <p className="text-3xl font-bold">{analyticsData.userBehavior.retention.retentionRate}%</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>{analyticsData.userBehavior.retention.returningUsers} returning users</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                    <p className="text-3xl font-bold">
                      {analyticsData.systemPerformance.interviewDurationTrend.length > 0
                        ? Math.round(
                            analyticsData.systemPerformance.interviewDurationTrend.reduce(
                              (sum, item) => sum + item.averageDuration,
                              0
                            ) / analyticsData.systemPerformance.interviewDurationTrend.length
                          )
                        : 0} min
                    </p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>Average interview duration</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className="text-3xl font-bold">
                      {analyticsData.systemPerformance.errorRates.length > 0
                        ? (
                            (analyticsData.systemPerformance.errorRates.reduce(
                              (sum, item) => sum + item.totalErrors,
                              0
                            ) /
                              analyticsData.systemPerformance.logsByCategory.reduce(
                                (sum, item) => sum + item.count,
                                0
                              )) *
                            100
                          ).toFixed(2)
                        : "0.00"}%
                    </p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>System error rate</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
