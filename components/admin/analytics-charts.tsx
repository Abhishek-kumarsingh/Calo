"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, Activity, Users } from "lucide-react";

interface AnalyticsProps {
  userRoles: {
    admin: number;
    user: number;
  };
  interviewStats: {
    completed: number;
    inProgress: number;
    scheduled: number;
  };
}

export function AnalyticsCharts({ userRoles, interviewStats }: AnalyticsProps) {
  // Calculate total users
  const totalUsers = userRoles.admin + userRoles.user;
  
  // Calculate total interviews
  const totalInterviews = 
    interviewStats.completed + 
    interviewStats.inProgress + 
    interviewStats.scheduled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          View system usage and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Interviews</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-3">
                <h4 className="text-sm font-medium">User Distribution</h4>
                <div className="flex-1 flex items-center justify-center">
                  {/* Simple SVG pie chart */}
                  <div className="relative h-40 w-40">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {/* Admin users slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(262.1 83.3% 57.8%)"
                        strokeWidth="20"
                        strokeDasharray={`${(userRoles.admin / totalUsers) * 251.2} 251.2`}
                        transform="rotate(-90 50 50)"
                      />
                      {/* Regular users slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(221.2 83.2% 53.3%)"
                        strokeWidth="20"
                        strokeDasharray={`${(userRoles.user / totalUsers) * 251.2} 251.2`}
                        strokeDashoffset={`${-(userRoles.admin / totalUsers) * 251.2}`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{totalUsers}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm">Admin ({userRoles.admin})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Users ({userRoles.user})</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <h4 className="text-sm font-medium">User Statistics</h4>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admin Users</span>
                      <span className="text-sm font-medium">{userRoles.admin}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-purple-500" 
                        style={{ width: `${(userRoles.admin / totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Regular Users</span>
                      <span className="text-sm font-medium">{userRoles.user}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${(userRoles.user / totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interviews" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-3">
                <h4 className="text-sm font-medium">Interview Status</h4>
                <div className="flex-1 flex items-center justify-center">
                  {/* Simple SVG pie chart */}
                  <div className="relative h-40 w-40">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {/* Completed interviews slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(142.1 76.2% 36.3%)"
                        strokeWidth="20"
                        strokeDasharray={`${(interviewStats.completed / totalInterviews) * 251.2} 251.2`}
                        transform="rotate(-90 50 50)"
                      />
                      {/* In progress interviews slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(47.9 95.8% 53.1%)"
                        strokeWidth="20"
                        strokeDasharray={`${(interviewStats.inProgress / totalInterviews) * 251.2} 251.2`}
                        strokeDashoffset={`${-(interviewStats.completed / totalInterviews) * 251.2}`}
                        transform="rotate(-90 50 50)"
                      />
                      {/* Scheduled interviews slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(221.2 83.2% 53.3%)"
                        strokeWidth="20"
                        strokeDasharray={`${(interviewStats.scheduled / totalInterviews) * 251.2} 251.2`}
                        strokeDashoffset={`${-((interviewStats.completed + interviewStats.inProgress) / totalInterviews) * 251.2}`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{totalInterviews}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-600 mr-2"></div>
                    <span className="text-sm">Completed ({interviewStats.completed})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></div>
                    <span className="text-sm">In Progress ({interviewStats.inProgress})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Scheduled ({interviewStats.scheduled})</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <h4 className="text-sm font-medium">Interview Statistics</h4>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{interviewStats.completed}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-green-600" 
                        style={{ width: `${(interviewStats.completed / totalInterviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">In Progress</span>
                      <span className="text-sm font-medium">{interviewStats.inProgress}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-yellow-400" 
                        style={{ width: `${(interviewStats.inProgress / totalInterviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scheduled</span>
                      <span className="text-sm font-medium">{interviewStats.scheduled}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${(interviewStats.scheduled / totalInterviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
