import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { mockDomainPerformance } from "@/lib/mock-analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For development, return mock data if not authenticated
    if (!session || !session.user) {
      console.log("No authenticated user found, returning mock domain performance data");
      return NextResponse.json(mockDomainPerformance);
    }

    // Parse query parameters
    const url = new URL(req.url);
    const timeframe = url.searchParams.get("timeframe");

    // Get date range based on timeframe
    const dateRange = getDateRange(timeframe);

    // Fetch completed interviews from our database with filters
    const interviews = await db.findInterviews({
      userId: session.user.id,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: "completed"
    });

    // Group interviews by domain
    const domainMap: Record<string, { count: number, totalScore: number }> = {};

    interviews.forEach(interview => {
      if (!interview.domain || !interview.score) return;

      if (!domainMap[interview.domain]) {
        domainMap[interview.domain] = { count: 0, totalScore: 0 };
      }

      domainMap[interview.domain].count++;
      domainMap[interview.domain].totalScore += interview.score;
    });

    // Format the response
    const domainPerformance = Object.entries(domainMap).map(([name, { count, totalScore }]) => ({
      name: formatDomainName(name),
      count,
      avgScore: Math.round(totalScore / count)
    })).sort((a, b) => b.avgScore - a.avgScore); // Sort by average score descending

    return NextResponse.json(domainPerformance);
  } catch (error) {
    console.error("Error fetching domain performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch domain performance" },
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

// Helper function to format domain names
function formatDomainName(domain: string): string {
  switch (domain.toLowerCase()) {
    case "frontend":
      return "Frontend";
    case "backend":
      return "Backend";
    case "fullstack":
      return "Full Stack";
    case "data_analytics":
      return "Data Analytics";
    default:
      return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
}
