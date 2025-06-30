import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import InterviewModel from "@/lib/models/Interview";
import mongoose from "mongoose";

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

// GET user activity data
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
    const userId = url.searchParams.get("userId");
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

    // Base query for date range
    const dateQuery = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add user filter if specified
    const userQuery = userId && mongoose.Types.ObjectId.isValid(userId)
      ? { user: new mongoose.Types.ObjectId(userId) }
      : {};

    // Combine queries
    const query = { ...dateQuery, ...userQuery };

    // Get interview activity data
    const interviewActivity = await InterviewModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Generate a complete date range with zeros for missing dates
    const activityData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const existingData = interviewActivity.find(item => item._id === dateString);
      
      activityData.push({
        date: dateString,
        interviews: existingData ? existingData.count : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get user details if userId is provided
    let userData = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await UserModel.findById(userId).select("-password");
      if (user) {
        userData = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          createdAt: user.createdAt
        };
      }
    }

    // Return activity data
    return NextResponse.json({
      activityData,
      user: userData,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days
      }
    });
  } catch (error: any) {
    console.error("Error in admin activity API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
