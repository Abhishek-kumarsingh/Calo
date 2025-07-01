"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Not used in current UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"; // Ensure this is your updated Progress component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// import { Separator } from '@/components/ui/separator'; // Not used in current UI
import {
  BarChart3, // Using this as the primary BarChart icon
  PieChart, // Keep if you plan to use it
  LineChart, // Keep if you plan to use it
  ArrowUpRight,
  // Calendar, // Not used
  Clock,
  // Users, // Not used directly for stats cards
  UserCheck,
  MessageSquare,
  // Brain, // Can be used for "Common Feedback" or similar
  FileText,
  Filter,
  Download,
  ArrowLeft,
  Loader2, // For loading
  AlertTriangle, // For errors
  RefreshCw, // For retry
} from "lucide-react";
import { interviewApi, handleApiError, withRetry } from "@/lib/api-utils-updated";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";
// import { cn } from '@/lib/utils'; // Not explicitly used in this version's JSX

// --- Define expected shapes for data from backend analytics endpoints ---
interface AnalyticsOverviewStats {
  overallScore: number;
  totalInterviews: number;
  completedInterviews: number;
  avgDuration?: number; // In minutes
  // ... any other overview stats
}

interface DomainPerformanceData {
  name: string;
  count: number;
  avgScore: number;
}

interface SkillAnalysisData {
  name: string;
  score: number;
}

// This is for the list of recent interviews, aligning with your backend Interview model
interface RecentInterviewItem {
  id: string;
  title?: string; // If your backend returns a specific interview title
  candidateName: string; // Extracted from populated candidate
  candidateRole?: string | null; // Extracted
  date: string; // Completion or last update date
  score?: number | null;
  domain: string;
  difficulty?: string | null;
  avatarUrl?: string | null; // From candidate
}

// Format date helper
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all"); // e.g., 'all', '30d', '90d', '365d'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different analytics data pieces
  const [overviewStats, setOverviewStats] =
    useState<AnalyticsOverviewStats | null>(null);
  const [skillsAnalysis, setSkillsAnalysis] = useState<SkillAnalysisData[]>([]);
  const [domainPerformance, setDomainPerformance] = useState<
    DomainPerformanceData[]
  >([]);
  const [recentInterviewsList, setRecentInterviewsList] = useState<
    RecentInterviewItem[]
  >([]);

  // Mock data for sections not yet backed by API - kept for UI structure
  const [feedbackTrends, setFeedbackTrends] = useState<
    Array<{ month: string; avgScore: number }>
  >([]);
  const [commonFeedback, setCommonFeedback] = useState<
    Array<{ category: string; items: string[] }>
  >([]);
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        domain: selectedDomain === "all" ? "" : selectedDomain,
        timeframe: selectedTimeframe === "all" ? "" : selectedTimeframe,
      };

      // Parallel fetch for different analytics parts
      const [overviewData, skillsData, domainData, recentData] =
        await Promise.all([
          withRetry(() => interviewApi.getAnalyticsOverview(filters)),
          withRetry(() => interviewApi.getSkillsAnalysis(filters)),
          withRetry(() => interviewApi.getDomainPerformance(filters)),
          withRetry(() =>
            interviewApi.getRecentCompletedInterviews({ ...filters, limit: 5 })
          ), // Fetch recent completed
        ]);

      setOverviewStats(overviewData);
      setSkillsAnalysis(skillsData);
      setDomainPerformance(domainData);

      // Map recentData (which are full BackendInterviewObjects) to RecentInterviewItem
      const mappedRecentInterviews = (recentData as any[]).map((interview) => ({
        id: interview.id,
        candidateName: interview.candidate?.name || "Unknown Candidate",
        candidateRole: interview.candidate?.role || interview.title || "N/A",
        date: interview.updatedAt || interview.createdAt, // Use updatedAt for completion date
        score: interview.score,
        domain: interview.domain,
        difficulty: interview.level,
        avatarUrl: interview.candidate?.avatarUrl,
      }));
      setRecentInterviewsList(mappedRecentInterviews);

      // For mock sections, if you want to simulate filtering later:
      // setFeedbackTrends(mockAnalytics.feedbackTrends);
      // setCommonFeedback(mockAnalytics.commonFeedback);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);

      // Extract more detailed error information
      let errorMessage = "Failed to load analytics data.";
      let detailedError = "";

      if (err instanceof Error) {
        errorMessage = err.message;
        detailedError = err.stack || "";
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err && typeof err.message === "string") {
        errorMessage = err.message;
        if (err.response) {
          detailedError = `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data || {})}`;
        }
      }

      console.error("Detailed error:", detailedError);

      // Use the handleApiError utility but also keep our detailed error
      const handledErrorMessage = handleApiError(err);
      setError(errorMessage || handledErrorMessage || "Failed to load analytics data.");

      toast({
        title: "Loading Error",
        description: errorMessage || "Could not fetch analytics. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, selectedTimeframe, toast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]); // Re-fetch when filters change

  // --- UI Rendering ---
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          Failed to Load Analytics
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <div className="flex flex-col gap-4">
          <Button onClick={fetchAnalyticsData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Try Again
          </Button>
          <div className="text-sm text-muted-foreground max-w-md">
            <p className="mb-2">
              Note: If you're not logged in, the system will show mock data for demonstration purposes.
            </p>
            <p className="mb-2">
              If you're seeing a 404 error, please check that all analytics API endpoints are properly implemented.
            </p>
            <p>
              Error details: {error.includes('404') ? 'One or more analytics endpoints could not be found.' : error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!overviewStats) {
    // Handles case where API returns empty but not an error
    return (
      <div className="p-6 text-center text-muted-foreground min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
        <BarChart3 className="h-16 w-16 opacity-50 mb-4" />
        <p className="font-semibold">No analytics data available.</p>
        <p className="text-sm">
          This might be due to current filter settings or no interviews
          conducted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="-ml-3 mb-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Interview Analytics
          </h1>
          <p className="text-md text-muted-foreground">
            Insights into interview performance and feedback trends.
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" className="gap-1.5 text-sm h-9"> <Filter className="h-3.5 w-3.5" /> Filter </Button> */}
          <Button
            variant="outline"
            className="gap-1.5 text-sm h-9"
            onClick={() => alert("Export functionality to be implemented.")}
          >
            <Download className="h-3.5 w-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 p-4 border dark:border-slate-700 rounded-lg bg-card dark:bg-slate-850 shadow">
        <div className="flex-1 min-w-[180px]">
          <Label
            htmlFor="domain-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Domain
          </Label>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger id="domain-filter" className="h-9 text-sm">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="fullstack">Full Stack</SelectItem>
              <SelectItem value="data_science">Data Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label
            htmlFor="timeframe-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Timeframe
          </Label>
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger id="timeframe-filter" className="h-9 text-sm">
              <SelectValue placeholder="Filter by timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days (Quarter)</SelectItem>
              <SelectItem value="365d">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Filter button is removed as select changes trigger re-fetch via useEffect dependency */}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Overall Avg. Score"
          value={
            overviewStats.overallScore > 0
              ? `${overviewStats.overallScore}/100`
              : "N/A"
          }
          icon={BarChart3}
        />
        <StatCard
          title="Total Interviews"
          value={overviewStats.totalInterviews}
          icon={MessageSquare}
        />
        <StatCard
          title="Completed"
          value={overviewStats.completedInterviews}
          icon={UserCheck}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
        />
        <StatCard
          title="Avg. Duration"
          value={
            overviewStats.avgDuration ? `${overviewStats.avgDuration}m` : "N/A"
          }
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        {/* Skills Analysis */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-lg border dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Skills Analysis</CardTitle>
              <CardDescription className="text-sm">
                Performance breakdown across key skill categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillsAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {skillsAnalysis.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <p className="font-medium">{skill.name}</p>
                        <p className="font-semibold text-muted-foreground">
                          {skill.score}/100
                        </p>
                      </div>
                      <Progress
                        value={skill.score}
                        className="h-2"
                        indicatorClassName={
                          skill.score >= 75
                            ? "bg-green-500"
                            : skill.score >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <NoDataPlaceholder section="Skills Analysis" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Domain Performance & Common Feedback */}
        <div className="space-y-6 md:space-y-8">
          <Card className="shadow-sm border dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Domain Performance</CardTitle>
              <CardDescription className="text-sm">
                Average scores by domain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domainPerformance.length > 0 ? (
                <div className="space-y-4">
                  {domainPerformance.map((domain) => (
                    <div key={domain.name}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <div>
                          <p className="font-medium">{domain.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {domain.count} interviews
                          </p>
                        </div>
                        <p className="font-semibold text-muted-foreground">
                          {domain.avgScore}/100
                        </p>
                      </div>
                      <Progress
                        value={domain.avgScore}
                        className="h-2"
                        indicatorClassName={
                          domain.avgScore >= 75
                            ? "bg-green-500"
                            : domain.avgScore >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <NoDataPlaceholder section="Domain Performance" />
              )}
            </CardContent>
          </Card>

          {/* Common Feedback (Still using mock, replace with API data) */}
          <Card className="shadow-sm border dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Common Feedback Themes</CardTitle>
            </CardHeader>
            <CardContent>
              {commonFeedback.length > 0 ? (
                <div className="space-y-4">
                  {commonFeedback.map((feedback: any) => (
                    <div key={feedback.category}>
                      <h3 className="text-sm font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">
                        {feedback.category}
                      </h3>
                      <ul className="space-y-1 pl-1">
                        {feedback.items.map((item: any, index: any) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-2"
                          >
                            <div
                              className={`rounded-full w-1.5 h-1.5 ${
                                feedback.category === "Strengths"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } mt-[5px] flex-shrink-0`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <NoDataPlaceholder section="Common Feedback Themes" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Interviews List */}
      <Card className="shadow-lg border dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Recent Completed Interviews</CardTitle>
          <CardDescription className="text-sm">
            Quick view of detailed feedback for recently completed interviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInterviewsList.length > 0 ? (
            <div className="space-y-3">
              {recentInterviewsList.map((interview) => (
                <div
                  key={interview.id}
                  className="block p-3 sm:p-4 border dark:border-slate-700 rounded-lg hover:bg-accent dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                        <AvatarImage
                          src={interview.avatarUrl || undefined}
                          alt={interview.candidateName}
                        />
                        <AvatarFallback>
                          {interview.candidateName
                            ?.substring(0, 2)
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm sm:text-md truncate"
                          title={interview.title || interview.candidateName}
                        >
                          {interview.title || interview.candidateName}
                        </p>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                          <span>{interview.candidateRole || "Role N/A"}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="capitalize">{interview.domain}</span>
                          {interview.difficulty && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="capitalize">
                                {interview.difficulty}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Completed: {formatDate(interview.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                      {typeof interview.score === "number" ? (
                        <>
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            Score
                          </p>
                          <p className="text-lg font-bold">
                            {interview.score}
                            <span className="text-xs text-muted-foreground">
                              /100
                            </span>
                          </p>
                          <Progress
                            value={interview.score}
                            className="w-20 h-1.5"
                            indicatorClassName={
                              interview.score >= 75
                                ? "bg-green-500"
                                : interview.score >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }
                          />
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Not Scored
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => router.push(`/dashboard/interviews/${interview.id}/results`)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => router.push(`/dashboard/interviews/${interview.id}/analysis`)}
                        disabled={!interview.score}
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoDataPlaceholder section="Recent Interviews" />
          )}
        </CardContent>
        {recentInterviewsList.length > 0 && (
          <CardFooter>
            <Link
              href="/dashboard/interviews?status=completed"
              className="w-full sm:w-auto mx-auto sm:mx-0"
            >
              <Button variant="ghost" className="text-sm text-primary">
                View All Completed Interviews
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Helper for stat cards (from previous example)
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  trendValue?: number;
  trendUnit?: string;
  trendType?: "positive" | "negative" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  trendValue,
  trendUnit,
  trendType = "positive",
}) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-850">
    <CardContent className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <div className={`p-1.5 sm:p-2 ${iconBg} rounded-full`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-2">{value}</p>
      {trendValue !== undefined && trendUnit && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trendType !== "neutral" && (
            <ArrowUpRight
              className={`h-3.5 w-3.5 ${
                trendType === "positive"
                  ? "text-green-500"
                  : "text-red-500 rotate-90"
              }`}
            />
          )}
          {trendType === "neutral" && <Clock className="h-3.5 w-3.5" />}
          <span
            className={`${
              trendType === "positive"
                ? "text-green-500"
                : trendType === "negative"
                ? "text-red-500"
                : ""
            } font-medium`}
          >
            {trendType !== "neutral" ? `${Math.abs(trendValue)}%` : ""}
          </span>
          <span>{trendUnit}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const NoDataPlaceholder = ({ section }: { section: string }) => (
  <div className="text-center py-10 text-muted-foreground border-dashed border-2 dark:border-slate-700 rounded-md min-h-[150px] flex flex-col justify-center items-center">
    <BarChart3 className="h-10 w-10 mb-3 opacity-50" />
    <p className="font-medium text-sm">No Data for {section}</p>
    <p className="text-xs mt-1">
      Try adjusting filters or conduct more interviews.
    </p>
  </div>
);
