"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  PieChart,
  LineChart,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interviewApi, handleApiError } from "@/lib/api-utils-updated";
import { useToast } from "@/components/ui/use-toast";

interface Interview {
  id: string;
  title: string;
  description?: string | null;
  domain: string;
  subDomain?: string | null;
  difficulty?: string | null;
  date?: string;
  duration?: number | null;
  status: string;
  score?: number | null;
  overallFeedback?: string | null;
  type: "ai_generated" | "technical" | "behavioral" | "mixed";
  candidateId?: string | null;
  questions?: Array<{
    question: string;
    answer: string;
    feedback: string;
    score?: number | null;
  }>;
}

interface SkillAnalysis {
  name: string;
  score: number;
}

interface FeedbackTheme {
  theme: string;
  occurrences: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  examples: string[];
}

export default function InterviewAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillAnalysis[]>([]);
  const [feedbackThemes, setFeedbackThemes] = useState<FeedbackTheme[]>([]);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch interview details
        const interviewData = await interviewApi.getInterviewById(params.id as string);
        setInterview(interviewData);

        // Analyze skills from the interview feedback
        if (interviewData.overallFeedback) {
          const analyzedSkills = analyzeSkills(interviewData.overallFeedback);
          setSkills(analyzedSkills);
        }

        // Analyze feedback themes
        if (interviewData.overallFeedback) {
          const analyzedThemes = analyzeFeedbackThemes(interviewData.overallFeedback);
          setFeedbackThemes(analyzedThemes);
        }
      } catch (err) {
        console.error("Error fetching interview data:", err);
        const errorMessage = handleApiError(err, () => {});
        setError(errorMessage || "Failed to load interview data");
        toast({
          title: "Error",
          description: errorMessage || "Could not load interview data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInterviewData();
    }
  }, [params.id, toast]);

  const handleRegenerateFeedback = async () => {
    if (!interview) return;

    try {
      setRegenerating(true);
      setError(null);

      // Call API to regenerate feedback
      const responseData = await interviewApi.generateFeedback(interview.id);

      // Update interview data with new feedback
      setInterview(responseData.interview);

      // Re-analyze skills and themes
      if (responseData.interview.overallFeedback) {
        const analyzedSkills = analyzeSkills(responseData.interview.overallFeedback);
        setSkills(analyzedSkills);

        const analyzedThemes = analyzeFeedbackThemes(responseData.interview.overallFeedback);
        setFeedbackThemes(analyzedThemes);
      }

      toast({
        title: "Success",
        description: "Feedback regenerated successfully",
      });
    } catch (err) {
      console.error("Error regenerating feedback:", err);
      const errorMessage = handleApiError(err, () => {});
      setError(errorMessage || "Failed to regenerate feedback");
      toast({
        title: "Error",
        description: errorMessage || "Could not regenerate feedback",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Helper function to analyze skills from feedback
  const analyzeSkills = (feedback: string): SkillAnalysis[] => {
    const skillCategories = {
      "Technical Knowledge": [
        "technical", "knowledge", "understanding", "concept", "fundamentals"
      ],
      "Problem Solving": [
        "problem solving", "algorithm", "solution", "approach", "logic", "reasoning"
      ],
      "Code Quality": [
        "code quality", "clean code", "readable", "maintainable", "best practices", "standards"
      ],
      "Communication": [
        "communication", "articulate", "explain", "clarity", "expression"
      ],
      "System Design": [
        "design", "architecture", "structure", "pattern", "scalable", "maintainable"
      ]
    };

    const skills: SkillAnalysis[] = [];
    const lowerFeedback = feedback.toLowerCase();

    Object.entries(skillCategories).forEach(([name, keywords]) => {
      const mentioned = keywords.some(keyword => lowerFeedback.includes(keyword.toLowerCase()));

      if (mentioned) {
        // Generate a score based on sentiment analysis (simplified)
        const positiveWords = ["excellent", "good", "great", "strong", "impressive"];
        const negativeWords = ["improve", "weak", "lacking", "needs work", "poor"];

        let score = 70; // Default score

        // Adjust score based on positive/negative words near the skill keywords
        positiveWords.forEach(word => {
          if (lowerFeedback.includes(word)) score += 5;
        });

        negativeWords.forEach(word => {
          if (lowerFeedback.includes(word)) score -= 5;
        });

        // Ensure score is within 0-100 range
        score = Math.max(0, Math.min(100, score));

        skills.push({ name, score });
      }
    });

    return skills.sort((a, b) => b.score - a.score);
  };

  // Helper function to analyze feedback themes
  const analyzeFeedbackThemes = (feedback: string): FeedbackTheme[] => {
    const themes = [
      {
        theme: "Strengths",
        keywords: ["strong", "excellent", "impressive", "good", "great"],
        sentiment: "positive"
      },
      {
        theme: "Areas for Improvement",
        keywords: ["improve", "lacking", "weak", "needs", "should", "could"],
        sentiment: "negative"
      },
      {
        theme: "Technical Skills",
        keywords: ["technical", "coding", "programming", "algorithm", "data structure"],
        sentiment: "neutral"
      },
      {
        theme: "Soft Skills",
        keywords: ["communication", "articulate", "explain", "clarity", "collaborate"],
        sentiment: "neutral"
      }
    ];

    const results: FeedbackTheme[] = [];
    const sentences = feedback.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lowerFeedback = feedback.toLowerCase();

    themes.forEach(({ theme, keywords, sentiment }) => {
      const occurrences = keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, "gi");
        const matches = lowerFeedback.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);

      if (occurrences > 0) {
        // Find example sentences containing these keywords
        const examples = sentences
          .filter(sentence =>
            keywords.some(keyword =>
              sentence.toLowerCase().includes(keyword.toLowerCase())
            )
          )
          .slice(0, 3)
          .map(s => s.trim());

        results.push({
          theme,
          occurrences,
          sentiment: {
            positive: sentiment === "positive" ? 100 : 0,
            negative: sentiment === "negative" ? 100 : 0,
            neutral: sentiment === "neutral" ? 100 : 0
          },
          examples
        });
      }
    });

    return results.sort((a, b) => b.occurrences - a.occurrences);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading interview analysis...</span>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold mb-2">Error Loading Analysis</h1>
        <p className="text-muted-foreground mb-4">{error || "Interview not found"}</p>
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/dashboard/interviews">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interviews
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Note: If you're not logged in, the system will show mock data for demonstration purposes.
            <br />
            Try refreshing the page or logging in to see your actual interview data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/dashboard/interviews/${interview.id}/results`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">{interview.title || "Interview Analysis"}</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed performance analysis and feedback insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerateFeedback} disabled={regenerating}>
            {regenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Analysis
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Overview and Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Overall assessment and key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground mb-2">Overall Score</span>
                  <div className="text-4xl font-bold mb-2">
                    {interview.score ? `${interview.score}/100` : "N/A"}
                  </div>
                  <Badge variant={getScoreBadgeVariant(interview.score)}>
                    {getScoreLabel(interview.score)}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Domain</span>
                      <span className="text-sm font-medium">{formatDomain(interview.domain)}</span>
                    </div>
                    {interview.subDomain && (
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Sub-domain</span>
                        <span className="text-sm font-medium">{interview.subDomain}</span>
                      </div>
                    )}
                    {interview.difficulty && (
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Difficulty</span>
                        <span className="text-sm font-medium">{formatDifficulty(interview.difficulty)}</span>
                      </div>
                    )}
                    {interview.duration && (
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Duration</span>
                        <span className="text-sm font-medium">{interview.duration} min</span>
                      </div>
                    )}
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Questions</span>
                      <span className="text-sm font-medium">{interview.questions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Analysis</CardTitle>
              <CardDescription>
                Performance breakdown by skill category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <p className="font-medium">{skill.name}</p>
                        <p className="font-semibold text-muted-foreground">
                          {skill.score}/100
                        </p>
                      </div>
                      <Progress
                        value={skill.score}
                        className="h-2"
                        indicatorClassName={getProgressColor(skill.score)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No skills analysis available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Feedback Themes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Themes</CardTitle>
              <CardDescription>
                Common themes identified in feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackThemes.length > 0 ? (
                <div className="space-y-6">
                  {feedbackThemes.map((theme) => (
                    <div key={theme.theme} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{theme.theme}</h3>
                        <Badge variant="outline">{theme.occurrences} mentions</Badge>
                      </div>
                      <div className="space-y-1">
                        {theme.examples.map((example, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            "{example}"
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No feedback themes available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggested next steps based on analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generateRecommendations(interview, skills).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`mt-0.5 ${rec.type === 'positive' ? 'text-green-500' : rec.type === 'negative' ? 'text-red-500' : 'text-amber-500'}`}>
                      {rec.type === 'positive' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : rec.type === 'negative' ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <p className="text-sm">{rec.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
          <CardDescription>
            Comprehensive feedback from the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interview.overallFeedback ? (
            <div className="prose dark:prose-invert max-w-none">
              {interview.overallFeedback.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No detailed feedback available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getScoreBadgeVariant(score: number | null | undefined) {
  if (!score) return "outline";
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

function getScoreLabel(score: number | null | undefined) {
  if (!score) return "Not Scored";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Satisfactory";
  if (score >= 50) return "Needs Improvement";
  return "Poor";
}

function getProgressColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function formatDomain(domain: string) {
  switch (domain.toLowerCase()) {
    case "frontend": return "Frontend";
    case "backend": return "Backend";
    case "fullstack": return "Full Stack";
    case "data_analytics": return "Data Analytics";
    default: return domain;
  }
}

function formatDifficulty(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "basic": return "Basic";
    case "intermediate": return "Intermediate";
    case "advanced": return "Advanced";
    default: return difficulty;
  }
}

function generateRecommendations(interview: Interview, skills: SkillAnalysis[]) {
  const recommendations: Array<{ type: 'positive' | 'negative' | 'neutral', text: string }> = [];

  // Overall score recommendation
  if (interview.score) {
    if (interview.score >= 80) {
      recommendations.push({
        type: 'positive',
        text: 'Overall performance is excellent. Consider moving forward with this candidate.'
      });
    } else if (interview.score >= 60) {
      recommendations.push({
        type: 'neutral',
        text: 'Performance is satisfactory. Consider a follow-up interview to clarify specific areas.'
      });
    } else {
      recommendations.push({
        type: 'negative',
        text: 'Performance is below expectations. Additional training or practice recommended before proceeding.'
      });
    }
  }

  // Skill-specific recommendations
  skills.forEach(skill => {
    if (skill.score < 60) {
      recommendations.push({
        type: 'negative',
        text: `Focus on improving ${skill.name.toLowerCase()} skills, which scored below average.`
      });
    } else if (skill.score >= 80) {
      recommendations.push({
        type: 'positive',
        text: `Strong performance in ${skill.name.toLowerCase()}, which is a key strength.`
      });
    }
  });

  // Add generic recommendations if we don't have enough
  if (recommendations.length < 3) {
    recommendations.push({
      type: 'neutral',
      text: 'Review the detailed feedback for specific improvement suggestions.'
    });
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
