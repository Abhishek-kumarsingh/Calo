'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, FileText, Calendar, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

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

interface QuestionBankListProps {
  questionBanks: QuestionBank[];
  loading?: boolean;
  onExport?: (questionBank: QuestionBank) => void;
  onDelete?: (questionBankId: string) => void;
  onView?: (questionBank: QuestionBank) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function QuestionBankList({ 
  questionBanks, 
  loading = false,
  onExport, 
  onDelete,
  onView,
  searchTerm = '',
  onSearchChange
}: QuestionBankListProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  // Handle export
  const handleExport = async (questionBank: QuestionBank) => {
    try {
      setExportLoading(true);
      setSelectedBank(questionBank.id);
      
      if (onExport) {
        await onExport(questionBank);
      }
    } catch (error) {
      console.error('Error exporting question bank:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question bank',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
      setSelectedBank(null);
    }
  };

  // Handle delete
  const handleDelete = async (questionBankId: string) => {
    if (!confirm('Are you sure you want to delete this question bank?')) {
      return;
    }
    
    try {
      if (onDelete) {
        await onDelete(questionBankId);
      }
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete question bank',
        variant: 'destructive',
      });
    }
  };

  // Handle view
  const handleView = (questionBank: QuestionBank) => {
    if (onView) {
      onView(questionBank);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search question banks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      
      {/* Question banks list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : questionBanks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No question banks found</p>
          <p className="text-sm mt-1">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Save interview questions to build your question bank'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questionBanks.map(bank => (
            <Card key={bank.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{bank.title}</CardTitle>
                  <div className="flex gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(bank)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onExport && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExport(bank)}
                        title="Export"
                        disabled={exportLoading && selectedBank === bank.id}
                      >
                        {exportLoading && selectedBank === bank.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bank.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {bank.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {bank.domain}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {bank.subDomain}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {bank.level}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Created {format(new Date(bank.createdAt), 'MMM d, yyyy')}
                  </span>
                  <span className="mx-2">•</span>
                  <FileText className="h-3 w-3 mr-1" />
                  <span>{bank.questions.length} questions</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
