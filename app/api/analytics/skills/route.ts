import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { mockSkillsAnalysis } from "@/lib/mock-analytics";

// Define skill categories and keywords to look for in feedback
const SKILL_CATEGORIES = {
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
  ],
  "Debugging": [
    "debug", "troubleshoot", "fix", "issue", "error", "problem"
  ],
  "Framework Knowledge": [
    "framework", "library", "react", "angular", "vue", "node", "express", "django", "spring"
  ]
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For development, return mock data if not authenticated
    if (!session || !session.user) {
      console.log("No authenticated user found, returning mock skills analysis data");
      return NextResponse.json(mockSkillsAnalysis);
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

    // Initialize skill scores
    const skillScores: Record<string, { count: number, total: number }> = {};
    Object.keys(SKILL_CATEGORIES).forEach(skill => {
      skillScores[skill] = { count: 0, total: 0 };
    });

    // Analyze feedback for each interview
    interviews.forEach(interview => {
      if (!interview.overallFeedback) return;

      // Check each skill category
      Object.entries(SKILL_CATEGORIES).forEach(([skill, keywords]) => {
        // Check if any keyword is mentioned in the feedback
        const mentioned = keywords.some(keyword =>
          interview.overallFeedback?.toLowerCase().includes(keyword.toLowerCase())
        );

        if (mentioned && interview.score) {
          skillScores[skill].count++;
          skillScores[skill].total += interview.score;
        }
      });

      // Also analyze individual question feedback if available
      if (interview.questions) {
        interview.questions.forEach(question => {
          if (!question.feedback) return;

          Object.entries(SKILL_CATEGORIES).forEach(([skill, keywords]) => {
            const mentioned = keywords.some(keyword =>
              question.feedback?.toLowerCase().includes(keyword.toLowerCase())
            );

            if (mentioned && question.score) {
              skillScores[skill].count++;
              skillScores[skill].total += question.score;
            }
          });
        });
      }
    });

    // Calculate average scores and format response
    const skillsAnalysis = Object.entries(skillScores)
      .map(([name, { count, total }]) => ({
        name,
        score: count > 0 ? Math.round(total / count) : 0
      }))
      .filter(skill => skill.score > 0) // Only include skills with data
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return NextResponse.json(skillsAnalysis);
  } catch (error) {
    console.error("Error fetching skills analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills analysis" },
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
