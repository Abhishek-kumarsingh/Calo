"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileText,
  Calendar,
  Tag,
  Loader2,
  Copy,
  Share2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { QuestionBankDetails } from '@/components/question-bank/question-bank-details';
import { QuestionBankExport } from '@/components/question-bank/question-bank-export';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctOption?: number | null;
  codeSnippet?: string;
  correctCode?: string;
  explanation?: string;
  createdAt?: string;
}

interface QuestionBank {
  id: string;
  title: string;
  description: string;
  domain: string;
  subDomain: string;
  level: string;
  questions: Question[];
  user: string;
  sourceInterviewId?: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function QuestionBankDetailPage({ params }: { params: { id: string } }) {
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch question bank details
  useEffect(() => {
    const fetchQuestionBank = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/interviews/question-banks/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch question bank');
        }

        const data = await response.json();
        setQuestionBank(data);
      } catch (error) {
        console.error('Error fetching question bank:', error);
        setError('Failed to load question bank details');
        toast({
          title: 'Error',
          description: 'Failed to load question bank details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionBank();
  }, [params.id, toast]);

  // Handle export
  const handleExport = async (format: string, includeAnswers: boolean = true) => {
    try {
      setExportLoading(true);

      const response = await fetch(`/api/interviews/question-banks/${params.id}/export`);

      if (!response.ok) {
        throw new Error('Failed to export question bank');
      }

      const data = await response.json();

      // Create content based on format
      let fileContent = data.pdfContent;
      let fileType = 'text/markdown';
      let fileExtension = 'md';

      if (format === 'pdf') {
        // For PDF, we need to convert markdown to PDF format
        // This is a simplified version - in a real app, you'd use a library like jsPDF
        fileContent = `# ${questionBank?.title}\n\n`;
        fileContent += `Domain: ${questionBank?.domain} | Sub-domain: ${questionBank?.subDomain} | Level: ${questionBank?.level}\n\n`;
        fileContent += `Exported on: ${format(new Date(), 'PPP')}\n\n`;
        fileContent += `---\n\n`;

        questionBank?.questions.forEach((question, index) => {
          fileContent += `## Question ${index + 1}\n\n`;
          fileContent += `${question.question}\n\n`;

          if (includeAnswers && question.explanation) {
            fileContent += `**Explanation:**\n\n${question.explanation}\n\n`;
          }

          if (question.type === 'multiple-choice' && question.options) {
            fileContent += `**Options:**\n\n`;
            question.options.forEach((option, optIndex) => {
              const isCorrect = optIndex === question.correctOption;
              if (includeAnswers && isCorrect) {
                fileContent += `- ${option} ✓\n`;
              } else {
                fileContent += `- ${option}\n`;
              }
            });
            fileContent += `\n`;
          }

          fileContent += `---\n\n`;
        });

        fileExtension = 'pdf';
      } else if (format === 'csv') {
        // Create CSV content
        fileContent = 'Question,Type,Options,Correct Option,Explanation,Created Date\n';

        questionBank?.questions.forEach((question) => {
          const options = question.options ? `"${question.options.join(', ')}"` : '';
          const correctOption = question.correctOption !== undefined && question.correctOption !== null ?
            (question.options ? question.options[question.correctOption] : '') : '';
          const explanation = question.explanation ? `"${question.explanation.replace(/"/g, '""')}"` : '';
          const createdDate = question.createdAt ? format(new Date(question.createdAt), 'yyyy-MM-dd') : '';

          fileContent += `"${question.question.replace(/"/g, '""')}",${question.type},${options},${correctOption},${explanation},${createdDate}\n`;
        });

        fileType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'json') {
        // Create JSON content
        const jsonData = {
          title: questionBank?.title,
          domain: questionBank?.domain,
          subDomain: questionBank?.subDomain,
          level: questionBank?.level,
          exportDate: format(new Date(), 'yyyy-MM-dd'),
          questions: questionBank?.questions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correctOption: includeAnswers ? q.correctOption : undefined,
            explanation: includeAnswers ? q.explanation : undefined,
            createdAt: q.createdAt
          }))
        };

        fileContent = JSON.stringify(jsonData, null, 2);
        fileType = 'application/json';
        fileExtension = 'json';
      }

      // Create a blob and download it
      const blob = new Blob([fileContent], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${questionBank?.title.replace(/\s+/g, '_')}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Question bank exported as ${format.toUpperCase()}`,
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error exporting question bank:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question bank',
        variant: 'destructive',
      });
      return Promise.reject(error);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle back
  const handleBack = () => {
    router.push('/dashboard/question-bank');
  };

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading question bank...</p>
        </div>
      </div>
    );
  }

  if (error || !questionBank) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold mb-2">Error Loading Question Bank</h1>
        <p className="text-muted-foreground mb-4">{error || "Question bank not found"}</p>
        <Button asChild>
          <Link href="/dashboard/question-bank">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Question Banks
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Tabs defaultValue="details" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{questionBank.title}</h1>
              <p className="text-muted-foreground">{questionBank.description}</p>
            </div>
          </div>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details">
          <QuestionBankDetails
            questionBank={questionBank}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <QuestionBankExport
                questionBank={questionBank}
                onExport={handleExport}
              />
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Question Bank Preview</CardTitle>
                  <CardDescription>
                    Preview of the questions that will be exported
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-4">
                    {questionBank.questions.map((question, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">Question {index + 1}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(question.question);
                              toast({
                                title: 'Copied',
                                description: 'Question copied to clipboard',
                              });
                            }}
                            title="Copy Question"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2">{question.question}</p>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="mt-3 space-y-1">
                            <p className="text-sm font-medium">Options:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} className={optIndex === question.correctOption ? 'font-medium text-green-600 dark:text-green-400' : ''}>
                                  {option} {optIndex === question.correctOption && '(Correct)'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-3">
                            <p className="text-sm font-medium">Explanation:</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
