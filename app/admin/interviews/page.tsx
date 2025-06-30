"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Filter,
  RefreshCcw,
  Loader2,
  ServerCrash,
  Eye,
  Trash2,
  MessageSquare,
  Clock,
  Calendar,
} from "lucide-react";

interface Interview {
  id: string;
  title: string;
  status: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  domain?: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
  questionCount?: number;
}

export default function InterviewsPage() {
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch interviews data
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockInterviews: Interview[] = [
          {
            id: "1",
            title: "Frontend Developer Interview",
            status: "completed",
            userId: "user1",
            userName: "John Doe",
            userEmail: "john@example.com",
            domain: "Frontend",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            duration: 30,
            questionCount: 8,
          },
          {
            id: "2",
            title: "Backend Developer Interview",
            status: "in_progress",
            userId: "user2",
            userName: "Jane Smith",
            userEmail: "jane@example.com",
            domain: "Backend",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            questionCount: 10,
          },
          {
            id: "3",
            title: "Full Stack Developer Interview",
            status: "scheduled",
            userId: "user3",
            userName: "Bob Johnson",
            userEmail: "bob@example.com",
            domain: "Full Stack",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            questionCount: 12,
          },
          {
            id: "4",
            title: "Data Science Interview",
            status: "completed",
            userId: "user4",
            userName: "Alice Brown",
            userEmail: "alice@example.com",
            domain: "Data Science",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
            duration: 45,
            questionCount: 10,
          },
          {
            id: "5",
            title: "DevOps Engineer Interview",
            status: "completed",
            userId: "user5",
            userName: "Charlie Wilson",
            userEmail: "charlie@example.com",
            domain: "DevOps",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
            duration: 35,
            questionCount: 9,
          },
        ];
        
        setInterviews(mockInterviews);
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error fetching interviews:", error);
      setError(error.message || "Failed to fetch interviews");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch interviews",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  // Filter interviews based on search term
  const filteredInterviews = interviews.filter(interview =>
    interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state
  if (loading && interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading interviews...</p>
      </div>
    );
  }

  // Error state
  if (error && interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading Interviews</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchInterviews}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all interviews in the system
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                <p className="text-3xl font-bold">{interviews.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">
                  {interviews.filter(i => i.status === "completed").length}
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                <p className="text-3xl font-bold">
                  {Math.round(
                    interviews
                      .filter(i => i.duration)
                      .reduce((acc, i) => acc + (i.duration || 0), 0) / 
                    interviews.filter(i => i.duration).length || 0
                  )} min
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Interviews</CardTitle>
              <CardDescription>
                View and manage all interviews
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchInterviews} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search interviews..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interview</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading interviews...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No interviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.title}</p>
                          <p className="text-sm text-muted-foreground">{interview.domain}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.userName}</p>
                          <p className="text-sm text-muted-foreground">{interview.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(interview.status)}</TableCell>
                      <TableCell>{formatDate(interview.createdAt)}</TableCell>
                      <TableCell>{interview.questionCount || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Interview
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
