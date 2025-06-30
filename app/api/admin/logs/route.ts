import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import SystemLogModel from "@/lib/models/SystemLog";
import UserModel from "@/lib/models/User";
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

// GET system logs
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
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const userId = url.searchParams.get("userId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
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
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await SystemLogModel.countDocuments(query);
    
    // Get logs with pagination
    const logs = await SystemLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email");

    // Transform the data
    const transformedLogs = logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      category: log.category,
      details: log.details,
      status: log.status,
      createdAt: log.createdAt,
      user: log.userId ? {
        id: log.userId._id.toString(),
        name: log.userId.name,
        email: log.userId.email
      } : null,
      resourceId: log.resourceId ? log.resourceId.toString() : null,
      resourceType: log.resourceType,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }));

    // Log this admin action
    await logAdminEvent({
      action: "view_logs",
      message: `Admin viewed system logs with filters: ${JSON.stringify({
        category,
        status,
        userId,
        startDate,
        endDate,
        search
      })}`,
      resourceId: undefined,
      resourceType: undefined,
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers.get("user-agent")
    }, authCheck.user._id.toString());

    // Return logs with pagination metadata
    return NextResponse.json({
      logs: transformedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error in admin logs API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
