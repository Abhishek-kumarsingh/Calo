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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock,
  Globe,
  Server,
  Layers,
  Brain,
  Play,
  List as ListIcon,
  Loader2,
  AlertTriangle,
  RefreshCw,
  PieChart,
  LineChart,
  BarChart,
  TrendingUp,
  Timer,
  FileText,
  Filter,
  Download,
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
  AreaChart,
  Area,
} from "recharts";

// Domain and Level constants
const domains = [
  { id: "frontend", name: "Frontend Development", icon: Globe },
  { id: "backend", name: "Backend Development", icon: Server },
  { id: "fullstack", name: "Full Stack", icon: Layers },
  { id: "data_science", name: "Data Science", icon: BarChart },
];

const difficultyLevels = [
  { id: "basic", name: "Basic" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

// Interface definitions
interface InterviewDisplayItem {
  id: string;
  candidate: string;
  role: string;
  date: string;
  score?: number;
  status: string;
  avatar?: string;
  domain?: string;
  difficulty?: string;
}

interface BackendInterviewObject {
  id: string;
  title: string;
  domain: string;
  status: string;
  score?: number | null;
  date?: string | null;
  createdAt: string;
  updatedAt: string;
  candidateId?: string | null;
  candidate?: {
    id: string;
    name: string;
    role?: string | null;
    avatarUrl?: string | null;
  } | null;
  level?: string;
  duration?: number;
}

// Analytics data interfaces
interface DomainAnalytics {
  name: string;
  interviews: number;
  avgScore: number;
  avgDuration: number;
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
  avgTime: number;
  difficulty: string;
}

interface SkillBreakdown {
  name: string;
  score: number;
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Format duration helper
const formatDuration = (minutes: number) => {
  if (!minutes) return "N/A";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Mock data for charts (replace with actual API data in production)
const mockDomainData: DomainAnalytics[] = [
  { name: "Frontend", interviews: 24, avgScore: 78, avgDuration: 45 },
  { name: "Backend", interviews: 18, avgScore: 72, avgDuration: 52 },
  { name: "Full Stack", interviews: 12, avgScore: 68, avgDuration: 60 },
  { name: "Data Science", interviews: 8, avgScore: 75, avgDuration: 48 },
];

const mockTimeData: TimeAnalytics[] = [
  { name: "Jan", interviews: 5, avgScore: 65 },
  { name: "Feb", interviews: 8, avgScore: 68 },
  { name: "Mar", interviews: 12, avgScore: 72 },
  { name: "Apr", interviews: 15, avgScore: 75 },
  { name: "May", interviews: 18, avgScore: 78 },
  { name: "Jun", interviews: 22, avgScore: 80 },
];

const mockQuestionData: QuestionAnalytics[] = [
  { domain: "Frontend", category: "React Hooks", count: 45, avgTime: 3.5, difficulty: "Intermediate" },
  { domain: "Backend", category: "Database Design", count: 38, avgTime: 4.2, difficulty: "Advanced" },
  { domain: "Frontend", category: "CSS Layout", count: 32, avgTime: 2.8, difficulty: "Basic" },
  { domain: "Backend", category: "API Security", count: 28, avgTime: 4.5, difficulty: "Advanced" },
  { domain: "Full Stack", category: "State Management", count: 25, avgTime: 3.8, difficulty: "Intermediate" },
];

const mockSkillsData: SkillBreakdown[] = [
  { name: "Technical Knowledge", score: 75 },
  { name: "Problem Solving", score: 82 },
  { name: "Communication", score: 88 },
  { name: "Code Quality", score: 70 },
  { name: "System Design", score: 65 },
];

const mockFeedbackData = [
  { category: "Strengths", items: ["Strong problem-solving skills", "Good communication", "Solid fundamentals"] },
  { category: "Areas for Improvement", items: ["Advanced algorithm knowledge", "System design patterns", "Testing practices"] },
];

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const DIFFICULTY_COLORS = {
  Basic: '#00C49F',
  Intermediate: '#FFBB28',
  Advanced: '#FF8042'
};

export default function EnhancedDashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isQuickStartLoading, setIsQuickStartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for interview data
  const [recentInterviews, setRecentInterviews] = useState<InterviewDisplayItem[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<InterviewDisplayItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficultyLevels[1].id);

  // State for analytics data
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    scheduledInterviews: 0,
    totalCandidates: 0,
    avgScore: 0,
    avgDuration: 0,
  });

  // State for chart data
  const [domainAnalytics, setDomainAnalytics] = useState<DomainAnalytics[]>(mockDomainData);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics[]>(mockTimeData);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>(mockQuestionData);
  const [skillsBreakdown, setSkillsBreakdown] = useState<SkillBreakdown[]>(mockSkillsData);
  const [feedbackTrends, setFeedbackTrends] = useState(mockFeedbackData);
  
  // Filter states
  const [timeRange, setTimeRange] = useState("all");
  const [analyticsView, setAnalyticsView] = useState("overview");

  const fetchDashboardData = useCallback(async () => {
    setIsPageLoading(true);
    setError(null);
    try {
      // Fetch interviews from the backend API
      const allBackendInterviews: BackendInterviewObject[] = await withRetry(
        () => interviewApi.getAllInterviews()
      );

      // Map backend data to display format
      const mappedInterviews: InterviewDisplayItem[] = allBackendInterviews.map(
        (beInterview) => ({
          id: beInterview.id,
          candidate: beInterview.candidate?.name || "Unknown Candidate",
          role: beInterview.candidate?.role || beInterview.title || "N/A",
          date: beInterview.date || (beInterview.status === "completed" ? beInterview.updatedAt : beInterview.createdAt),
          score: beInterview.score ?? undefined,
          status: beInterview.status,
          avatar: beInterview.candidate?.avatarUrl || undefined,
          domain: beInterview.domain,
          difficulty: beInterview.level,
        })
      );

      // Filter recent and upcoming interviews
      const recent = mappedInterviews
        .filter((interview) => interview.status === "completed")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const upcoming = mappedInterviews
        .filter((interview) => 
          interview.status === "scheduled" || 
          interview.status === "pending_ai_generation" || 
          interview.status === "in_progress"
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setRecentInterviews(recent);
      setUpcomingInterviews(upcoming);

      // Calculate statistics
      const completedCount = allBackendInterviews.filter(i => i.status === "completed").length;
      const totalScores = allBackendInterviews
        .filter(i => i.status === "completed" && typeof i.score === "number")
        .reduce((sum, i) => sum + (i.score ?? 0), 0);
      const avgScore = completedCount > 0 ? Math.round(totalScores / completedCount) : 0;
      
      // Calculate average duration
      const totalDuration = allBackendInterviews
        .filter(i => i.status === "completed" && typeof i.duration === "number")
        .reduce((sum, i) => sum + (i.duration ?? 0), 0);
      const avgDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;

      setStats({
        totalInterviews: allBackendInterviews.length,
        completedInterviews: completedCount,
        scheduledInterviews: allBackendInterviews.filter(
          i => i.status === "scheduled" || i.status === "pending_ai_generation"
        ).length,
        totalCandidates: [...new Set(allBackendInterviews.map(i => i.candidateId).filter(Boolean))].length,
        avgScore: avgScore,
        avgDuration: avgDuration,
      });

      // In a real implementation, you would fetch these analytics from your API
      // For now, we'll use the mock data
      // setDomainAnalytics(domainAnalyticsFromAPI);
      // setTimeAnalytics(timeAnalyticsFromAPI);
      // etc.

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = handleApiError(err, () => {});
      setError(errorMessage || "Failed to load dashboard data.");
      toast({
        title: "Data Load Error",
        description: errorMessage || "Could not fetch interview data.",
        variant: "destructive",
      });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchDashboardData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus, fetchDashboardData, router]);

  const handleStartInterview = async () => {
    if (!selectedDomain || !selectedDifficulty) {
      toast({
        title: "Missing information",
        description: "Please select both domain and difficulty level",
        variant: "destructive",
      });
      return;
    }

    setIsQuickStartLoading(true);
    try {
      const domainName = domains.find(d => d.id === selectedDomain)?.name || selectedDomain;
      const difficultyName = difficultyLevels.find(l => l.id === selectedDifficulty)?.name || selectedDifficulty;

      toast({
        title: "Preparing New Interview...",
        description: `Domain: ${domainName}, Difficulty: ${difficultyName}`,
      });

      router.push(`/dashboard/interviews/new?domain=${selectedDomain}&level=${selectedDifficulty}`);
    } catch (error) {
      console.error("Error preparing quick start interview:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to new interview page.",
        variant: "destructive",
      });
      setIsQuickStartLoading(false);
    }
  };

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && isPageLoading)) {
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
        <Button onClick={fetchDashboardData} disabled={isPageLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isPageLoading ? "animate-spin" : ""}`} /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your interview activities and analytics
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
              <span>from last month</span>
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
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">8%</span>
              <span>more than previous</span>
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
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Upcoming this month</span>
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
                  {stats.avgScore > 0 ? `${stats.avgScore}/100` : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">5%</span>
              <span>vs. target</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Interview Analytics</CardTitle>
              <CardDescription>
                Comprehensive view of your interview performance metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last Quarter</SelectItem>
                  <SelectItem value="365d">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-1.5">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={analyticsView} onValueChange={setAnalyticsView}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Over Time Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Over Time</CardTitle>
                    <CardDescription>Average interview scores by month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={timeAnalytics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          name="Average Score"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Interview Volume Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interview Volume</CardTitle>
                    <CardDescription>Number of interviews conducted by month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={timeAnalytics}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="interviews"
                          name="Interviews"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Skills Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills Breakdown</CardTitle>
                  <CardDescription>Performance across different skill categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {skillsBreakdown.map((skill) => (
                        <div key={skill.name}>
                          <div className="flex justify-between mb-1 text-sm">
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
                    <div className="flex items-center justify-center h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={skillsBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="score"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {skillsBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-6">
              {/* Domain Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Domain Performance Comparison</CardTitle>
                  <CardDescription>Average scores and interview counts by domain</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={domainAnalytics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="interviews" name="Number of Interviews" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="avgScore" name="Average Score" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Domain Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Duration by Domain</CardTitle>
                  <CardDescription>Average time spent in interviews by domain</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={domainAnalytics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} min`, 'Average Duration']} />
                      <Legend />
                      <Bar dataKey="avgDuration" name="Average Duration (minutes)" fill="#ff7c43" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              {/* Most Common Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Frequently Asked Questions</CardTitle>
                  <CardDescription>Categories with the highest number of questions</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={questionAnalytics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Questions" fill="#8884d8">
                        {questionAnalytics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS] || '#8884d8'} 
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Question Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Response Time by Question Category</CardTitle>
                  <CardDescription>Time taken to answer questions by category (minutes)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={questionAnalytics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip formatter={(value) => [`${value} min`, 'Average Time']} />
                      <Legend />
                      <Bar dataKey="avgTime" name="Average Response Time (minutes)" fill="#82ca9d">
                        {questionAnalytics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS] || '#82ca9d'} 
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              {/* Common Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbackTrends.map((feedback, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{feedback.category}</CardTitle>
                      <CardDescription>Common feedback from interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feedback.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className={`mt-1 h-2 w-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-amber-500'}`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feedback Word Cloud Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Sentiment Analysis</CardTitle>
                  <CardDescription>Positive vs. constructive feedback distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <div className="flex items-center justify-center h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Positive Feedback', value: 65 },
                            { name: 'Constructive Feedback', value: 35 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#4caf50" />
                          <Cell fill="#ff9800" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Interview Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Interview Start</CardTitle>
          <CardDescription>
            Start a new interview by selecting domain and difficulty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <Label htmlFor="domain" className="mb-2 block">
                Select Domain
              </Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center gap-2">
                        <domain.icon className="h-4 w-4" />
                        <span>{domain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 md:mt-0">
              <Label className="mb-2 block">Select Difficulty</Label>
              <RadioGroup
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
                className="flex gap-4 pt-2"
              >
                {difficultyLevels.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.id} id={level.id} />
                    <Label htmlFor={level.id} className="font-normal">
                      {level.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button
              onClick={handleStartInterview}
              disabled={isQuickStartLoading || !selectedDomain || !selectedDifficulty}
              className="w-full md:w-auto"
            >
              {isQuickStartLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Play className="h-4 w-4 mr-2" />
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent and Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your most recently completed interviews</CardDescription>
            </div>
            <Link href="/dashboard/interviews">
              <Button variant="outline" size="sm">
                <ListIcon className="h-4 w-4 mr-1" /> View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInterviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent interviews found
                </div>
              ) : (
                recentInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/dashboard/interviews/${interview.id}/results`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={interview.avatar} alt={interview.candidate} />
                          <AvatarFallback>
                            {interview.candidate?.charAt(0)?.toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{interview.candidate}</p>
                          <p className="text-sm text-muted-foreground">{interview.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{formatDate(interview.date)}</p>
                            {interview.domain && (
                              <Badge variant="outline" className="text-xs">
                                {interview.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {interview.status === "completed" && typeof interview.score === "number" ? (
                        <div className="text-right">
                          <p className="text-sm font-medium mb-1">
                            Score: {interview.score}/100
                          </p>
                          <Progress
                            value={interview.score}
                            className="w-24 h-2"
                            indicatorClassName={
                              interview.score >= 70
                                ? "bg-green-500"
                                : interview.score >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }
                          />
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {interview.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Scheduled and in-progress interviews</CardDescription>
            </div>
            <Link href="/dashboard/interviews/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> New Interview
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming interviews scheduled
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/dashboard/interviews/${interview.id}/setup`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={interview.avatar} alt={interview.candidate} />
                          <AvatarFallback>
                            {interview.candidate?.charAt(0)?.toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{interview.candidate}</p>
                          <p className="text-sm text-muted-foreground">{interview.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{formatDate(interview.date)}</p>
                            {interview.domain && (
                              <Badge variant="outline" className="text-xs">
                                {interview.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        >
                          {interview.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}