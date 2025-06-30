import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import InterviewModel from "@/lib/models/Interview";
import CandidateModel from "@/lib/models/Candidate";

// Helper function to check admin authorization
async function checkAdminAuth(session: any) {
  if (!session || !session.user) {
    return { authorized: false, status: 401, message: "Authentication required" };
  }

  // Connect to the database
  await connectToDatabase();

  // Find the user by email
  const adminUser = await UserModel.findOne({ email: session.user.email });

  // Check if user exists and is an admin
  if (!adminUser || adminUser.role !== "admin") {
    return { authorized: false, status: 403, message: "Unauthorized: Admin access required" };
  }

  return { authorized: true, adminUser };
}

// GET admin dashboard statistics
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

    // Connect to the database
    await connectToDatabase();

    // Get counts
    const totalUsers = await UserModel.countDocuments();
    const totalInterviews = await InterviewModel.countDocuments();
    const totalCandidates = await CandidateModel.countDocuments();
    
    // Get active users (users who have logged in within the last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await UserModel.countDocuments({ 
      lastLogin: { $gte: oneDayAgo } 
    });

    // Get new users in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await UserModel.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Get new interviews in the last 7 days
    const newInterviews = await InterviewModel.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Get completed interviews
    const completedInterviews = await InterviewModel.countDocuments({ 
      status: "completed" 
    });

    // Get user roles distribution
    const adminUsers = await UserModel.countDocuments({ role: "admin" });
    const regularUsers = totalUsers - adminUsers;

    // Get recent users
    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    // Get recent interviews
    const recentInterviews = await InterviewModel.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Return statistics
    return NextResponse.json({
      counts: {
        totalUsers,
        totalInterviews,
        totalCandidates,
        activeUsers,
        newUsers,
        newInterviews,
        completedInterviews
      },
      distribution: {
        userRoles: {
          admin: adminUsers,
          user: regularUsers
        }
      },
      recent: {
        users: recentUsers.map(user => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          createdAt: user.createdAt
        })),
        interviews: recentInterviews.map(interview => ({
          id: interview._id.toString(),
          title: interview.title || "Untitled Interview",
          status: interview.status,
          createdAt: interview.createdAt,
          userId: interview.user.toString()
        }))
      }
    });
  } catch (error: any) {
    console.error("Error in admin stats API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
