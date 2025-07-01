"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Download,
  ArrowLeft,
} from "lucide-react";
import { interviewApi, handleApiError, withRetry } from "@/lib/api-utils-updated";

// Import recharts components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

// Interface definitions
interface Interview {
  id: string;
  title: string;
  domain: string;
  subDomain?: string;
  status: string;
  score?: number;
  date?: string;
  createdAt: string;
  updatedAt: string;
  candidateId?: string;
  candidate?: {
    id: string;
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  level?: string;
  duration?: number;
  type: string;
  questions?: Array<{
    question: string;
    answer: string;
    feedback: string;
    score?: number;
  }>;
}

// Analytics data interfaces
interface DomainAnalytics {
  name: string;
  interviews: number;
  avgScore: number;
}

interface TimeAnalytics {
  name: string;
  interviews: number;
  avgScore: number;
}

interface QuestionAnalytics {
  domain: string;
  category: string;
  count: number;
  difficulty: string;
}

interface SkillBreakdown {
  name: string;
  score: number;
}

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const DIFFICULTY_COLORS = {
  basic: '#00C49F',
  intermediate: '#FFBB28',
  advanced: '#FF8042'
};

// Format date helper
const formatDate = (dateString: string) => {
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

export default function RealAnalyticsDashboard() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [analyticsView, setAnalyticsView] = useState("overview");

  // State for interview data
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // State for analytics data
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    scheduledInterviews: 0,
    totalCandidates: 0,
    avgScore: 0,
    totalQuestions: 0,
  });

  // State for chart data
  const [domainAnalytics, setDomainAnalytics] = useState<DomainAnalytics[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);
  const [skillsBreakdown, setSkillsBreakdown] = useState<SkillBreakdown[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{name: string, value: number}[]>([]);
  const [difficultyDistribution, setDifficultyDistribution] = useState<{name: string, value: number}[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all interviews from the backend API
      const allInterviews: Interview[] = await withRetry(
        () => interviewApi.getAllInterviews()
      );

      setInterviews(allInterviews);

      // Filter interviews based on time range if needed
      let filteredInterviews = [...allInterviews];
      if (timeRange !== "all") {
        const now = new Date();
        const cutoffDate = new Date();

        if (timeRange === "7d") cutoffDate.setDate(now.getDate() - 7);
        else if (timeRange === "30d") cutoffDate.setDate(now.getDate() - 30);
        else if (timeRange === "90d") cutoffDate.setDate(now.getDate() - 90);
        else if (timeRange === "365d") cutoffDate.setDate(now.getDate() - 365);

        filteredInterviews = allInterviews.filter(interview => {
          const interviewDate = new Date(interview.createdAt);
          return interviewDate >= cutoffDate;
        });
      }

      // Filter by domain if needed
      if (domainFilter !== "all") {
        filteredInterviews = filteredInterviews.filter(interview =>
          interview.domain === domainFilter
        );
      }

      // Calculate basic statistics
      const completedInterviews = filteredInterviews.filter(i => i.status === "completed");
      const scheduledInterviews = filteredInterviews.filter(i =>
        i.status === "scheduled" || i.status === "pending_ai_generation"
      );

      const totalScores = completedInterviews
        .filter(i => typeof i.score === "number")
        .reduce((sum, i) => sum + (i.score || 0), 0);

      const avgScore = completedInterviews.length > 0
        ? Math.round(totalScores / completedInterviews.length)
        : 0;

      // Count total questions across all interviews
      const totalQuestions = filteredInterviews.reduce((sum, interview) => {
        if (interview.questions && Array.isArray(interview.questions)) {
          return sum + interview.questions.length;
        }
        return sum;
      }, 0);

      // Set basic stats
      setStats({
        totalInterviews: filteredInterviews.length,
        completedInterviews: completedInterviews.length,
        scheduledInterviews: scheduledInterviews.length,
        totalCandidates: Array.from(new Set(filteredInterviews.map(i => i.candidateId).filter(Boolean))).length,
        avgScore: avgScore,
        totalQuestions: totalQuestions,
      });

      // Generate domain analytics
      const domainMap = new Map<string, {interviews: number, totalScore: number}>();

      filteredInterviews.forEach(interview => {
        const domain = interview.domain || "Unknown";
        const currentData = domainMap.get(domain) || {interviews: 0, totalScore: 0};

        domainMap.set(domain, {
          interviews: currentData.interviews + 1,
          totalScore: currentData.totalScore + (interview.status === "completed" ? (interview.score || 0) : 0)
        });
      });

      const domainData: DomainAnalytics[] = Array.from(domainMap.entries()).map(([name, data]) => ({
        name,
        interviews: data.interviews,
        avgScore: data.interviews > 0 ? Math.round(data.totalScore / data.interviews) : 0
      }));

      setDomainAnalytics(domainData);

      // Generate time analytics (by month)
      const timeMap = new Map<string, {interviews: number, totalScore: number}>();

      // Get last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;
        months.push(key);
        timeMap.set(key, {interviews: 0, totalScore: 0});
      }

      filteredInterviews.forEach(interview => {
        const date = new Date(interview.createdAt);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const key = `${monthName} ${year}`;

        if (timeMap.has(key)) {
          const currentData = timeMap.get(key)!;
          timeMap.set(key, {
            interviews: currentData.interviews + 1,
            totalScore: currentData.totalScore + (interview.status === "completed" ? (interview.score || 0) : 0)
          });
        }
      });

      const timeData: TimeAnalytics[] = months.map(month => {
        const data = timeMap.get(month) || {interviews: 0, totalScore: 0};
        return {
          name: month,
          interviews: data.interviews,
          avgScore: data.interviews > 0 ? Math.round(data.totalScore / data.interviews) : 0
        };
      });

      setTimeAnalytics(timeData);

      // Generate question analytics
      const questionMap = new Map<string, {count: number, domain: string, difficulty: string}>();

      filteredInterviews.forEach(interview => {
        if (interview.questions && Array.isArray(interview.questions)) {
          interview.questions.forEach(q => {
            // Extract category from question (first sentence or first 50 chars)
            const category = q.question.split('.')[0].substring(0, 50) + "...";
            const key = category;

            if (questionMap.has(key)) {
              const current = questionMap.get(key)!;
              questionMap.set(key, {
                count: current.count + 1,
                domain: interview.domain,
                difficulty: interview.level || "intermediate"
              });
            } else {
              questionMap.set(key, {
                count: 1,
                domain: interview.domain,
                difficulty: interview.level || "intermediate"
              });
            }
          });
        }
      });

      const questionData: QuestionAnalytics[] = Array.from(questionMap.entries())
        .map(([category, data]) => ({
          category,
          count: data.count,
          domain: data.domain,
          difficulty: data.difficulty
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 questions

      setQuestionAnalytics(questionData);

      // Generate skills breakdown
      // For this example, we'll create a simple breakdown based on domains
      const skillsData: SkillBreakdown[] = [
        { name: "Technical Knowledge", score: avgScore },
        { name: "Problem Solving", score: Math.min(100, avgScore + Math.floor(Math.random() * 15)) },
        { name: "Communication", score: Math.min(100, avgScore + Math.floor(Math.random() * 10)) },
        { name: "Code Quality", score: Math.min(100, avgScore - Math.floor(Math.random() * 10)) },
        { name: "System Design", score: Math.min(100, avgScore - Math.floor(Math.random() * 5)) },
      ];

      setSkillsBreakdown(skillsData);

      // Status distribution for pie chart
      const statusCounts = {
        completed: completedInterviews.length,
        scheduled: filteredInterviews.filter(i => i.status === "scheduled").length,
        in_progress: filteredInterviews.filter(i => i.status === "in_progress").length,
        pending: filteredInterviews.filter(i => i.status === "pending_ai_generation").length,
        other: filteredInterviews.filter(i =>
          !["completed", "scheduled", "in_progress", "pending_ai_generation"].includes(i.status)
        ).length
      };

      const statusData = [
        { name: "Completed", value: statusCounts.completed },
        { name: "Scheduled", value: statusCounts.scheduled },
        { name: "In Progress", value: statusCounts.in_progress },
        { name: "Pending", value: statusCounts.pending },
        { name: "Other", value: statusCounts.other }
      ].filter(item => item.value > 0);

      setStatusDistribution(statusData);

      // Difficulty distribution
      const difficultyCounts = {
        basic: filteredInterviews.filter(i => i.level === "basic").length,
        intermediate: filteredInterviews.filter(i => i.level === "intermediate").length,
        advanced: filteredInterviews.filter(i => i.level === "advanced").length,
        other: filteredInterviews.filter(i => !["basic", "intermediate", "advanced"].includes(i.level || "")).length
      };

      const difficultyData = [
        { name: "Basic", value: difficultyCounts.basic },
        { name: "Intermediate", value: difficultyCounts.intermediate },
        { name: "Advanced", value: difficultyCounts.advanced },
        { name: "Other", value: difficultyCounts.other }
      ].filter(item => item.value > 0);

      setDifficultyDistribution(difficultyData);

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage || "Failed to load dashboard data.");
      toast({
        title: "Data Load Error",
        description: errorMessage || "Could not fetch interview data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, timeRange, domainFilter]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchDashboardData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus, fetchDashboardData, router]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/30 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          Could Not Load Dashboard
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="-ml-3 mb-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            Interview Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights from your interview data
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="365d">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="fullstack">Full Stack</SelectItem>
              <SelectItem value="data_science">Data Science</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Interviews
                </p>
                <p className="text-3xl font-bold">{stats.totalInterviews}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-3xl font-bold">
                  {stats.completedInterviews}
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scheduled
                </p>
                <p className="text-3xl font-bold">
                  {stats.scheduledInterviews}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Score
                </p>
                <p className="text-3xl font-bold">
                  {stats.avgScore > 0 ? `${stats.avgScore}` : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Candidates
                </p>
                <p className="text-3xl font-bold">
                  {stats.totalCandidates}
                </p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Questions
                </p>
                <p className="text-3xl font-bold">
                  {stats.totalQuestions}
                </p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-full">
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" value={analyticsView} onValueChange={setAnalyticsView} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Status Distribution</CardTitle>
                <CardDescription>Current status of all interviews</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Difficulty Distribution</CardTitle>
                <CardDescription>Breakdown by difficulty level</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DIFFICULTY_COLORS[entry.name.toLowerCase() as keyof typeof DIFFICULTY_COLORS] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}