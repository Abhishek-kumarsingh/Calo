"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast"; // Ensure this hook is set up
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  BarChart3,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ServerCrash,
  FileDown,
} from "lucide-react";
import { interviewApi, handleApiError, withRetry } from "@/lib/api-utils-updated";
import { Badge } from "@/components/ui/badge";
import { InterviewExport } from "@/components/interview/interview-export";

// For distinct questions if non-AI interview
interface DistinctQuestion {
  id: string;
  content: string;
  type: string;
  options?: string[] | null; // Parsed if multiple-choice
  correctAnswer?: string | null;
}

// For displaying Q/A - could be from embedded AI questions or fetched distinct responses
interface DisplayableResponse {
  id: string; // Unique key for mapping, can be questionId or a generated one for embedded
  questionContent: string;
  questionType?: string; // e.g., 'ai_text', 'multiple-choice'
  candidateAnswer: string;
  feedback?: string | null; // AI or manual feedback on this answer
  score?: number | null; // Score for this specific answer
  correctAnswer?: string | null; // For non-AI questions
}

// Aligned with BackendInterview from previous updates
interface Interview {
  id: string;
  title: string;
  description?: string | null;
  domain: string;
  subDomain?: string | null;
  difficulty?: string | null;
  date?: string;
  duration?: number | null; // Made optional if not always present
  status: string;
  score?: number | null; // Overall interview score
  overallFeedback?: string | null; // Overall interview feedback
  type: "ai_generated" | "technical" | "behavioral" | "mixed";
  candidateId?: string | null;
  // candidate?: Candidate; // If you populate this from backend
  // For AI interviews, Q/A/Feedback are embedded
  questions?: Array<{
    question: string;
    answer: string;
    feedback: string;
    score?: number | null;
  }>;
}

export default function InterviewResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [displayableResponses, setDisplayableResponses] = useState<
    DisplayableResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching results for interview ID: ${params.id}`);

      const interviewData: Interview = await withRetry(
        () => interviewApi.getInterview(params.id) // getInterview should handle sample IDs if backend is set up for it
      );
      console.log("Interview data received:", interviewData);
      setInterview(interviewData);

      let responsesToDisplay: DisplayableResponse[] = [];

      if (
        interviewData.type === "ai_generated" &&
        interviewData.questions &&
        interviewData.questions.length > 0
      ) {
        responsesToDisplay = interviewData.questions.map((q, index) => ({
          id: `${interviewData.id}-ai-q-${index}`, // Unique ID for React key
          questionContent: q.question,
          questionType: "AI Text Response",
          candidateAnswer: q.answer,
          feedback: q.feedback,
          score: q.score,
        }));
      } else if (interviewData.type !== "ai_generated") {
        // For non-AI interviews, fetch distinct responses/questions
        // This assumes getResponses returns data that can be mapped to DisplayableResponse
        // Your backend Response type: { id, content, score, feedback, questionId, question: { id, content, type, options, correctAnswer } }
        type BackendResponse = {
          id: string;
          content: string;
          score: number | null;
          feedback: string | null;
          question: DistinctQuestion;
        };
        const fetchedResponses: BackendResponse[] = await withRetry(() =>
          interviewApi.getResponses(params.id)
        );
        console.log(
          `Distinct responses data received: ${fetchedResponses.length} responses`
        );

        responsesToDisplay = fetchedResponses.map((r) => ({
          id: r.id,
          questionContent: r.question.content,
          questionType: r.question.type,
          candidateAnswer: r.content,
          feedback: r.feedback,
          score: r.score,
          correctAnswer: r.question.correctAnswer,
        }));
      }
      setDisplayableResponses(responsesToDisplay);
    } catch (err: any) {
      console.error("Error fetching results:", err);
      const apiErrorMsg = handleApiError(err, () => {});
      setError(
        apiErrorMsg || err.message || "Failed to load interview results."
      );
    } finally {
      setLoading(false);
    }
  }, [params.id, API_BASE_URL]); // API_BASE_URL for consistency

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleRegenerateFeedback = async () => {
    if (!interview) return;
    try {
      setRegenerating(true);
      setError(null);
      console.log(`Regenerating feedback for interview ID: ${interview.id}`);

      // This API call should regenerate overall feedback and potentially re-score
      // Expects the updated interview object in response
      const responseData = await interviewApi.generateFeedback(interview.id);
      console.log(
        "Feedback regenerated, updated interview data:",
        responseData
      );
      const updatedInterview: Interview = responseData as Interview;

      setInterview(updatedInterview); // Update with new feedback and score
      console.log(interview);

      toast({
        title: "Feedback Regenerated",
        description: "The interview feedback and score have been updated.",
        className: "bg-green-500 text-white",
      });
    } catch (err: any) {
      console.error("Error regenerating feedback:", err);
      const errorMessage = handleApiError(err, () => {});
      setError(errorMessage); // Set page error if regeneration fails critically
      toast({
        title: "Regeneration Error",
        description:
          errorMessage || "Failed to regenerate feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyFeedback = () => {
    if (interview?.overallFeedback) {
      navigator.clipboard
        .writeText(interview.overallFeedback)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: "Copied to Clipboard",
            description: "Overall interview feedback has been copied.",
          });
        })
        .catch((err) => {
          console.error("Failed to copy feedback: ", err);
          toast({
            title: "Copy Failed",
            description:
              "Could not copy feedback to clipboard. Please try manually.",
            variant: "destructive",
          });
        });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl text-muted-foreground">
            Loading Interview Results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          Failed to Load Results
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error ||
            "Could not retrieve the interview results. The interview might not exist or an error occurred."}
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/interviews")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Interviews
          </Button>
          {error && (
            <Button onClick={fetchResults} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {interview.title || `Interview Results`}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/interviews")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Interviews
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Overall Feedback Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Overall Interview Feedback
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={handleCopyFeedback}
                    disabled={!interview.overallFeedback}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="default" // Changed to default for primary action
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={handleRegenerateFeedback}
                    disabled={regenerating}
                  >
                    {regenerating && (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    )}
                    <RefreshCw
                      className={`h-3.5 w-3.5 mr-1.5 ${
                        regenerating ? "hidden" : ""
                      }`}
                    />{" "}
                    {/* Icon for regenerate */}
                    {regenerating ? "Processing..." : "Regenerate Summary"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => router.push(`/dashboard/interviews/${params.id}/analysis`)}
                    disabled={!interview.overallFeedback}
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                    Detailed Analysis
                  </Button>
                  <InterviewExport
                    interviewId={params.id}
                    domain={interview.domain}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {interview.overallFeedback ? (
                // Using 'prose' for better typography if Tailwind Typography plugin is used
                <div className="prose dark:prose-invert max-w-none">
                  {/* Split feedback by newlines to render paragraphs */}
                  {interview.overallFeedback
                    .split("\n")
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="mb-3 last:mb-0 text-sm leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="text-md font-semibold mb-1">
                    No Overall Feedback Available
                  </h3>
                  <p className="text-xs mb-4">
                    The overall feedback summary has not been generated for this
                    interview.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleRegenerateFeedback}
                    disabled={regenerating}
                  >
                    {regenerating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Generate Overall Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions & Answers Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Questions & Answers Breakdown
              </CardTitle>
              <CardDescription className="text-sm">
                Detailed review of each question, your answer, and specific
                feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {displayableResponses.length > 0 ? (
                  displayableResponses.map((response, index) => (
                    <div
                      key={response.id}
                      className="border dark:border-slate-700 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-primary/10 text-primary font-semibold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-base leading-snug flex-grow">
                          {response.questionContent}
                        </h3>
                        {response.questionType && (
                          <Badge
                            variant="secondary"
                            className="text-xs whitespace-nowrap capitalize"
                          >
                            {response.questionType.replace("_", " ")}
                          </Badge>
                        )}
                      </div>

                      <div className="pl-10 space-y-4">
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-1">
                            CANDIDATE ANSWER:
                          </h4>
                          <div className="bg-muted dark:bg-slate-800 p-3 rounded-md">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {response.candidateAnswer || (
                                <span className="italic text-muted-foreground/70">
                                  No answer provided.
                                </span>
                              )}
                            </pre>
                          </div>
                        </div>

                        {response.feedback && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">
                              FEEDBACK ON ANSWER:
                            </h4>
                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 rounded-md">
                              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                                {response.feedback}
                              </pre>
                            </div>
                          </div>
                        )}
                        {response.correctAnswer && ( // For non-AI questions with defined correct answers
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              EXPECTED ANSWER:
                            </h4>
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-3 rounded-md">
                              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-green-700 dark:text-green-300">
                                {response.correctAnswer}
                              </pre>
                            </div>
                          </div>
                        )}
                        {typeof response.score === "number" && (
                          <div className="flex items-center gap-2 pt-1">
                            <h4 className="text-xs font-medium text-muted-foreground">
                              SCORE FOR THIS ANSWER:
                            </h4>
                            <span className="font-semibold text-sm">
                              {response.score} / 100
                            </span>
                            <Progress
                              value={response.score}
                              className="h-1.5 w-24 bg-muted-foreground/20"
                              indicatorClassName={
                                response.score >= 70
                                  ? "bg-green-500"
                                  : response.score >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
                    <h3 className="text-md font-semibold mb-1">
                      No Question Responses
                    </h3>
                    <p className="text-xs">
                      Either no questions were part of this interview, or no
                      answers were submitted.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Score and Details */}
        <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Overall Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof interview.score === "number" ? (
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {interview.score}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <Progress
                    value={interview.score}
                    className="h-3 mb-3"
                    indicatorClassName={
                      interview.score >= 70
                        ? "bg-green-500"
                        : interview.score >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }
                  />
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    {interview.score >= 70 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : interview.score >= 40 ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`font-medium ${
                        interview.score >= 70
                          ? "text-green-600 dark:text-green-400"
                          : interview.score >= 40
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {interview.score >= 85
                        ? "Excellent Performance"
                        : interview.score >= 70
                        ? "Good Performance"
                        : interview.score >= 55
                        ? "Satisfactory Performance"
                        : interview.score >= 40
                        ? "Average Performance"
                        : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="text-md font-semibold mb-1">
                    No Overall Score
                  </h3>
                  <p className="text-xs">
                    An overall score has not been calculated for this interview.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailItem label="Domain" value={interview.domain} />
              <DetailItem label="Sub-Domain" value={interview.subDomain} />
              <DetailItem
                label="Difficulty"
                value={interview.difficulty}
                className="capitalize"
              />
              <DetailItem
                label="Type"
                value={interview.type?.replace("_", " ")}
                className="capitalize"
              />
              <Separator className="my-1.5" />
              <DetailItem
                label="Number of Questions"
                value={`${displayableResponses.length} questions`}
              />
              <DetailItem
                label="Interview Date"
                value={
                  interview.date
                    ? new Date(interview.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"
                }
              />
              {interview.duration && (
                <DetailItem
                  label="Designated Duration"
                  value={`${interview.duration} minutes`}
                />
              )}
              <DetailItem
                label="Status"
                value={<StatusBadge status={interview.status} />}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail items (if not globally available)
const DetailItem = ({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | React.ReactNode | null;
  className?: string;
}) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </h3>
      {typeof value === "string" ? (
        <p className={`font-medium ${className || ""}`}>{value}</p>
      ) : (
        <div className={`font-medium ${className || ""}`}>{value}</div>
      )}
    </div>
  );
};

// StatusBadge component (if not globally available)
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
  let classNames = "px-2 py-0.5 text-xs font-medium rounded-full ";
  switch (status?.toLowerCase()) {
    case "completed":
      classNames +=
        "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border border-green-200 dark:border-green-600";
      break;
    case "in_progress":
      classNames +=
        "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400 border border-blue-200 dark:border-blue-600";
      break;
    case "scheduled":
      classNames +=
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-600";
      break;
    case "pending_ai_generation":
      classNames +=
        "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border border-purple-200 dark:border-purple-600";
      break;
    case "cancelled":
      classNames +=
        "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border border-red-200 dark:border-red-600";
      variant = "destructive";
      break;
    default:
      classNames +=
        "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border border-gray-200 dark:border-gray-600";
  }
  return (
    <span className={classNames}>
      {status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
        "Unknown"}
    </span>
  );
};
