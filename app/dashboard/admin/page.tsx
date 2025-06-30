"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Calendar,
  ArrowUpRight,
  MessageSquare,
  UserCheck,
  Filter,
  RefreshCcw,
  BarChart3,
  PieChart,
  UserCog,
  Layers,
  Activity,
  Settings,
  Loader2,
  ServerCrash,
  Pencil,
  Trash2,
} from 'lucide-react';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { ActivityTracker } from '@/components/admin/activity-tracker';

// Define interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface DashboardStats {
  counts: {
    totalUsers: number;
    totalInterviews: number;
    totalCandidates: number;
    activeUsers: number;
    newUsers: number;
    newInterviews: number;
    completedInterviews: number;
  };
  distribution: {
    userRoles: {
      admin: number;
      user: number;
    };
  };
  recent: {
    users: User[];
    interviews: any[];
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin dashboard',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [status, session, router, toast]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to fetch dashboard statistics');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      if (activeTab === 'overview') {
        fetchDashboardStats();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [status, session, activeTab]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={() => activeTab === 'overview' ? fetchDashboardStats() : fetchUsers()}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, track activity, and monitor system performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold">{stats?.counts.totalUsers || 0}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">{stats?.counts.newUsers || 0} new</span>
                      <span>in last 7 days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                        <p className="text-3xl font-bold">{stats?.counts.totalInterviews || 0}</p>
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <MessageSquare className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">{stats?.counts.newInterviews || 0} new</span>
                      <span>in last 7 days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <p className="text-3xl font-bold">{stats?.counts.activeUsers || 0}</p>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <UserCheck className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Active in last 24 hours</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Candidates</p>
                        <p className="text-3xl font-bold">{stats?.counts.totalCandidates || 0}</p>
                      </div>
                      <div className="p-2 bg-purple-500/10 rounded-full">
                        <UserCog className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Total registered candidates</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <AnalyticsCharts
                userRoles={stats?.distribution.userRoles || { admin: 0, user: 0 }}
                interviewStats={{
                  completed: stats?.counts.completedInterviews || 0,
                  inProgress: Math.floor((stats?.counts.totalInterviews || 0) * 0.3) || 0, // Estimate
                  scheduled: Math.floor((stats?.counts.totalInterviews || 0) * 0.2) || 0, // Estimate
                }}
              />

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>
                      Recently registered users in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recent.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || undefined} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('users')}>
                      View All Users
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Interviews</CardTitle>
                    <CardDescription>
                      Recently created interviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recent.interviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{interview.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(interview.createdAt)}
                            </p>
                          </div>
                          <Badge variant={interview.status === 'completed' ? 'default' : 'outline'}>
                            {interview.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('activity')}>
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>
                    Manage all registered users in the system
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <UserFormDialog
                    mode="create"
                    trigger={
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" /> Add User
                      </Button>
                    }
                    onSuccess={() => fetchUsers()}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
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
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                            <span>Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <Badge className="bg-purple-500">Admin</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <UserFormDialog
                                    mode="edit"
                                    user={user}
                                    trigger={
                                      <button className="flex w-full items-center px-2 py-1.5 text-sm">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit User
                                      </button>
                                    }
                                    onSuccess={() => fetchUsers()}
                                  />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <DeleteUserDialog
                                    user={user}
                                    trigger={
                                      <button className="flex w-full items-center px-2 py-1.5 text-sm text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                      </button>
                                    }
                                    onSuccess={() => fetchUsers()}
                                  />
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
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ActivityTracker />

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Track how users are engaging with the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats?.counts.totalInterviews || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Interviews</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats?.counts.completedInterviews || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed Interviews</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {stats?.counts.totalInterviews
                            ? Math.round((stats.counts.completedInterviews / stats.counts.totalInterviews) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Settings will be implemented in the next phase
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
