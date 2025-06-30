"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Mic, MicOff, Send, Clock, BarChart, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

interface Interview {
  id: string;
  title: string;
  description?: string;
  date: Date;
  duration: number;
  status: string;
  type: string;
  score?: number;
  feedback?: string;
  candidate: Candidate;
  messages: Message[];
}

export default function LiveInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingInterview, setIsLoadingInterview] = useState(true);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching interview:', errorData);

          if (response.status === 404) {
            // Just set loading to false to show the "Interview not found" UI
            setIsLoadingInterview(false);
            return;
          }

          throw new Error(errorData.message || 'Failed to fetch interview');
        }

        const data = await response.json();

        // Convert date strings to Date objects
        const formattedData = {
          ...data,
          date: new Date(data.date),
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        };

        setInterview(formattedData);
        setMessages(formattedData.messages);
        setIsLoadingInterview(false);
      } catch (error) {
        console.error('Error fetching interview:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load interview data',
          variant: 'destructive',
        });
        setIsLoadingInterview(false);
      }
    };

    fetchInterview();
  }, [params.id, router, toast]);

  // Timer for interview duration
  useEffect(() => {
    if (!interview) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      // Use the actual interview duration from the database
      const totalSeconds = interview.duration * 60;
      setProgress(prev => Math.min(prev + (100 / totalSeconds), 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [interview]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !interview) return;

    setIsLoading(true);

    try {
      // Call the AI response API
      const response = await fetch(`/api/interviews/${params.id}/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Format the messages with proper Date objects
      const userMessage = {
        ...data.userMessage,
        timestamp: new Date(data.userMessage.timestamp),
      };

      const aiMessage = {
        ...data.aiResponse,
        timestamp: new Date(data.aiResponse.timestamp),
      };

      // Update the messages state with both messages
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setUserInput('');
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    // This would be implemented with Web Speech API in a production version
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Voice recording stopped" : "Voice recording started",
      description: "Voice functionality would be implemented in production.",
    });
  };

  const endInterview = async () => {
    if (!interview) return;

    try {
      // Update the interview status to completed
      const response = await fetch(`/api/interviews/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update interview status');
      }

      toast({
        title: "Interview Complete",
        description: "Your interview has been recorded and will be analyzed.",
      });

      // Navigate to results page
      setTimeout(() => {
        router.push('/dashboard/interviews');
      }, 1500);
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to end interview',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingInterview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="flex space-x-2 mb-4 justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse delay-75" />
            <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse delay-150" />
          </div>
          <p className="text-muted-foreground">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-destructive text-4xl mb-2">
            <span className="font-bold">404</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Interview Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The interview with ID "{params.id}" could not be found. It may have been deleted or you might not have permission to access it.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try using one of the sample interviews with IDs: "sample-interview-1", "sample-interview-2", or "sample-interview-3"
          </p>
          <Button onClick={() => router.push('/dashboard/interviews')}>
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 bg-card">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" alt="AI Interviewer" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{interview.title}</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Interview Session</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            <Progress value={progress} className="w-24 h-2" />
            <Button variant="destructive" size="sm" onClick={endInterview}>
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden container py-6 flex gap-4">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto pb-4 pr-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src="https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" alt="AI Interviewer" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'system'
                        ? 'bg-muted text-muted-foreground border'
                        : 'bg-card border'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 mt-1">
                    <AvatarImage src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src="https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" alt="AI Interviewer" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-card border">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-75" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t pt-4">
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRecording}
                className={isRecording ? "text-destructive" : ""}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 resize-none"
                rows={3}
              />
              <Button onClick={handleSendMessage} disabled={!userInput.trim() || isLoading}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Candidate Info
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Name:</span> {interview.candidate.name}</p>
                    <p><span className="font-medium text-foreground">Position:</span> {interview.candidate.role || 'Not specified'}</p>
                    <p><span className="font-medium text-foreground">Duration:</span> {interview.duration} minutes</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Interview Topics
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {interview.type === 'technical' ? (
                      <>
                        <li>• Technical background</li>
                        <li>• Project experience</li>
                        <li>• Programming languages</li>
                        <li>• Frameworks & tools</li>
                        <li>• Problem-solving approach</li>
                        <li>• System design</li>
                      </>
                    ) : interview.type === 'behavioral' ? (
                      <>
                        <li>• Work experience</li>
                        <li>• Team collaboration</li>
                        <li>• Conflict resolution</li>
                        <li>• Leadership skills</li>
                        <li>• Time management</li>
                        <li>• Adaptability</li>
                      </>
                    ) : (
                      <>
                        <li>• Professional background</li>
                        <li>• Relevant experience</li>
                        <li>• Skills assessment</li>
                        <li>• Problem-solving approach</li>
                        <li>• Team collaboration</li>
                        <li>• Career goals</li>
                      </>
                    )}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart className="h-4 w-4" /> Live Assessment
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Technical Knowledge</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Communication</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Problem Solving</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Culture Fit</span>
                        <span className="font-medium">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div className="pt-1 flex justify-between items-center">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className="text-lg font-bold">79%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}