'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Download, FileText, Calendar, Tag, Filter, Trash2, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { QuestionBankExport } from './question-bank-export';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctOption?: number | null;
  codeSnippet?: string;
  correctCode?: string;
  explanation?: string;
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
  onExport?: (questionBank: QuestionBank) => void;
  onDelete?: (questionBankId: string) => void;
}

export function QuestionBankList({ onExport, onDelete }: QuestionBankListProps) {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const { toast } = useToast();

  // Fetch question banks
  useEffect(() => {
    const fetchQuestionBanks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/interviews/question-banks');

        if (!response.ok) {
          throw new Error('Failed to fetch question banks');
        }

        const data = await response.json();
        setQuestionBanks(data);
        setFilteredBanks(data);
      } catch (error) {
        console.error('Error fetching question banks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load question banks',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionBanks();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...questionBanks];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bank =>
        bank.title.toLowerCase().includes(term) ||
        bank.description.toLowerCase().includes(term) ||
        bank.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply domain filter
    if (domainFilter !== 'all') {
      filtered = filtered.filter(bank => bank.domain === domainFilter);
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(bank => bank.level === levelFilter);
    }

    setFilteredBanks(filtered);
  }, [questionBanks, searchTerm, domainFilter, levelFilter]);

  // Handle export
  const handleExport = async (questionBank: QuestionBank) => {
    try {
      const response = await fetch(`/api/interviews/question-banks/${questionBank.id}/export`);

      if (!response.ok) {
        throw new Error('Failed to export question bank');
      }

      const data = await response.json();

      // Create a blob and download it
      const blob = new Blob([data.pdfContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${questionBank.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Question bank exported successfully',
      });

      if (onExport) {
        onExport(questionBank);
      }
    } catch (error) {
      console.error('Error exporting question bank:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question bank',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async (questionBankId: string) => {
    if (!confirm('Are you sure you want to delete this question bank?')) {
      return;
    }

    try {
      const response = await fetch(`/api/interviews/question-banks/${questionBankId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question bank');
      }

      // Remove from state
      setQuestionBanks(prev => prev.filter(bank => bank.id !== questionBankId));

      toast({
        title: 'Delete Successful',
        description: 'Question bank deleted successfully',
      });

      if (onDelete) {
        onDelete(questionBankId);
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

  // Get unique domains and levels for filters
  const domains = ['all', ...new Set(questionBanks.map(bank => bank.domain))];
  const levels = ['all', ...new Set(questionBanks.map(bank => bank.level))];

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Question Bank</CardTitle>
          <CardDescription>
            Browse and manage your saved interview questions
          </CardDescription>
        </div>
        <QuestionBankExport
          domains={domains.filter(d => d !== 'all')}
          currentDomain={domainFilter !== 'all' ? domainFilter : undefined}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search question banks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      {domain === 'all' ? 'All Domains' : domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question banks list */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBanks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No question banks found</p>
              <p className="text-sm mt-1">
                {searchTerm || domainFilter !== 'all' || levelFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Save interview questions to build your question bank'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {filteredBanks.map(bank => (
                <Card key={bank.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{bank.title}</CardTitle>
                      <div className="flex gap-1">
                        <QuestionBankExport
                          domains={[bank.domain]}
                          currentDomain={bank.domain}
                          questionId={bank.id}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bank.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
                      <Badge variant="outline" className="text-xs">
                        {bank.level}
                      </Badge>
                      {bank.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{bank.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(bank.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
