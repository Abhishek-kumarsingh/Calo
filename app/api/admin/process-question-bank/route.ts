import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import { BackgroundProcessingService } from "@/lib/services/backgroundProcessingService";

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

// POST endpoint to manually trigger question bank processing
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

    // Trigger the background processing
    await BackgroundProcessingService.checkAndProcessQuestionBank();

    return NextResponse.json({
      message: "Question bank processing triggered successfully"
    });
  } catch (error: any) {
    console.error("Error triggering question bank processing:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
