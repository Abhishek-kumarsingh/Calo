"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, PieChart, Clock, AlertTriangle, FileText, Code, MessageSquare } from "lucide-react";

interface SystemLogsByCategory {
  _id: string;
  count: number;
}

interface ErrorRate {
  _id: string;
  categories: Array<{
    category: string;
    count: number;
  }>;
  totalErrors: number;
}

interface InterviewDuration {
  _id: string;
  averageDuration: number;
  count: number;
}

interface QuestionTypeDistribution {
  _id: string;
  count: number;
}

interface SystemPerformanceData {
  logsByCategory: SystemLogsByCategory[];
  errorRates: ErrorRate[];
  interviewDurationTrend: InterviewDuration[];
  questionTypeDistribution: QuestionTypeDistribution[];
}

interface SystemPerformanceChartsProps {
  data: SystemPerformanceData;
}

export function SystemPerformanceCharts({ data }: SystemPerformanceChartsProps) {
  // Get color for log category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "auth":
        return "hsl(221.2 83.2% 53.3%)"; // blue
      case "user":
        return "hsl(262.1 83.3% 57.8%)"; // purple
      case "interview":
        return "hsl(142.1 76.2% 36.3%)"; // green
      case "question":
        return "hsl(47.9 95.8% 53.1%)"; // yellow
      case "admin":
        return "hsl(346.8 77.2% 49.8%)"; // red
      case "system":
        return "hsl(215.4 16.3% 46.9%)"; // gray
      default:
        return "hsl(215.4 16.3% 46.9%)"; // gray
    }
  };

  // Get readable category name
  const getCategoryName = (category: string) => {
    switch (category) {
      case "auth":
        return "Authentication";
      case "user":
        return "User Management";
      case "interview":
        return "Interviews";
      case "question":
        return "Questions";
      case "admin":
        return "Admin Actions";
      case "system":
        return "System";
      default:
        return category;
    }
  };

  // Get color for question type
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "hsl(221.2 83.2% 53.3%)"; // blue
      case "multiple-choice":
        return "hsl(262.1 83.3% 57.8%)"; // purple
      case "coding":
        return "hsl(142.1 76.2% 36.3%)"; // green
      case "code-correction":
        return "hsl(47.9 95.8% 53.1%)"; // yellow
      default:
        return "hsl(215.4 16.3% 46.9%)"; // gray
    }
  };

  // Get readable question type name
  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case "text":
        return "Text";
      case "multiple-choice":
        return "Multiple Choice";
      case "coding":
        return "Coding";
      case "code-correction":
        return "Code Correction";
      default:
        return type;
    }
  };

  // Calculate total logs
  const totalLogs = data.logsByCategory.reduce(
    (sum, category) => sum + category.count,
    0
  );

  // Calculate total questions
  const totalQuestions = data.questionTypeDistribution.reduce(
    (sum, type) => sum + type.count,
    0
  );

  return (
    <div className="space-y-6">
      {/* System Logs by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logs by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              System Logs by Category
            </CardTitle>
            <CardDescription>
              Distribution of system logs across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {data.logsByCategory.length > 0 ? (
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {data.logsByCategory.map((category, index) => {
                      // Calculate the total circumference
                      const circumference = 2 * Math.PI * 40;
                      
                      // Calculate the percentage of this category
                      const percentage = category.count / totalLogs;
                      
                      // Calculate the arc length
                      const arcLength = percentage * circumference;
                      
                      // Calculate the offset (sum of previous arc lengths)
                      const offset = data.logsByCategory
                        .slice(0, index)
                        .reduce((sum, c) => sum + (c.count / totalLogs) * circumference, 0);
                      
                      return (
                        <circle
                          key={category._id}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={getCategoryColor(category._id)}
                          strokeWidth="20"
                          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 50 50)"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="30" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{totalLogs}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No log data available</p>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.logsByCategory.map((category) => (
                <div key={category._id} className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: getCategoryColor(category._id) }}
                  ></div>
                  <span className="text-sm">{getCategoryName(category._id)}</span>
                  <span className="ml-auto text-sm font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Question Type Distribution
            </CardTitle>
            <CardDescription>
              Types of questions used in interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {data.questionTypeDistribution.length > 0 ? (
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {data.questionTypeDistribution.map((type, index) => {
                      // Calculate the total circumference
                      const circumference = 2 * Math.PI * 40;
                      
                      // Calculate the percentage of this type
                      const percentage = type.count / totalQuestions;
                      
                      // Calculate the arc length
                      const arcLength = percentage * circumference;
                      
                      // Calculate the offset (sum of previous arc lengths)
                      const offset = data.questionTypeDistribution
                        .slice(0, index)
                        .reduce((sum, t) => sum + (t.count / totalQuestions) * circumference, 0);
                      
                      return (
                        <circle
                          key={type._id}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={getQuestionTypeColor(type._id)}
                          strokeWidth="20"
                          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 50 50)"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="30" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{totalQuestions}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No question type data available</p>
              )}
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.questionTypeDistribution.map((type) => (
                <div key={type._id} className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: getQuestionTypeColor(type._id) }}
                  ></div>
                  <span className="text-sm">{getQuestionTypeName(type._id)}</span>
                  <span className="ml-auto text-sm font-medium">{type.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Duration Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Interview Duration Trend
          </CardTitle>
          <CardDescription>
            Average interview duration over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {data.interviewDurationTrend.length > 0 ? (
              <div className="relative h-full w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                  <span>Max</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  <div className="relative h-full w-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 border-b border-l">
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                    </div>
                    
                    {/* Data visualization */}
                    <div className="absolute inset-0 flex items-end justify-between">
                      {data.interviewDurationTrend.map((item) => {
                        // Find max values for scaling
                        const maxDuration = Math.max(
                          ...data.interviewDurationTrend.map((d) => d.averageDuration)
                        );
                        
                        // Calculate heights as percentages
                        const durationHeight = maxDuration > 0
                          ? (item.averageDuration / maxDuration) * 100
                          : 0;
                        
                        return (
                          <div
                            key={item._id}
                            className="group relative flex h-full flex-col items-center justify-end px-1"
                            style={{ width: `${100 / data.interviewDurationTrend.length}%` }}
                          >
                            {/* Duration bar */}
                            <div
                              className="w-full bg-purple-500 rounded-t"
                              style={{
                                height: `${Math.max(durationHeight, 1)}%`,
                              }}
                            ></div>
                            
                            {/* Date label */}
                            <span className="mt-1 text-xs text-muted-foreground">
                              {new Date(item._id).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 z-10">
                              <div>Avg: {Math.round(item.averageDuration)} min</div>
                              <div>Count: {item.count}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No duration data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Rates Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            System Error Rates
          </CardTitle>
          <CardDescription>
            Error frequency by date and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {data.errorRates.length > 0 ? (
              <div className="relative h-full w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
                  <span>Max</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  <div className="relative h-full w-full">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 border-b border-l">
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                      <div className="border-t"></div>
                    </div>
                    
                    {/* Data visualization */}
                    <div className="absolute inset-0 flex items-end justify-between">
                      {data.errorRates.map((item) => {
                        // Find max values for scaling
                        const maxErrors = Math.max(
                          ...data.errorRates.map((d) => d.totalErrors)
                        );
                        
                        // Calculate heights as percentages
                        const errorHeight = maxErrors > 0
                          ? (item.totalErrors / maxErrors) * 100
                          : 0;
                        
                        return (
                          <div
                            key={item._id}
                            className="group relative flex h-full flex-col items-center justify-end px-1"
                            style={{ width: `${100 / data.errorRates.length}%` }}
                          >
                            {/* Error bar */}
                            <div
                              className="w-full bg-red-500 rounded-t"
                              style={{
                                height: `${Math.max(errorHeight, 1)}%`,
                              }}
                            ></div>
                            
                            {/* Date label */}
                            <span className="mt-1 text-xs text-muted-foreground">
                              {new Date(item._id).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 z-10">
                              <div>Errors: {item.totalErrors}</div>
                              {item.categories.map((cat) => (
                                <div key={cat.category}>
                                  {getCategoryName(cat.category)}: {cat.count}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No error data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
