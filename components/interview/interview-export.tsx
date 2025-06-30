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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2 } from "lucide-react";

interface InterviewExportProps {
  interviewId: string;
  domain: string;
}

export function InterviewExport({ interviewId, domain }: InterviewExportProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeFeedback, setIncludeFeedback] = useState(true);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Build the URL for the export
      const url = `/api/interviews/${interviewId}/export?includeAnswers=${includeAnswers}&includeFeedback=${includeFeedback}`;

      // Open the PDF in a new tab
      window.open(url, "_blank");

      // Close the dialog
      setOpen(false);

      // Show success toast
      toast({
        title: "Export Started",
        description: "Your interview PDF is being generated and will download shortly.",
      });
    } catch (error) {
      console.error("Error exporting interview:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the interview to PDF.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          Export to PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Interview to PDF</DialogTitle>
          <DialogDescription>
            Choose what to include in your interview PDF export.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                Include your answers in the PDF
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback" className="text-right">
              Include Feedback
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="feedback"
                checked={includeFeedback}
                onCheckedChange={(checked) => setIncludeFeedback(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="feedback" className="font-normal">
                Include AI feedback in the PDF
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
