import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import { generateSecret, generateBackupCodes, generateQRCode } from "@/lib/two-factor";
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

// POST to generate 2FA setup data
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

    // Generate a new secret
    const secret = generateSecret();
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    
    // Generate QR code
    const qrCode = await generateQRCode(secret, user.email);

    // Store the secret and backup codes temporarily in the session
    // We'll save them to the database after verification
    const setupData = {
      secret,
      backupCodes,
      qrCode
    };

    // Log this admin action
    await logAdminEvent(
      {
        action: "2fa_setup_initiated",
        message: "Admin initiated 2FA setup"
      },
      user._id.toString()
    );

    return NextResponse.json(setupData);
  } catch (error: any) {
    console.error("Error in 2FA setup API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
