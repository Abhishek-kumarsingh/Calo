"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ServerCrash,
  Search,
  Filter,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";

interface SystemLog {
  id: string;
  action: string;
  category: string;
  details: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  resourceId?: string | null;
  resourceType?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Success</Badge>;
      case 'failure':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" /> Failure</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-500"><Info className="h-3 w-3 mr-1" /> Info</Badge>;
    }
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'auth':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Auth</Badge>;
      case 'user':
        return <Badge variant="outline" className="border-green-500 text-green-500">User</Badge>;
      case 'interview':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Interview</Badge>;
      case 'question':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Question</Badge>;
      case 'admin':
        return <Badge variant="outline" className="border-red-500 text-red-500">Admin</Badge>;
      case 'system':
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-500">System</Badge>;
    }
  };

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      
      if (startDate) {
        params.append('startDate', startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }

      // Fetch logs from API
      const response = await fetch(`/api/admin/logs?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch system logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      setError(error.message || "Failed to fetch system logs");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch system logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchLogs(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchLogs(page);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setStatus("");
    setStartDate(undefined);
    setEndDate(undefined);
    fetchLogs(1);
  };

  // Loading state
  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading system logs...</p>
      </div>
    );
  }

  // Error state
  if (error && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading System Logs</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={() => fetchLogs()}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Logs</h1>
        <p className="text-muted-foreground">
          View and search system activity logs
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <div className="flex items-center space-x-2">
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  placeholder="Start date"
                />
                <span>to</span>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Showing {logs.length} of {pagination.total} logs
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-xs">{formatDate(log.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{getCategoryBadge(log.category)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="text-xs">
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-muted-foreground">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md text-xs">
                          {log.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow;
                    if (pagination.totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (pagination.page <= 3) {
                      pageToShow = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageToShow = pagination.totalPages - 4 + i;
                    } else {
                      pageToShow = pagination.page - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageToShow)}
                          isActive={pagination.page === pageToShow}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
