'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Download, 
  FileText, 
  FileDown, 
  Calendar, 
  CalendarDays, 
  CheckSquare,
  Filter,
  FileUp,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface QuestionBankBatchExportProps {
  questionBanks: QuestionBank[];
  onExport: (banks: QuestionBank[], options: BatchExportOptions) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface BatchExportOptions {
  format: string;
  includeAnswers: boolean;
  dateFilter?: Date | null;
  selectedDomains: string[];
  selectedLevels: string[];
  customFileName: string;
}

export function QuestionBankBatchExport({ 
  questionBanks,
  onExport,
  open,
  onOpenChange
}: QuestionBankBatchExportProps) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [customFileName, setCustomFileName] = useState('');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportTab, setExportTab] = useState('all');
  const { toast } = useToast();

  // Get unique domains and levels
  const domains = Array.from(new Set(questionBanks.map(bank => bank.domain)));
  const levels = Array.from(new Set(questionBanks.map(bank => bank.level)));

  // Filter question banks based on selected criteria
  const filteredBanks = questionBanks.filter(bank => {
    // Filter by date if selected
    if (dateFilter) {
      const bankDate = new Date(bank.createdAt);
      const filterDate = new Date(dateFilter);
      
      if (bankDate.getDate() !== filterDate.getDate() || 
          bankDate.getMonth() !== filterDate.getMonth() || 
          bankDate.getFullYear() !== filterDate.getFullYear()) {
        return false;
      }
    }
    
    // Filter by domains if any selected
    if (selectedDomains.length > 0 && !selectedDomains.includes(bank.domain)) {
      return false;
    }
    
    // Filter by levels if any selected
    if (selectedLevels.length > 0 && !selectedLevels.includes(bank.level)) {
      return false;
    }
    
    return true;
  });

  // Banks to be exported
  const banksToExport = exportTab === 'selected' 
    ? questionBanks.filter(bank => selectedBanks.includes(bank.id))
    : filteredBanks;

  // Total questions count
  const totalQuestions = banksToExport.reduce((total, bank) => total + bank.questions.length, 0);

  // Toggle bank selection
  const toggleBankSelection = (bankId: string) => {
    setSelectedBanks(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId) 
        : [...prev, bankId]
    );
  };

  // Toggle domain selection
  const toggleDomainSelection = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain) 
        : [...prev, domain]
    );
  };

  // Toggle level selection
  const toggleLevelSelection = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  // Handle export
  const handleExport = async () => {
    if (banksToExport.length === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question bank to export.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const options: BatchExportOptions = {
        format: exportFormat,
        includeAnswers,
        dateFilter,
        selectedDomains,
        selectedLevels,
        customFileName: customFileName || `Question_Export_${format(new Date(), 'yyyy-MM-dd')}`
      };
      
      await onExport(banksToExport, options);
      
      toast({
        title: 'Export Successful',
        description: `${banksToExport.length} question banks with ${totalQuestions} questions exported successfully.`,
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error exporting question banks:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question banks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={exportTab} onValueChange={setExportTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Questions</TabsTrigger>
          <TabsTrigger value="selected">Selected Banks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-filter">Filter by Date</Label>
                <div className="mt-1">
                  <DatePicker 
                    date={dateFilter} 
                    setDate={setDateFilter} 
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select
                  value={exportFormat}
                  onValueChange={setExportFormat}
                  className="mt-1"
                >
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="markdown">Markdown (.md)</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Filter by Domain</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {domains.map(domain => (
                  <Button
                    key={domain}
                    variant={selectedDomains.includes(domain) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDomainSelection(domain)}
                    className="text-xs"
                  >
                    {domain}
                  </Button>
                ))}
                {selectedDomains.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDomains([])}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <Label>Filter by Level</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {levels.map(level => (
                  <Button
                    key={level}
                    variant={selectedLevels.includes(level) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLevelSelection(level)}
                    className="text-xs"
                  >
                    {level}
                  </Button>
                ))}
                {selectedLevels.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLevels([])}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="selected" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Select Question Banks</Label>
              <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
                <div className="space-y-2">
                  {questionBanks.map(bank => (
                    <div key={bank.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`bank-${bank.id}`} 
                        checked={selectedBanks.includes(bank.id)}
                        onCheckedChange={() => toggleBankSelection(bank.id)}
                      />
                      <Label htmlFor={`bank-${bank.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{bank.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {bank.domain} • {bank.level} • {bank.questions.length} questions
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedBanks.length} banks selected with a total of {
                  questionBanks
                    .filter(bank => selectedBanks.includes(bank.id))
                    .reduce((total, bank) => total + bank.questions.length, 0)
                } questions
              </div>
            </div>
            
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
                className="mt-1"
              >
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="custom-filename">Custom Filename</Label>
          <Input
            id="custom-filename"
            placeholder={`Question_Export_${format(new Date(), 'yyyy-MM-dd')}`}
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-answers" 
            checked={includeAnswers}
            onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
          />
          <Label htmlFor="include-answers">Include answers and explanations</Label>
        </div>
      </div>
      
      <div className="bg-muted/40 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Export Summary</p>
            <p className="text-xs text-muted-foreground">
              {banksToExport.length} question banks with {totalQuestions} questions
            </p>
          </div>
          <Button 
            onClick={handleExport}
            disabled={loading || banksToExport.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export as {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // If used as a standalone component
  if (open === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch Export Questions</CardTitle>
          <CardDescription>
            Export multiple question banks at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  // If used in a dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch Export Questions</DialogTitle>
          <DialogDescription>
            Export multiple question banks at once. Filter by date, domain, or level.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
