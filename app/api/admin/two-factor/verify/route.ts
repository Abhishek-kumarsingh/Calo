import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import { verifyToken, hashBackupCode } from "@/lib/two-factor";
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

// POST to verify and enable 2FA
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

    const user = authCheck.user;
    const body = await req.json();
    const { token, secret, backupCodes } = body;

    if (!token || !secret || !backupCodes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = verifyToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Hash the backup codes for secure storage
    const hashedBackupCodes = backupCodes.map((code: string) => hashBackupCode(code));

    // Update the user with 2FA enabled
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();

    // Log this admin action
    await logAdminEvent(
      "2fa_enabled",
      `Admin enabled 2FA for their account`,
      user._id.toString(),
      user._id.toString(),
      "User",
      "success",
      req
    );

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
      backupCodes
    });
  } catch (error: any) {
    console.error("Error in 2FA verification API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE to disable 2FA
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    const user = authCheck.user;

    // Update the user with 2FA disabled
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    await user.save();

    // Log this admin action
    await logAdminEvent(
      "2fa_disabled",
      `Admin disabled 2FA for their account`,
      user._id.toString(),
      user._id.toString(),
      "User",
      "warning",
      req
    );

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled successfully"
    });
  } catch (error: any) {
    console.error("Error in 2FA disable API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
