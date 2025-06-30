import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import InterviewModel from "@/lib/models/Interview";
import SystemLogModel from "@/lib/models/SystemLog";
import mongoose from "mongoose";
import { logAdminEvent } from "@/lib/logger";

// Helper function to check admin authentication
async function checkAdminAuth(session: any) {
  if (!session || !session.user) {
    return {
      authorized: false,
      message: "Unauthorized",
      status: 401
    };
  }

  // Connect to the database
  await connectToDatabase();

  // Find the user by email
  const user = await UserModel.findOne({ email: session.user.email });

  if (!user) {
    return {
      authorized: false,
      message: "User not found",
      status: 404
    };
  }

  // Check if the user is an admin
  if (user.role !== "admin") {
    return {
      authorized: false,
      message: "Access denied. Admin privileges required.",
      status: 403
    };
  }

  return {
    authorized: true,
    user
  };
}

// GET advanced analytics data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const period = parseInt(url.searchParams.get("period") || "30");
    
    // Validate period parameter
    if (isNaN(period) || period <= 0 || period > 365) {
      return NextResponse.json(
        { error: "Invalid period parameter. Must be between 1 and 365." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. User Behavior Analytics
    
    // 1.1 User engagement over time
    const userEngagement = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          interviewCount: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          date: "$_id",
          interviewCount: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 1.2 Interview completion rate
    const interviewStats = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate completion rate
    const totalInterviews = interviewStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedInterviews = interviewStats.find(stat => stat._id === "completed")?.count || 0;
    const completionRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;

    // 1.3 Domain popularity
    const domainPopularity = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$domain",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 1.4 User retention (returning users)
    const userRetention = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$user",
          interviewCount: { $sum: 1 },
          firstInterview: { $min: "$createdAt" },
          lastInterview: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          user: "$_id",
          interviewCount: 1,
          daysBetween: {
            $divide: [
              { $subtract: ["$lastInterview", "$firstInterview"] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          },
          _id: 0
        }
      }
    ]);

    // Calculate retention metrics
    const returningUsers = userRetention.filter(user => user.interviewCount > 1).length;
    const totalUsers = userRetention.length;
    const retentionRate = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;

    // 2. System Performance Analytics
    
    // 2.1 System logs by category
    const systemLogsByCategory = await SystemLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 2.2 Error rates
    const errorLogs = await SystemLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "failure"
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            category: "$category"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          categories: {
            $push: {
              category: "$_id.category",
              count: "$count"
            }
          },
          totalErrors: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2.3 Average interview duration trend
    const interviewDurationTrend = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          duration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          averageDuration: { $avg: "$duration" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2.4 Question type distribution
    const questionTypeDistribution = await InterviewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          "questions.type": { $exists: true }
        }
      },
      { $unwind: "$questions" },
      {
        $group: {
          _id: "$questions.type",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Log this admin action
    await logAdminEvent(
      "view_advanced_analytics",
      `Admin viewed advanced analytics for the last ${period} days`,
      authCheck.user._id.toString(),
      undefined,
      undefined,
      "success",
      req
    );

    // Return the analytics data
    return NextResponse.json({
      userBehavior: {
        engagement: userEngagement,
        completionRate: {
          rate: completionRate.toFixed(2),
          completed: completedInterviews,
          total: totalInterviews,
          statusBreakdown: interviewStats
        },
        domainPopularity: domainPopularity,
        retention: {
          returningUsers,
          totalUsers,
          retentionRate: retentionRate.toFixed(2),
          userDetails: userRetention
        }
      },
      systemPerformance: {
        logsByCategory: systemLogsByCategory,
        errorRates: errorLogs,
        interviewDurationTrend: interviewDurationTrend,
        questionTypeDistribution: questionTypeDistribution
      },
      period: {
        days: period,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (error: any) {
    console.error("Error in admin analytics API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
