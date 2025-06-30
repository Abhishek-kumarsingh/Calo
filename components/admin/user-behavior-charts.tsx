"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, PieChart, TrendingUp } from "lucide-react";

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

interface UserBehaviorData {
  engagement: UserEngagement[];
  completionRate: CompletionRate;
  domainPopularity: DomainPopularity[];
  retention: UserRetention;
}

interface UserBehaviorChartsProps {
  data: UserBehaviorData;
}

export function UserBehaviorCharts({ data }: UserBehaviorChartsProps) {
  // Get color for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "hsl(142.1 76.2% 36.3%)";
      case "in_progress":
        return "hsl(47.9 95.8% 53.1%)";
      case "scheduled":
        return "hsl(221.2 83.2% 53.3%)";
      case "pending_ai_generation":
        return "hsl(262.1 83.3% 57.8%)";
      case "cancelled":
        return "hsl(0 72.2% 50.6%)";
      default:
        return "hsl(215.4 16.3% 46.9%)";
    }
  };

  // Get readable status name
  const getStatusName = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "scheduled":
        return "Scheduled";
      case "pending_ai_generation":
        return "Pending AI";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Calculate total interviews for domain popularity
  const totalDomainInterviews = data.domainPopularity.reduce(
    (sum, domain) => sum + domain.count,
    0
  );

  // Sort user retention data by interview count
  const sortedRetentionData = [...data.retention.userDetails]
    .sort((a, b) => b.interviewCount - a.interviewCount)
    .slice(0, 10); // Top 10 users

  return (
    <div className="space-y-6">
      {/* User Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Engagement
          </CardTitle>
          <CardDescription>
            User activity and interview creation over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {data.engagement.length > 0 ? (
              <div className="relative h-full w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                  <span>Max</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  <div className="relative h-full w-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 border-b border-l">
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                    </div>
                    
                    {/* Data visualization */}
                    <div className="absolute inset-0 flex items-end justify-between">
                      {data.engagement.map((item, index) => {
                        // Find max values for scaling
                        const maxInterviewCount = Math.max(
                          ...data.engagement.map((d) => d.interviewCount)
                        );
                        const maxUserCount = Math.max(
                          ...data.engagement.map((d) => d.uniqueUserCount)
                        );
                        
                        // Calculate heights as percentages
                        const interviewHeight = maxInterviewCount > 0
                          ? (item.interviewCount / maxInterviewCount) * 100
                          : 0;
                        
                        const userHeight = maxUserCount > 0
                          ? (item.uniqueUserCount / maxUserCount) * 100
                          : 0;
                        
                        return (
                          <div
                            key={item.date}
                            className="group relative flex h-full flex-col items-center justify-end px-1"
                            style={{ width: `${100 / data.engagement.length}%` }}
                          >
                            {/* Interview bar */}
                            <div
                              className="w-full bg-primary rounded-t"
                              style={{
                                height: `${Math.max(interviewHeight, 1)}%`,
                              }}
                            ></div>
                            
                            {/* User bar (positioned to the right of interview bar) */}
                            <div
                              className="absolute bottom-0 right-1 w-1/3 bg-blue-500 rounded-t"
                              style={{
                                height: `${Math.max(userHeight, 1)}%`,
                              }}
                            ></div>
                            
                            {/* Date label */}
                            <span className="mt-1 text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 z-10">
                              <div>Interviews: {item.interviewCount}</div>
                              <div>Users: {item.uniqueUserCount}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center gap-4 text-xs">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-primary mr-1"></div>
                    <span>Interviews</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 mr-1"></div>
                    <span>Unique Users</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No engagement data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Status and Domain Popularity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Interview Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of interviews by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {data.completionRate.statusBreakdown.length > 0 ? (
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {data.completionRate.statusBreakdown.map((status, index) => {
                      // Calculate the total circumference
                      const circumference = 2 * Math.PI * 40;
                      
                      // Calculate the percentage of this status
                      const percentage = status.count / data.completionRate.total;
                      
                      // Calculate the arc length
                      const arcLength = percentage * circumference;
                      
                      // Calculate the offset (sum of previous arc lengths)
                      const offset = data.completionRate.statusBreakdown
                        .slice(0, index)
                        .reduce((sum, s) => sum + (s.count / data.completionRate.total) * circumference, 0);
                      
                      return (
                        <circle
                          key={status._id}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={getStatusColor(status._id)}
                          strokeWidth="20"
                          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 50 50)"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="30" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{data.completionRate.total}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No status data available</p>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.completionRate.statusBreakdown.map((status) => (
                <div key={status._id} className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(status._id) }}
                  ></div>
                  <span className="text-sm">{getStatusName(status._id)}</span>
                  <span className="ml-auto text-sm font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Domain Popularity
            </CardTitle>
            <CardDescription>
              Most popular interview domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.domainPopularity.slice(0, 5).map((domain) => (
                <div key={domain._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{domain._id}</span>
                    <span className="text-sm text-muted-foreground">
                      {((domain.count / totalDomainInterviews) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(domain.count / totalDomainInterviews) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Retention Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            User Retention
          </CardTitle>
          <CardDescription>
            Top users by interview count and engagement period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {sortedRetentionData.length > 0 ? (
              <div className="relative h-full w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                  <span>Max</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  <div className="relative h-full w-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 border-b border-l">
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                    </div>
                    
                    {/* Data visualization */}
                    <div className="absolute inset-0 flex items-end justify-between">
                      {sortedRetentionData.map((user, index) => {
                        // Find max values for scaling
                        const maxInterviewCount = Math.max(
                          ...sortedRetentionData.map((d) => d.interviewCount)
                        );
                        
                        // Calculate heights as percentages
                        const interviewHeight = maxInterviewCount > 0
                          ? (user.interviewCount / maxInterviewCount) * 100
                          : 0;
                        
                        return (
                          <div
                            key={user.user}
                            className="group relative flex h-full flex-col items-center justify-end px-1"
                            style={{ width: `${100 / sortedRetentionData.length}%` }}
                          >
                            {/* Interview count bar */}
                            <div
                              className="w-full bg-blue-500 rounded-t"
                              style={{
                                height: `${Math.max(interviewHeight, 1)}%`,
                              }}
                            ></div>
                            
                            {/* User ID label (truncated) */}
                            <span className="mt-1 text-xs text-muted-foreground truncate w-full text-center">
                              User {index + 1}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 z-10">
                              <div>Interviews: {user.interviewCount}</div>
                              <div>Days Active: {Math.round(user.daysBetween) || 1}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No retention data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
