"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

interface QuestionBankStats {
  totalQuestions: number;
  questionsByDomain: Record<string, number>;
  processedQuestions: number;
  pendingQuestions: number;
  lastProcessed: string;
}

export default function AdminQuestionBankPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would be a real API endpoint in a production app
      // For now, we'll simulate the response
      // const response = await fetch("/api/admin/question-bank/stats");
      // const data = await response.json();

      // Simulated data
      const data = {
        totalQuestions: 245,
        questionsByDomain: {
          frontend: 120,
          backend: 85,
          fullstack: 25,
          data_science: 15
        },
        processedQuestions: 180,
        pendingQuestions: 65,
        lastProcessed: new Date().toISOString()
      };

      setStats(data);
    } catch (error: any) {
      console.error("Error fetching question bank stats:", error);
      setError(error.message || "Failed to fetch question bank statistics");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch question bank statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerProcessing = async () => {
    try {
      setProcessing(true);
      
      const response = await fetch("/api/admin/process-question-bank", {
        method: "POST"
      });
      
      if (!response.ok) {
        throw new Error("Failed to trigger question bank processing");
      }
      
      toast({
        title: "Processing Triggered",
        description: "Question bank processing has been triggered successfully",
        variant: "default",
      });
      
      // Refresh stats after a short delay
      setTimeout(fetchStats, 2000);
    } catch (error: any) {
      console.error("Error triggering question bank processing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger question bank processing",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          Could Not Load Question Bank Statistics
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Question Bank Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={triggerProcessing} disabled={processing}>
            <Database className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Process Questions"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Database className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-3xl font-bold">{stats?.processedQuestions || 0}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{stats?.pendingQuestions || 0}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Processed</p>
                <p className="text-sm font-medium">
                  {stats?.lastProcessed ? new Date(stats.lastProcessed).toLocaleString() : "Never"}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Questions by Domain</CardTitle>
          <CardDescription>
            Distribution of questions across different domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.questionsByDomain && Object.entries(stats.questionsByDomain).map(([domain, count]) => (
              <div key={domain} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{domain.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((count / stats.totalQuestions) * 100)}% of total
                  </p>
                </div>
                <Badge variant={count >= 100 ? "default" : "outline"}>
                  {count} questions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4">
          <p className="text-sm text-muted-foreground">
            Domains with 100+ questions will be automatically processed to generate answers.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
