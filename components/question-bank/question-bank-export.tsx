'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Download, FileText, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

interface QuestionBankExportProps {
  questionBank: QuestionBank;
  onExport: (format: string, includeAnswers: boolean) => Promise<void>;
}

export function QuestionBankExport({ 
  questionBank, 
  onExport 
}: QuestionBankExportProps) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      await onExport(exportFormat, includeAnswers);
      
      toast({
        title: 'Export Successful',
        description: `Question bank exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting question bank:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export question bank',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Question Bank</CardTitle>
        <CardDescription>
          Export "{questionBank.title}" in your preferred format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export-format">Export Format</Label>
          <Select
            value={exportFormat}
            onValueChange={setExportFormat}
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
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-answers" 
            checked={includeAnswers}
            onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
          />
          <Label htmlFor="include-answers">Include answers and explanations</Label>
        </div>
        
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2">
            This will export {questionBank.questions.length} questions from the "{questionBank.title}" question bank.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExport}
          disabled={loading}
          className="w-full"
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
      </CardFooter>
    </Card>
  );
}
