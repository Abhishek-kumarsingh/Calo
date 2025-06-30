"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Mail, Link as LinkIcon, Share2 } from 'lucide-react';

interface InterviewShareLinkProps {
  interviewId: string;
  candidateEmail?: string;
}

export function InterviewShareLink({ interviewId, candidateEmail }: InterviewShareLinkProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate the interview link - direct to setup first to ensure questions are generated
  const interviewLink = `${window.location.origin}/dashboard/interviews/${interviewId}/setup`;

  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(interviewLink);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Interview link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle email sending (mock implementation)
  const handleSendEmail = async () => {
    if (!candidateEmail) {
      toast({
        title: "No email address",
        description: "Candidate email address is not available",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would call an API endpoint to send an email
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEmailSent(true);
      toast({
        title: "Email sent",
        description: `Interview link sent to ${candidateEmail}`,
      });

      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "There was an error sending the email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Interview Link
        </CardTitle>
        <CardDescription>
          Share this link with the candidate to start the interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="link" className="flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4" />
              Copy Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Send Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <div className="flex items-center space-x-2">
              <Input
                value={interviewLink}
                readOnly
                className="flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This link allows the candidate to access the interview without logging in
            </p>
          </TabsContent>

          <TabsContent value="email">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Candidate Email</p>
                <Input
                  value={candidateEmail || ''}
                  readOnly
                  disabled={!candidateEmail}
                  placeholder="No email available"
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={!candidateEmail || loading || emailSent}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : emailSent ? (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Sent!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Interview Link
                  </span>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                An email with the interview link will be sent to the candidate
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        The link will remain valid until the interview is completed
      </CardFooter>
    </Card>
  );
}
