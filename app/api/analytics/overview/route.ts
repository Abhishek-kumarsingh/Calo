import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { mockAnalyticsOverview } from "@/lib/mock-analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For development, return mock data if not authenticated
    if (!session || !session.user) {
      console.log("No authenticated user found, returning mock analytics overview data");
      return NextResponse.json(mockAnalyticsOverview);
    }

    // Parse query parameters
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const timeframe = url.searchParams.get("timeframe");

    // Get date range based on timeframe
    const dateRange = getDateRange(timeframe);

    // Fetch interviews from our database with filters
    const interviews = await db.findInterviews({
      userId: session.user.id,
      domain: domain || undefined,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: "completed"
    });

    // Calculate analytics
    const totalInterviews = interviews.length;

    let overallScoreSum = 0;
    let completedInterviews = 0;
    let totalDuration = 0;

    interviews.forEach(interview => {
      if (interview.status === "completed") {
        completedInterviews++;

        if (interview.score) {
          overallScoreSum += interview.score;
        }

        if (interview.duration) {
          totalDuration += interview.duration;
        }
      }
    });

    const overallScore = completedInterviews > 0
      ? Math.round(overallScoreSum / completedInterviews)
      : 0;

    const avgDuration = completedInterviews > 0
      ? Math.round(totalDuration / completedInterviews)
      : 0;

    return NextResponse.json({
      overallScore,
      totalInterviews,
      completedInterviews,
      avgDuration
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics overview" },
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
