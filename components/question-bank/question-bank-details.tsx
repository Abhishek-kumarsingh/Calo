'use client';

import { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

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

interface QuestionBankDetailsProps {
  questionBank: QuestionBank;
  onBack?: () => void;
  onExport?: (format: string) => void;
}

export function QuestionBankDetails({ 
  questionBank, 
  onBack, 
  onExport 
}: QuestionBankDetailsProps) {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const { toast } = useToast();

  const handleExport = async (format: string) => {
    setExportLoading(true);
    setExportFormat(format);
    
    try {
      if (onExport) {
        await onExport(format);
      }
      
      toast({
        title: 'Export Successful',
        description: `Question bank exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting question bank:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question bank',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast({
      title: 'Copied to Clipboard',
      description: 'Question copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{questionBank.title}</h1>
            <p className="text-muted-foreground">{questionBank.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('pdf')}
            disabled={exportLoading}
          >
            {exportLoading && exportFormat === 'pdf' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
          >
            {exportLoading && exportFormat === 'csv' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Question Bank Details</CardTitle>
          <CardDescription>
            Information about this question bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Domain</h3>
              <p className="font-medium">{questionBank.domain}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Sub-domain</h3>
              <p className="font-medium">{questionBank.subDomain}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Level</h3>
              <p className="font-medium">{questionBank.level}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Questions</h3>
              <p className="font-medium">{questionBank.questions.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
              <p className="font-medium">{format(new Date(questionBank.createdAt), 'PPP')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
              <p className="font-medium">{format(new Date(questionBank.updatedAt), 'PPP')}</p>
            </div>
          </div>
          
          {questionBank.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {questionBank.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            All questions in this bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionBank.questions.map((question, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyQuestion(question.question)}
                      title="Copy Question"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.question}</p>
                  
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium">Options:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className={optIndex === question.correctOption ? 'font-medium text-green-600 dark:text-green-400' : ''}>
                            {option} {optIndex === question.correctOption && '(Correct)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.explanation && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1">Explanation:</h4>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                  
                  {question.createdAt && (
                    <div className="flex items-center text-xs text-muted-foreground mt-4">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        Created {format(new Date(question.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
