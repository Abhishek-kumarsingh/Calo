"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Search,
  Download,
  FileText,
  Calendar,
  Tag,
  Filter,
  Trash2,
  Plus,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  FileUp,
  Share2,
  Eye,
  CalendarDays,
  CalendarRange,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { interviewApi } from '@/lib/api-utils';
import { QuestionBankBatchExport } from '@/components/question-bank/question-bank-batch-export';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctOption?: number | null;
  codeSnippet?: string;
  correctCode?: string;
  explanation?: string;
  createdAt?: string;
  answeredAt?: string;
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

export default function QuestionBankPage() {
  const router = useRouter();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [batchExportOpen, setBatchExportOpen] = useState(false);
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

  // Filter and sort question banks
  useEffect(() => {
    let filtered = [...questionBanks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bank =>
        bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        return sortOrder === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else if (sortBy === 'questions') {
        return sortOrder === 'desc'
          ? b.questions.length - a.questions.length
          : a.questions.length - b.questions.length;
      }
      return 0;
    });

    setFilteredBanks(filtered);
  }, [questionBanks, searchTerm, domainFilter, levelFilter, sortBy, sortOrder]);

  // Get unique domains for filter
  const domains = Array.from(new Set(questionBanks.map(bank => bank.domain)));

  // Get unique levels for filter
  const levels = Array.from(new Set(questionBanks.map(bank => bank.level)));

  // Handle export
  const handleExport = async (questionBank: QuestionBank) => {
    try {
      setExportLoading(true);
      setSelectedBank(questionBank);

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
      const response = await fetch(`/api/interviews/question-banks/${questionBankId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question bank');
      }

      // Remove from state
      setQuestionBanks(prev => prev.filter(bank => bank.id !== questionBankId));
      setFilteredBanks(prev => prev.filter(bank => bank.id !== questionBankId));

      toast({
        title: 'Delete Successful',
        description: 'Question bank deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete question bank',
        variant: 'destructive',
      });
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle batch export
  const handleBatchExport = async (banks: QuestionBank[], options: any) => {
    try {
      setExportLoading(true);

      // Create a combined PDF content
      let combinedContent = `# Question Collection: ${options.customFileName}\n\n`;
      combinedContent += `Exported on: ${format(new Date(), 'PPP')}\n\n`;

      // Add metadata
      if (options.selectedDomains.length > 0) {
        combinedContent += `Domains: ${options.selectedDomains.join(', ')}\n`;
      }

      if (options.selectedLevels.length > 0) {
        combinedContent += `Levels: ${options.selectedLevels.join(', ')}\n`;
      }

      if (options.dateFilter) {
        combinedContent += `Date: ${format(new Date(options.dateFilter), 'PPP')}\n`;
      }

      combinedContent += `\n---\n\n`;

      // Add questions from each bank
      for (const bank of banks) {
        combinedContent += `## ${bank.title}\n\n`;
        combinedContent += `Domain: ${bank.domain} | Sub-domain: ${bank.subDomain} | Level: ${bank.level}\n\n`;

        bank.questions.forEach((question, index) => {
          combinedContent += `### Question ${index + 1}\n\n`;
          combinedContent += `${question.question}\n\n`;

          if (options.includeAnswers && question.explanation) {
            combinedContent += `**Explanation:**\n\n${question.explanation}\n\n`;
          }

          if (question.type === 'multiple-choice' && question.options) {
            combinedContent += `**Options:**\n\n`;
            question.options.forEach((option, optIndex) => {
              const isCorrect = optIndex === question.correctOption;
              if (options.includeAnswers && isCorrect) {
                combinedContent += `- ${option} ✓\n`;
              } else {
                combinedContent += `- ${option}\n`;
              }
            });
            combinedContent += `\n`;
          }

          combinedContent += `---\n\n`;
        });
      }

      // Create a blob and download it
      const blob = new Blob([combinedContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.customFileName || 'Question_Collection'}.${options.format === 'markdown' ? 'md' : options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Batch Export Successful',
        description: `${banks.length} question banks exported successfully`,
      });
    } catch (error) {
      console.error('Error batch exporting question banks:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question banks',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
      setBatchExportOpen(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Question Bank Manager</h1>
          <p className="text-muted-foreground">
            Manage, organize, and export your interview questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setBatchExportOpen(true)}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Batch Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All Question Banks</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Question Banks</CardTitle>
                  <CardDescription>
                    Browse and manage your saved interview questions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="questions">Number of Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and filters */}
                <div className="flex flex-col md:flex-row gap-3 bg-muted/40 p-3 rounded-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search question banks..."
                      className="pl-8 bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={domainFilter}
                    onValueChange={setDomainFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px] bg-background">
                      <SelectValue placeholder="All Domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map(domain => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={levelFilter}
                    onValueChange={setLevelFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px] bg-background">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question banks list */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredBanks.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No question banks found</p>
                    <p className="text-sm mt-1 max-w-md mx-auto">
                      {searchTerm || domainFilter !== 'all' || levelFilter !== 'all'
                        ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                        : 'Save interview questions to build your question bank. Questions are organized by domain and difficulty level.'}
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Question Bank
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {filteredBanks.map(bank => (
                      <Card key={bank.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base line-clamp-1">{bank.title}</CardTitle>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExport(bank)}
                                title="Export"
                                disabled={exportLoading && selectedBank?.id === bank.id}
                              >
                                {exportLoading && selectedBank?.id === bank.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
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
                        <CardContent className="pb-3">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="secondary" className="text-xs">
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
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => router.push(`/dashboard/question-bank/${bank.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Recently Added</CardTitle>
                  <CardDescription>
                    Question banks added in the last 30 days
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBanks
                    .filter(bank => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return new Date(bank.createdAt) >= thirtyDaysAgo;
                    })
                    .map(bank => (
                      <Card key={bank.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base line-clamp-1">{bank.title}</CardTitle>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExport(bank)}
                                title="Export"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
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
                        <CardContent className="pb-3">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="secondary" className="text-xs">
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
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => router.push(`/dashboard/question-bank/${bank.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Shared With Me</CardTitle>
                  <CardDescription>
                    Question banks shared by other users
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <Share2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No shared question banks</p>
                <p className="text-sm mt-1 max-w-md mx-auto">
                  Shared question banks will appear here. Collaborate with your team by sharing your question collections.
                </p>
                <Button variant="outline" className="mt-4">
                  <Share2 className="h-4 w-4 mr-2" />
                  Request Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Batch Export Dialog */}
      <QuestionBankBatchExport
        questionBanks={questionBanks}
        onExport={handleBatchExport}
        open={batchExportOpen}
        onOpenChange={setBatchExportOpen}
      />
    </div>
  );
}
