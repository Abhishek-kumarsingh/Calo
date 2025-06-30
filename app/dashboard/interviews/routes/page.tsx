"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Info,
  Layers,
  List,
  MessageSquare,
  Plus,
  Server,
  Settings,
  User,
  Users,
} from 'lucide-react';

interface Interview {
  id: string;
  title: string;
  domain: string | null;
  subDomain: string | null;
  difficulty: string | null;
  status: string;
  date: string;
}

export default function InterviewRoutesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interviews');

        if (!response.ok) {
          throw new Error('Failed to fetch interviews');
        }

        const data = await response.json();
        setInterviews(data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setError('Failed to load interviews');

        // Add sample interviews if API fails
        setInterviews([
          {
            id: 'sample-interview-1',
            title: 'Frontend Developer Interview',
            domain: 'frontend',
            subDomain: 'react',
            difficulty: 'intermediate',
            status: 'scheduled',
            date: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            id: 'sample-interview-2',
            title: 'Backend Developer Interview',
            domain: 'backend',
            subDomain: 'nodejs',
            difficulty: 'advanced',
            status: 'scheduled',
            date: new Date(Date.now() + 172800000).toISOString(),
          },
          {
            id: 'sample-interview-3',
            title: 'Full Stack Developer Interview',
            domain: 'fullstack',
            subDomain: 'javascript',
            difficulty: 'intermediate',
            status: 'completed',
            date: new Date(Date.now() - 432000000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleCopyLink = (path: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${path}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: 'Link copied',
        description: 'The link has been copied to your clipboard',
      });
    });
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Routes</h1>
          <p className="text-muted-foreground">
            All available routes for managing and taking interviews
          </p>
        </div>
        <Link href="/dashboard/interviews/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Interview
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Routes</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="take">Take</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{interview.title}</span>
                    <Badge variant={interview.status === 'completed' ? 'success' : 'default'}>
                      {interview.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>ID: {interview.id}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {interview.domain === 'frontend' ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                      ) : interview.domain === 'backend' ? (
                        <Server className="h-4 w-4 text-green-500" />
                      ) : (
                        <Layers className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="capitalize">{interview.domain || 'General'}</span>
                      {interview.subDomain && (
                        <>
                          <span className="text-muted-foreground">/</span>
                          <span>{interview.subDomain}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(interview.date).toLocaleDateString()}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Available Routes:</p>

                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between">
                          <Link href={`/dashboard/interviews/${interview.id}/setup`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <Settings className="h-3 w-3 mr-1" /> Setup
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/setup`)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <Link href={`/dashboard/interviews/${interview.id}/take`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> Take
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/take`)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <Link href={`/dashboard/interviews/${interview.id}/results`} className="text-sm text-blue-500 hover:underline flex items-center">
                            <FileText className="h-3 w-3 mr-1" /> Results
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/results`)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/interviews/${interview.id}/setup`)}>
                    Go to Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Setup Routes</CardTitle>
              <CardDescription>Configure interviews before they start</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">
                        /dashboard/interviews/{interview.id}/setup
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/setup`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => router.push(`/dashboard/interviews/${interview.id}/setup`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="take">
          <Card>
            <CardHeader>
              <CardTitle>Take Routes</CardTitle>
              <CardDescription>Routes for taking interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">
                        /dashboard/interviews/{interview.id}/take
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/take`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => router.push(`/dashboard/interviews/${interview.id}/setup`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Results Routes</CardTitle>
              <CardDescription>View interview results and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">
                        /dashboard/interviews/{interview.id}/results
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyLink(`/dashboard/interviews/${interview.id}/results`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => router.push(`/dashboard/interviews/${interview.id}/results`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
