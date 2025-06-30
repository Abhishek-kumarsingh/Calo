"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { interviewApi } from '@/lib/api-utils';

export default function InterviewNotFound({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sampleInterviews, setSampleInterviews] = useState([
    { id: 'sample-interview-1', title: 'Frontend Developer Interview' },
    { id: 'sample-interview-2', title: 'Backend Developer Interview' },
    { id: 'sample-interview-3', title: 'Full Stack Developer Interview' },
  ]);

  const handleCreateSampleInterview = async (id: string) => {
    try {
      setLoading(true);

      // Use the getSampleInterview method to create the sample interview
      await interviewApi.getSampleInterview(id);

      // Redirect to the interview setup page
      router.push(`/dashboard/interviews/${id}/setup`);
    } catch (error) {
      console.error(`Error creating sample interview ${id}:`, error);
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Interview Not Available</CardTitle>
          <CardDescription>
            This interview is not available or has not been properly set up yet. Please go to the setup page to generate questions first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">What to do next:</h3>
            <ul className="space-y-2 text-sm">
              <li>• Go to the setup page to generate questions</li>
              <li>• Check that you have the correct interview link</li>
              <li>• Contact the interviewer who sent you this link</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push(`/dashboard/interviews/${params.id}/setup`)}
          >
            Go to Setup Page
          </Button>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Try a sample interview instead:</h3>
            <div className="space-y-2">
              {sampleInterviews.map((interview) => (
                <Button
                  key={interview.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCreateSampleInterview(interview.id)}
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {interview.title}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-between">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
