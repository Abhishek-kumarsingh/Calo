import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { mockFeedbackThemes } from "@/lib/mock-analytics";

// Define feedback themes to look for
const FEEDBACK_THEMES = {
  "Strengths": [
    { keyword: "strong", sentiment: "positive" },
    { keyword: "excellent", sentiment: "positive" },
    { keyword: "impressive", sentiment: "positive" },
    { keyword: "good", sentiment: "positive" },
    { keyword: "great", sentiment: "positive" },
    { keyword: "solid", sentiment: "positive" },
    { keyword: "proficient", sentiment: "positive" },
    { keyword: "skilled", sentiment: "positive" }
  ],
  "Areas for Improvement": [
    { keyword: "improve", sentiment: "negative" },
    { keyword: "lacking", sentiment: "negative" },
    { keyword: "weak", sentiment: "negative" },
    { keyword: "needs", sentiment: "negative" },
    { keyword: "should", sentiment: "negative" },
    { keyword: "could", sentiment: "negative" },
    { keyword: "better", sentiment: "negative" },
    { keyword: "work on", sentiment: "negative" }
  ],
  "Technical Skills": [
    { keyword: "technical", sentiment: "neutral" },
    { keyword: "coding", sentiment: "neutral" },
    { keyword: "programming", sentiment: "neutral" },
    { keyword: "algorithm", sentiment: "neutral" },
    { keyword: "data structure", sentiment: "neutral" },
    { keyword: "syntax", sentiment: "neutral" }
  ],
  "Soft Skills": [
    { keyword: "communication", sentiment: "neutral" },
    { keyword: "articulate", sentiment: "neutral" },
    { keyword: "explain", sentiment: "neutral" },
    { keyword: "clarity", sentiment: "neutral" },
    { keyword: "collaborate", sentiment: "neutral" },
    { keyword: "teamwork", sentiment: "neutral" }
  ],
  "Problem Solving": [
    { keyword: "problem solving", sentiment: "neutral" },
    { keyword: "approach", sentiment: "neutral" },
    { keyword: "solution", sentiment: "neutral" },
    { keyword: "logic", sentiment: "neutral" },
    { keyword: "reasoning", sentiment: "neutral" },
    { keyword: "analytical", sentiment: "neutral" }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For development, return mock data if not authenticated
    if (!session || !session.user) {
      console.log("No authenticated user found, returning mock feedback themes data");
      return NextResponse.json(mockFeedbackThemes);
    }

    // Parse query parameters
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const timeframe = url.searchParams.get("timeframe");

    // Get date range based on timeframe
    const dateRange = getDateRange(timeframe);

    // Fetch completed interviews from our database with filters
    const interviews = await db.findInterviews({
      userId: session.user.id,
      domain: domain || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: "completed"
    });

    // Initialize theme counters
    const themeCounters: Record<string, {
      positive: number,
      negative: number,
      neutral: number,
      total: number,
      examples: string[]
    }> = {};

    Object.keys(FEEDBACK_THEMES).forEach(theme => {
      themeCounters[theme] = {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
        examples: []
      };
    });

    // Analyze feedback for each interview
    interviews.forEach(interview => {
      if (!interview.overallFeedback) return;

      // Split feedback into sentences for better context
      const sentences = interview.overallFeedback.split(/[.!?]+/).filter(s => s.trim().length > 0);

      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();

        // Check each theme
        Object.entries(FEEDBACK_THEMES).forEach(([theme, keywords]) => {
          keywords.forEach(({ keyword, sentiment }) => {
            if (lowerSentence.includes(keyword.toLowerCase())) {
              themeCounters[theme][sentiment as 'positive' | 'negative' | 'neutral']++;
              themeCounters[theme].total++;

              // Store example if we don't have too many already
              if (themeCounters[theme].examples.length < 3) {
                themeCounters[theme].examples.push(sentence.trim());
              }
            }
          });
        });
      });
    });

    // Format the response
    const feedbackThemes = Object.entries(themeCounters)
      .map(([theme, { positive, negative, neutral, total, examples }]) => ({
        theme,
        occurrences: total,
        sentiment: {
          positive: positive > 0 ? Math.round((positive / total) * 100) : 0,
          negative: negative > 0 ? Math.round((negative / total) * 100) : 0,
          neutral: neutral > 0 ? Math.round((neutral / total) * 100) : 0
        },
        examples: examples.slice(0, 3) // Limit to 3 examples
      }))
      .filter(theme => theme.occurrences > 0) // Only include themes with data
      .sort((a, b) => b.occurrences - a.occurrences); // Sort by occurrences descending

    return NextResponse.json(feedbackThemes);
  } catch (error) {
    console.error("Error analyzing feedback themes:", error);
    return NextResponse.json(
      { error: "Failed to analyze feedback themes" },
      { status: 500 }
    );
  }
}

// Helper function to get date range based on timeframe
function getDateRange(timeframe: string | null) {
  const now = new Date();
  let startDate = new Date(now);

  switch (timeframe) {
    case "7d":
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "90d":
    case "quarter":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "365d":
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Default to all time
      startDate = new Date(0); // January 1, 1970
  }

  return {
    startDate,
    endDate: now
  };
}
