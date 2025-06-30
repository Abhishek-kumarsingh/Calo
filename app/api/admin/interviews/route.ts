import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";

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

// GET all interviews
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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const domain = url.searchParams.get("domain");
    const search = url.searchParams.get("search");
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (domain) {
      query.domain = domain;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { subDomain: { $regex: search, $options: "i" } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await InterviewModel.countDocuments(query);
    
    // Get interviews with pagination
    const interviews = await InterviewModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("candidateId", "name email");

    // Transform the data
    const transformedInterviews = interviews.map(interview => ({
      id: interview._id.toString(),
      title: interview.title || "Untitled Interview",
      domain: interview.domain,
      subDomain: interview.subDomain,
      level: interview.level,
      status: interview.status,
      score: interview.score,
      type: interview.type,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      user: interview.user ? {
        id: interview.user._id.toString(),
        name: interview.user.name,
        email: interview.user.email
      } : null,
      candidate: interview.candidateId ? {
        id: interview.candidateId._id.toString(),
        name: interview.candidateId.name,
        email: interview.candidateId.email
      } : null,
      questionsCount: interview.questions ? interview.questions.length : 0
    }));

    // Return interviews with pagination metadata
    return NextResponse.json({
      interviews: transformedInterviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error in admin interviews API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
