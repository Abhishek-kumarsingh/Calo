import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";
import { logAdminEvent } from "@/lib/logger";
import { getToken } from "next-auth/jwt";

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

// POST to impersonate a user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Get request body
    const body = await req.json();
    const { userId } = body;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the target user
    const targetUser = await UserModel.findById(userId).select("-password");

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Log this admin action
    await logAdminEvent(
      "impersonate_user",
      `Admin impersonated user: ${targetUser.name} (${targetUser.email})`,
      authCheck.user._id.toString(),
      targetUser._id.toString(),
      "User",
      "success",
      req
    );

    // Create impersonation token with original admin ID for tracking
    const impersonationToken = {
      adminId: authCheck.user._id.toString(),
      impersonatedUserId: targetUser._id.toString(),
      timestamp: new Date().toISOString()
    };

    // Return the target user data with impersonation token
    return NextResponse.json({
      success: true,
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        image: targetUser.image,
        createdAt: targetUser.createdAt
      },
      impersonationToken: Buffer.from(JSON.stringify(impersonationToken)).toString('base64')
    });
  } catch (error: any) {
    console.error("Error in admin impersonate API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET to end impersonation
export async function GET(req: NextRequest) {
  try {
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if there's an impersonation token in the request
    const impersonationTokenBase64 = req.headers.get('x-impersonation-token');
    
    if (!impersonationTokenBase64) {
      return NextResponse.json(
        { error: "No impersonation token found" },
        { status: 400 }
      );
    }

    try {
      // Decode the impersonation token
      const impersonationToken = JSON.parse(
        Buffer.from(impersonationTokenBase64, 'base64').toString()
      );

      // Connect to the database
      await connectToDatabase();

      // Find the admin user
      const adminUser = await UserModel.findById(impersonationToken.adminId).select("-password");

      if (!adminUser) {
        return NextResponse.json(
          { error: "Admin user not found" },
          { status: 404 }
        );
      }

      // Log this action
      await logAdminEvent(
        "end_impersonation",
        `Admin ended impersonation of user ID: ${impersonationToken.impersonatedUserId}`,
        adminUser._id.toString(),
        impersonationToken.impersonatedUserId,
        "User",
        "success",
        req
      );

      // Return success
      return NextResponse.json({
        success: true,
        message: "Impersonation ended",
        adminUser: {
          id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid impersonation token" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in admin end impersonation API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
