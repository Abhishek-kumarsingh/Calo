"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { interviewApi, handleApiError } from "@/lib/api-utils";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  FileText, // Changed from File for clarity
  MoreHorizontal,
  Eye, // Changed from EyeIcon for consistency with lucide-react names
  Code,
  Database,
  BarChart3, // Changed from BarChart
  Layers,
  Trash2, // For delete icon
  RefreshCw, // For refresh/retry
  ServerCrash, // For error icon
  CheckSquare, // For select all
  AlertCircle, // For warning
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Interview data type - Align this with your backend's src/types.ts Interview interface
type Interview = {
  id: string;
  title?: string | null;
  domain: string;
  subDomain: string;
  level: string;
  status: string;
  score?: number | null;
  createdAt: string;
  updatedAt?: string;
  questions?: Array<{
    // Usually for AI-generated interviews
    question: string;
    answer: string;
    feedback: string;
    score?: number | null;
  }>;
  overallFeedback?: string | null;
  type?: string; // e.g., 'ai_generated', 'technical', 'behavioral'
  candidateId?: string | null; // You might want to populate and display candidate name
  userId?: string; // You might want to populate and display interviewer name
  date?: string | null; // Date of the interview (if scheduled)
  duration?: number | null; // Duration in minutes
};

// Format date helper
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      // hour: '2-digit', // Often not needed for 'Created At' in a list view
      // minute: '2-digit'
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
  let className = "";

  switch (status.toLowerCase()) {
    case "completed":
      className =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300";
      break;
    case "in_progress":
      className =
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300";
      break;
    case "scheduled":
      className =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300";
      break;
    case "pending_ai_generation":
      className =
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300";
      break;
    case "cancelled":
      className =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300";
      variant = "destructive";
      break;
    default:
      className =
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300";
  }
  return (
    <Badge variant={variant} className={className}>
      {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </Badge>
  );
};

// Domain icon component
const DomainIcon = ({ domain }: { domain: string }) => {
  switch (domain.toLowerCase()) {
    case "frontend":
      return <Code className="h-5 w-5 text-blue-500" />;
    case "backend":
      return <Database className="h-5 w-5 text-green-500" />;
    case "fullstack":
      return <Layers className="h-5 w-5 text-purple-500" />;
    case "data_science": // Example
    case "data_analytics":
      return <BarChart3 className="h-5 w-5 text-orange-500" />;
    default:
      return <Code className="h-5 w-5 text-gray-500" />;
  }
};

export default function InterviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the interviewApi utility function instead of direct fetch
      const data = await interviewApi.getAllInterviews();
      setInterviews(data);
    } catch (err: any) {
      console.error("Error fetching interviews:", err);
      setError(
        err.message || "An unexpected error occurred while fetching interviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleDeleteInterview = async (interviewId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this interview? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      // Use the interviewApi utility function instead of direct fetch
      await interviewApi.deleteInterview(interviewId);

      // Re-fetch interviews or remove from local state
      setInterviews((prevInterviews) =>
        prevInterviews.filter((interview) => interview.id !== interviewId)
      );
      // Clear this interview from selected interviews if it was selected
      setSelectedInterviews(prev => prev.filter(id => id !== interviewId));
      alert("Interview deleted successfully."); // Replace with a toast notification
    } catch (err: any) {
      console.error("Error deleting interview:", err);
      alert(`Error: ${err.message}`); // Replace with a toast notification
    }
  };

  const handleBatchDeleteInterviews = async () => {
    if (selectedInterviews.length === 0) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedInterviews.length} selected interview${
          selectedInterviews.length > 1 ? "s" : ""
        }? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const totalCount = selectedInterviews.length;

      // Initialize progress state
      setDeletionProgress({
        current: 0,
        total: totalCount,
        success: 0,
        failed: 0
      });

      // Update UI to show we're starting the process
      setDeletionProgress(prev => ({
        ...prev,
        current: 1
      }));

      console.log(`Attempting to batch delete ${selectedInterviews.length} interviews...`);

      // Use the batch delete API
      const result = await interviewApi.batchDeleteInterviews(selectedInterviews);

      console.log('Batch delete result:', result);

      // Update the UI based on the result
      if (result && result.deletedCount) {
        // Update success count
        setDeletionProgress(prev => ({
          ...prev,
          current: totalCount,
          success: result.deletedCount,
          failed: totalCount - result.deletedCount
        }));

        // Remove deleted interviews from the UI
        if (result.successIds && Array.isArray(result.successIds)) {
          // If we have specific IDs that were successfully deleted
          setInterviews(prevInterviews =>
            prevInterviews.filter(interview => !result.successIds.includes(interview.id))
          );
        } else {
          // Fallback to removing all selected interviews
          setInterviews(prevInterviews =>
            prevInterviews.filter(interview => !selectedInterviews.includes(interview.id))
          );
        }

        // Clear selection
        setSelectedInterviews([]);

        // Show success message with details about failed deletions if any
        if (result.failedIds && result.failedIds.length > 0) {
          alert(`Successfully deleted ${result.deletedCount} interview${result.deletedCount !== 1 ? 's' : ''}. Failed to delete ${result.failedIds.length} interview${result.failedIds.length !== 1 ? 's' : ''}.`);
        } else {
          alert(`Successfully deleted ${result.deletedCount} interview${result.deletedCount !== 1 ? 's' : ''}.`);
        }
      } else {
        throw new Error('Failed to delete interviews. No interviews were deleted.');
      }

      // Reset document title
      document.title = "Dashboard - InterviewAI";
    } catch (err: any) {
      console.error("Error deleting interviews:", err);
      alert(`Error: ${err.message}`); // Replace with a toast notification
    } finally {
      setIsDeleting(false);
      // Reset progress
      setDeletionProgress({ current: 0, total: 0, success: 0, failed: 0 });
    }
  };

  const handleSelectInterview = (interviewId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedInterviews(prev => [...prev, interviewId]);
    } else {
      setSelectedInterviews(prev => prev.filter(id => id !== interviewId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allFilteredIds = filteredInterviews.map(interview => interview.id);
      setSelectedInterviews(allFilteredIds);
    } else {
      setSelectedInterviews([]);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      interview.domain.toLowerCase().includes(searchLower) ||
      (interview.subDomain &&
        interview.subDomain.toLowerCase().includes(searchLower)) ||
      (interview.level &&
        interview.level.toLowerCase().includes(searchLower)) ||
      (interview.title && interview.title.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === "all" || interview.status === statusFilter;
    const matchesDomain =
      domainFilter === "all" || interview.domain === domainFilter;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Domains for cards and filters - could be fetched or configured
  const availableDomains = [
    {
      value: "frontend",
      label: "Frontend",
      icon: Code,
      color: "text-blue-500",
      description: "React, Vue, Angular, CSS, HTML, JavaScript",
    },
    {
      value: "backend",
      label: "Backend",
      icon: Database,
      color: "text-green-500",
      description: "Node.js, Python, Java, Databases, APIs",
    },
    {
      value: "fullstack",
      label: "Full Stack",
      icon: Layers,
      color: "text-purple-500",
      description: "End-to-end development, Architecture",
    },
    {
      value: "data_science",
      label: "Data Science",
      icon: BarChart3,
      color: "text-orange-500",
      description: "SQL, Python, ML, Stats, Visualization",
    },
  ];

  const availableStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "scheduled", label: "Scheduled" },
    { value: "pending_ai_generation", label: "Pending AI" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading interviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Failed to Load Interviews
        </h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchInterviews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
            Technical Interviews
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and review AI-powered and manual technical interviews.
          </p>
        </div>
        <Link href="/dashboard/interviews/new">
          {" "}
          {/* Adjust link as per your routing */}
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Interview
          </Button>
        </Link>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {availableDomains.map((domain) => {
          const IconComponent = domain.icon;
          return (
            <Card
              key={domain.value}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setDomainFilter(domain.value)}
            >
              <CardHeader className="pb-2 flex-row items-center space-x-3">
                <IconComponent className={`h-6 w-6 ${domain.color}`} />
                <CardTitle className="text-lg font-semibold">
                  {domain.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {domain.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title, domain, subdomain, or level..."
            className="pl-10 w-full" // Ensure input takes full width in its container
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:flex-none">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {availableDomains.map((domain) => (
                <SelectItem key={domain.value} value={domain.value}>
                  {domain.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Actions Bar - Only visible when interviews are selected */}
      {selectedInterviews.length > 0 && (
        <div className="bg-muted/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-10 p-4 border-t shadow-lg flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {selectedInterviews.length} interview{selectedInterviews.length > 1 ? 's' : ''} selected
            </span>
          </div>

          {isDeleting && (
            <div className="w-full md:w-1/2 mb-2 md:mb-0 md:mx-4">
              <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{
                    width: deletionProgress.total > 0
                      ? `${Math.round((deletionProgress.current / deletionProgress.total) * 100)}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                <span>
                  {deletionProgress.success > 0 && (
                    <span className="text-green-500 mr-2">
                      {deletionProgress.success} succeeded
                    </span>
                  )}
                  {deletionProgress.failed > 0 && (
                    <span className="text-red-500">
                      {deletionProgress.failed} failed
                    </span>
                  )}
                </span>
                <span>
                  {deletionProgress.current} of {deletionProgress.total}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedInterviews([])}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDeleteInterviews}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Interviews Table */}
      <Card>
        <CardContent className="p-0">
          {" "}
          {/* Remove CardContent padding if table has its own */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      filteredInterviews.length > 0 &&
                      selectedInterviews.length === filteredInterviews.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all interviews"
                  />
                </TableHead>
                <TableHead className="w-[150px]">Domain</TableHead>
                <TableHead>Title / Sub-Domain</TableHead>
                <TableHead className="hidden md:table-cell">Level</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Score</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => (
                  <TableRow
                    key={interview.id}
                    className={selectedInterviews.includes(interview.id) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedInterviews.includes(interview.id)}
                        onCheckedChange={(checked) =>
                          handleSelectInterview(interview.id, checked === true)
                        }
                        aria-label={`Select interview ${interview.title || interview.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DomainIcon domain={interview.domain} />
                        <span className="font-medium capitalize">
                          {interview.domain.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {interview.title || interview.subDomain || "N/A"}
                    </TableCell>
                    <TableCell className="capitalize hidden md:table-cell">
                      {interview.level || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(interview.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={interview.status} />
                    </TableCell>
                    <TableCell>
                      {interview.status === "completed" &&
                      typeof interview.score === "number" ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {interview.score}
                          </span>
                          <Progress
                            value={interview.score}
                            className="h-2 w-16 bg-muted-foreground/20"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {interview.status === "completed"
                            ? "Not Scored"
                            : "Pending"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            aria-label="Open menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {/* Adjust links based on your routing and interview types/status */}
                          {(interview.status === "in_progress" ||
                            interview.status === "pending_ai_generation" ||
                            interview.status === "scheduled") && (
                            <Link
                              href={`/dashboard/interviews/${interview.id}/take`}
                            >
                              {" "}
                              {/* Generic conduct link */}
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>
                                  {interview.status === "scheduled"
                                    ? "Start"
                                    : "Continue"}{" "}
                                  Interview
                                </span>
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {interview.status === "completed" && (
                            <Link
                              href={`/dashboard/interviews/${interview.id}/results`}
                            >
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                <span>View Results</span>
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {/* <Link href={`/dashboard/interviews/${interview.id}/edit`}> Edit link if applicable
                            <DropdownMenuItem>
                                <FileEdit className="mr-2 h-4 w-4" />
                                <span>Edit Details</span>
                            </DropdownMenuItem>
                           </Link> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 hover:!bg-red-50 hover:!text-red-700 dark:hover:!bg-red-900/50 dark:hover:!text-red-400"
                            onClick={() => handleDeleteInterview(interview.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Interview</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="mb-2 font-semibold">
                        No interviews match your criteria.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters, or create a new
                        one.
                      </p>
                      <Button className="mt-6" size="sm" asChild>
                        <Link href="/dashboard/interviews/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Start a New Interview
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {filteredInterviews.length > 0 && (
          <CardFooter className="py-4 text-xs text-muted-foreground">
            Showing {filteredInterviews.length} of {interviews.length}{" "}
            interviews.
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
