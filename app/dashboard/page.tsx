"use client";

import {
  useState,
  useEffect,
  useCallback, // Added useCallback
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // For potential auth checks
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
import { Progress } from "@/components/ui/progress"; // Ensure this is your updated Progress component

import { useToast } from "@/hooks/use-toast";
import {
  BarChart3 as BarChart, // Aliased to match your original usage
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Clock,
  Globe,
  Server,
  Layers, // Added Layers from previous versions if needed for domains
  Brain,
  Play,
  List as ListIcon, // Aliased List
  Loader2, // For loading state
  AlertTriangle, // For error state
  RefreshCw, // For retry
  PieChart, // Added for dashboard links
  Code,
  Database,
  LineChart,
  BarChart3,
  FileText,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

// Import recharts components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { interviewApi, handleApiError, withRetry } from "@/lib/api-utils-updated"; // Your API utilities
import { Badge } from "@/components/ui/badge";

// --- Domain and Level constants (as in your provided code) ---
const domains = [
  { id: "frontend", name: "Frontend Development", icon: Globe },
  { id: "backend", name: "Backend Development", icon: Server },
  // Add other domains if they were in your original full code for this page
  // For example, if 'fullstack' and 'data' were used in the quick start:
  // { id: 'fullstack', name: 'Full Stack', description: 'End-to-end application development', icon: Layers },
  // { id: 'data', name: 'Data Science', description: 'Data analysis and machine learning', icon: BarChart }
];

const difficultyLevels = [
  { id: "basic", name: "Basic" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];
// --- End Constants ---

// Mock data for charts
const mockQuestionGenerationData = [
  { month: 'Jan', count: 45 },
  { month: 'Feb', count: 62 },
  { month: 'Mar', count: 78 },
  { month: 'Apr', count: 95 },
  { month: 'May', count: 130 },
  { month: 'Jun', count: 167 },
];

const mockDomainDistributionData = [
  { name: 'Frontend', value: 45 },
  { name: 'Backend', value: 35 },
  { name: 'Full Stack', value: 20 },
];

const mockAIAssistanceData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 25 },
  { month: 'Apr', count: 32 },
  { month: 'May', count: 48 },
  { month: 'Jun', count: 56 },
];

const mockInterviewPerformanceData = [
  { domain: 'Frontend', score: 78 },
  { domain: 'Backend', score: 82 },
  { domain: 'Full Stack', score: 75 },
];

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

// Frontend Interview data type (as in your provided code)
interface InterviewDisplayItem {
  // Renamed to avoid conflict with a potentially more detailed Interview type
  id: string;
  candidate: string; // Candidate's Name
  role: string; // Candidate's Role
  date: string; // Interview Date (or creation/update date)
  score?: number;
  status: string;
  avatar?: string; // URL for candidate's avatar
}

// This type should match what your backend's /api/interviews actually returns for EACH interview object
// including populated candidate details if applicable.
interface BackendInterviewObject {
  id: string;
  title: string; // You might use this or derive role from candidate
  domain: string;
  status: string;
  score?: number | null;
  date?: string | null; // Scheduled date
  createdAt: string; // Always available
  updatedAt: string; // Always available
  candidateId?: string | null;
  candidate?: {
    // If backend populates candidateId
    id: string;
    name: string;
    role?: string | null; // Role candidate is applying for
    avatarUrl?: string | null;
    // ... other candidate fields
  } | null;
  // ... other fields like type, level, subDomain etc. from your main Interview model
}

// Format date helper (as in your provided code)
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isQuickStartLoading, setIsQuickStartLoading] = useState(false); // Renamed for clarity

  const [recentInterviews, setRecentInterviews] = useState<
    InterviewDisplayItem[]
  >([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<
    InterviewDisplayItem[]
  >([]);

  // These state variables are kept for the "Start Your First Interview" button in the Analytics Overview section
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    difficultyLevels[1].id
  ); // Default to intermediate as per original

  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    scheduledInterviews: 0,
    totalCandidates: 0, // Kept this as per your original
    avgScore: 0, // Added for analytics section
  });
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsPageLoading(true);
    setError(null);
    try {
      // Fetch interviews from the backend API using your utility
      const allBackendInterviews: BackendInterviewObject[] = await withRetry(
        () => interviewApi.getAllInterviews()
      );

      // --- Data Mapping from BackendInterviewObject to InterviewDisplayItem ---
      const mappedInterviews: InterviewDisplayItem[] = allBackendInterviews.map(
        (beInterview) => ({
          id: beInterview.id,
          candidate: beInterview.candidate?.name || "Unknown Candidate",
          role: beInterview.candidate?.role || beInterview.title || "N/A", // Use candidate's role, fallback to interview title
          // Use 'date' if available (scheduled date), else 'updatedAt' for completed, else 'createdAt'
          date:
            beInterview.date ||
            (beInterview.status === "completed"
              ? beInterview.updatedAt
              : beInterview.createdAt),
          score: beInterview.score ?? undefined, // Handle null score from backend
          status: beInterview.status,
          avatar: beInterview.candidate?.avatarUrl || undefined, // Get avatar from candidate object
        })
      );
      // --- End Data Mapping ---

      const recent = mappedInterviews
        .filter((interview) => interview.status === "completed")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5); // Limit for dashboard display

      const upcoming = mappedInterviews
        .filter(
          (interview) =>
            interview.status === "scheduled" ||
            interview.status === "pending_ai_generation" ||
            interview.status === "in_progress"
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5); // Limit for dashboard display

      setRecentInterviews(recent);
      setUpcomingInterviews(upcoming);

      const completedCount = allBackendInterviews.filter(
        (i) => i.status === "completed"
      ).length;
      const totalScores = allBackendInterviews
        .filter((i) => i.status === "completed" && typeof i.score === "number")
        .reduce((sum, i) => sum + (i.score ?? 0), 0);
      const avgScore =
        completedCount > 0 ? Math.round(totalScores / completedCount) : 0;

      setStats({
        totalInterviews: allBackendInterviews.length,
        completedInterviews: completedCount,
        scheduledInterviews: allBackendInterviews.filter(
          (i) =>
            i.status === "scheduled" || i.status === "pending_ai_generation"
        ).length,
        totalCandidates: Array.from(
          new Set(
            allBackendInterviews.map((i) => i.candidateId).filter(Boolean)
          )
        ).length,
        avgScore: avgScore,
      });
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
      // Debug: Check if token exists in localStorage
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'exists' : 'not found');
      
      // If token doesn't exist, try to get it from the session
      if (!token && session?.user) {
        // Redirect to login to get a proper token
        router.push("/auth/login?callbackUrl=/dashboard");
        return;
      }

      fetchDashboardData();
    } else if (
      sessionStatus === "unauthenticated"
    ) {
      // check loading to prevent premature redirect
      router.push("/auth/login?callbackUrl=/dashboard");
    }
  }, [sessionStatus, fetchDashboardData, router, session]);

  const handleStartInterview = async () => {
    // Renamed for clarity
    if (!selectedDomain || !selectedDifficulty) {
      toast({
        title: "Missing information",
        description: "Please select both domain and difficulty level",
        variant: "destructive",
      });
      return;
    }

    setIsQuickStartLoading(true); // Use the specific loading state
    try {
      const domainName =
        domains.find((d) => d.id === selectedDomain)?.name || selectedDomain;
      const difficultyName =
        difficultyLevels.find((l) => l.id === selectedDifficulty)?.name ||
        selectedDifficulty;

      toast({
        title: "Preparing New Interview...",
        description: `Domain: ${domainName}, Difficulty: ${difficultyName}`,
      });

      // Navigate to interviews/new page with query params
      // The NewInterviewPage will handle the actual creation API call.
      router.push(
        `/dashboard/interviews/new?domain=${selectedDomain}&level=${selectedDifficulty}`
      );
    } catch (error) {
      // This catch block is unlikely to be hit for a simple router.push
      console.error("Error preparing quick start interview:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to new interview page.",
        variant: "destructive",
      });
      setIsQuickStartLoading(false); // Reset loading if navigation fails somehow
    }
    // No finally setIsQuickStartLoading(false) here if navigation is expected to succeed.
    // If the NewInterviewPage fails, it will handle its own loading/error states.
  };

  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && isPageLoading)
  ) {
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
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isPageLoading ? "animate-spin" : ""}`}
          />{" "}
          Try Again
        </Button>
      </div>
    );
  }

  // ----- THE REST OF YOUR JSX UI REMAINS THE SAME AS YOUR ORIGINAL -----
  // I will include it here for completeness, with only minor adjustments if needed
  // for data mapping or consistency.

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your interview activities
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/real-analytics">
            <Button className="w-full sm:w-auto flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Real-time Analytics</span>
            </Button>
          </Link>
          <Link href="/dashboard/enhanced-dashboard">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Enhanced Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-aos="fade-up" data-aos-duration="500">
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
            {/* Trend data can be dynamic or removed if not available */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
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

        <Card data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
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

        <Card data-aos="fade-up" data-aos-duration="500" data-aos-delay="300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Score
                </p>{" "}
                {/* Changed from Candidates */}
                <p className="text-3xl font-bold">
                  {stats.avgScore > 0 ? `${stats.avgScore}/100` : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <BarChart className="h-6 w-6 text-purple-500" />{" "}
                {/* Using your aliased BarChart */}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              {/* Trend for avg score can be calculated or be static */}
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">5%</span>
              <span>vs. target</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Analytics Dashboard */}
      <Card className="mb-8" data-aos="fade-up" data-aos-duration="800">
        <CardHeader>
          <CardTitle>Interview Analytics Dashboard</CardTitle>
          <CardDescription>
            Visual overview of your interview activities and question generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question Generation Chart */}
            <div className="space-y-2" data-aos="fade-right" data-aos-delay="100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Questions Generated
                </h3>
                <Badge variant="outline" className="text-xs">
                  Total: 577
                </Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockQuestionGenerationData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Questions"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Domain Distribution Chart */}
            <div className="space-y-2" data-aos="fade-left" data-aos-delay="200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2 text-primary" />
                  Domain Distribution
                </h3>
                <Badge variant="outline" className="text-xs">
                  3 Domains
                </Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockDomainDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockDomainDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Assistance Usage Chart */}
            <div className="space-y-2" data-aos="fade-right" data-aos-delay="300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  AI Assistance Usage
                </h3>
                <Badge variant="outline" className="text-xs">
                  192 Interactions
                </Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={mockAIAssistanceData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="AI Interactions"
                      fill="#82ca9d"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interview Performance Chart */}
            <div className="space-y-2" data-aos="fade-left" data-aos-delay="400">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Performance by Domain
                </h3>
                <Badge variant="outline" className="text-xs">
                  Avg: 78/100
                </Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={mockInterviewPerformanceData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      dataKey="score"
                      name="Avg. Score"
                      fill="#ffc658"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center" data-aos="zoom-in" data-aos-delay="500">
            <Link href="/dashboard/interviews/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Start New Interview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Activity */}
        <div className="lg:col-span-2" data-aos="fade-up" data-aos-duration="800">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interview Activity</CardTitle>
                <CardDescription>
                  Track your recent and upcoming interviews
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/interviews">
                  {" "}
                  {/* Changed from /routes */}
                  <Button variant="outline">
                    <ListIcon className="h-4 w-4 mr-1" /> All Interviews
                  </Button>
                </Link>
                <Link href="/dashboard/interviews/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-1" /> New Interview
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="space-y-4">
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
                              <AvatarImage
                                src={interview.avatar}
                                alt={interview.candidate}
                              />
                              <AvatarFallback>
                                {interview.candidate
                                  ?.charAt(0)
                                  ?.toUpperCase() || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {interview.candidate}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {interview.role}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(interview.date)}
                              </p>
                            </div>
                          </div>
                          {interview.status === "completed" &&
                          typeof interview.score === "number" ? (
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
                              {" "}
                              {/* Fallback for other statuses */}
                              {interview.status
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingInterviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming interviews scheduled
                    </div>
                  ) : (
                    upcomingInterviews.map((interview) => (
                      // Link for upcoming interviews might go to a setup or detail page, not results yet
                      <Link
                        key={interview.id}
                        href={`/dashboard/interviews/${interview.id}/setup`} // Or just /${interview.id} for a detail view
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage
                                src={interview.avatar}
                                alt={interview.candidate}
                              />
                              <AvatarFallback>
                                {interview.candidate
                                  ?.charAt(0)
                                  ?.toUpperCase() || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {interview.candidate}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {interview.role}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(interview.date)}
                              </p>
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Overview Analytics Card (UI structure remains same, data is hardcoded) */}
        <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Interview performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.completedInterviews > 0 ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Average Score</p>
                      <p className="text-sm font-bold">{stats.avgScore}/100</p>
                    </div>
                    <Progress
                      value={stats.avgScore}
                      className="h-2"
                      indicatorClassName={
                        stats.avgScore >= 70
                          ? "bg-green-500"
                          : stats.avgScore >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    />
                  </div>
                  {/* Other hardcoded analytics can remain or be replaced by dynamic data */}
                  {/* ... (Communication Skills, Technical Knowledge, etc.) ... */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">
                        Communication Skills
                      </p>
                      <p className="text-sm font-bold">82/100</p>
                    </div>
                    <Progress
                      value={82}
                      className="h-2"
                      indicatorClassName="bg-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Technical Knowledge</p>
                      <p className="text-sm font-bold">75/100</p>
                    </div>
                    <Progress
                      value={75}
                      className="h-2"
                      indicatorClassName="bg-sky-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No analytics available
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete some interviews to see performance analytics and
                    feedback metrics.
                  </p>
                  <Button
                    onClick={handleStartInterview}
                    disabled={
                      isQuickStartLoading ||
                      !selectedDomain ||
                      !selectedDifficulty
                    }
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Your First Interview
                  </Button>
                </div>
              )}
            </CardContent>
            {stats.completedInterviews > 0 && (
              <CardFooter>
                <Link href="/dashboard/analytics" className="w-full">
                  {" "}
                  {/* Ensure Link wraps Button or use asChild */}
                  <Button variant="outline" className="w-full">
                    <BarChart className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
