"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ActivityData {
  date: string;
  interviews: number;
}

interface ActivityTrackerProps {
  userId?: string;
}

export function ActivityTracker({ userId }: ActivityTrackerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("30");
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity data
  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL("/api/admin/activity", window.location.origin);
      if (userId) {
        url.searchParams.append("userId", userId);
      }
      url.searchParams.append("days", period);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch activity data");
      }

      const data = await response.json();
      setActivityData(data.activityData || []);
    } catch (error: any) {
      console.error("Error fetching activity data:", error);
      setError(error.message || "Failed to fetch activity data");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch activity data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when period changes
  useEffect(() => {
    fetchActivityData();
  }, [period, userId]);

  // Find the maximum value for scaling
  const maxValue = Math.max(...activityData.map(item => item.interviews), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>
            {userId ? "Individual user activity" : "System-wide activity"} over time
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchActivityData} disabled={loading}>
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchActivityData}>
              Try Again
            </Button>
          </div>
        ) : activityData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No activity data available for the selected period</p>
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <div className="flex h-full items-end space-x-2">
              {activityData.map((item) => (
                <div
                  key={item.date}
                  className="relative flex h-full w-full flex-col justify-end"
                >
                  <div
                    className="bg-primary rounded-t w-full transition-all duration-300"
                    style={{
                      height: `${Math.max(
                        (item.interviews / maxValue) * 100,
                        4
                      )}%`,
                    }}
                  ></div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {item.interviews > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground opacity-0 group-hover:opacity-100">
                      {item.interviews}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
