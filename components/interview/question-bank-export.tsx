"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2 } from "lucide-react";

interface QuestionBankExportProps {
  domains: string[];
  currentDomain?: string;
  questionId?: string;
}

export function QuestionBankExport({
  domains,
  currentDomain,
  questionId,
}: QuestionBankExportProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState(currentDomain || "all");
  const [includeAnswers, setIncludeAnswers] = useState(true);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Build the URL for the export
      let url = `/api/interviews/question-banks/export?includeAnswers=${includeAnswers}`;
      
      if (questionId) {
        // If exporting a single question
        url += `&questionId=${questionId}`;
      } else {
        // If exporting by domain
        url += `&domain=${domain}`;
      }

      // Open the PDF in a new tab
      window.open(url, "_blank");

      // Close the dialog
      setOpen(false);

      // Show success toast
      toast({
        title: "Export Started",
        description: "Your PDF is being generated and will download shortly.",
      });
    } catch (error) {
      console.error("Error exporting questions:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the questions to PDF.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          {questionId ? "Export Question" : "Export to PDF"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Questions to PDF</DialogTitle>
          <DialogDescription>
            {questionId
              ? "Export this question with detailed information to PDF."
              : "Choose options for exporting questions to PDF."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!questionId && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right">
                Domain
              </Label>
              <Select
                value={domain}
                onValueChange={setDomain}
                disabled={loading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answers" className="text-right">
              Include Answers
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="answers"
                checked={includeAnswers}
                onCheckedChange={(checked) => setIncludeAnswers(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="answers" className="font-normal">
                Include answers in the PDF
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleExport}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Exporting..." : "Export to PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
