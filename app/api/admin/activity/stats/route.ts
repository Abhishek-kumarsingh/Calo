import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import InterviewModel from "@/lib/models/Interview";
import QuestionModel from "@/lib/models/Question";
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

// GET activity statistics
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
    const days = parseInt(url.searchParams.get("days") || "30");
    
    // Validate days parameter
    if (isNaN(days) || days <= 0 || days > 365) {
      return NextResponse.json(
        { error: "Invalid days parameter. Must be between 1 and 365." },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total users
    const totalUsers = await UserModel.countDocuments();

    // Get total interviews
    const totalInterviews = await InterviewModel.countDocuments();

    // Get active users (users who have created interviews within the date range)
    const activeUsers = await InterviewModel.distinct("user", {
      createdAt: { $gte: startDate, $lte: endDate }
    }).then(users => users.length);

    // Get completed interviews
    const completedInterviews = await InterviewModel.countDocuments({
      status: "completed"
    });

    // Get average interview duration
    const interviewsWithDuration = await InterviewModel.find({
      duration: { $exists: true, $ne: null }
    });
    
    const totalDuration = interviewsWithDuration.reduce((sum, interview) => 
      sum + (interview.duration || 0), 0);
    
    const averageInterviewDuration = interviewsWithDuration.length > 0 
      ? Math.round(totalDuration / interviewsWithDuration.length) 
      : 0;

    // Get total questions generated
    const totalQuestionsGenerated = await InterviewModel.aggregate([
      {
        $match: {
          questions: { $exists: true }
        }
      },
      {
        $project: {
          questionCount: { $size: "$questions" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$questionCount" }
        }
      }
    ]).then(result => (result.length > 0 ? result[0].total : 0));

    // Log this admin action
    // Log admin action
    await logAdminEvent(
      { action: "view_activity_stats", days },
      authCheck.user._id.toString()
    );

    // Return statistics
    return NextResponse.json({
      totalUsers,
      totalInterviews,
      activeUsers,
      completedInterviews,
      averageInterviewDuration,
      totalQuestionsGenerated,
      period: {
        days,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (error: any) {
    console.error("Error in admin activity stats API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
