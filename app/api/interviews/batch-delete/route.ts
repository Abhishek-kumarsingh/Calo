import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get interview IDs from request body
    const { interviewIds } = await req.json();

    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Expected an array of interview IDs." },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete ${interviewIds.length} interviews`);

    // Track successful and failed deletions
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    // Process each interview deletion locally
    for (const interviewId of interviewIds) {
      try {
        // Fetch the interview to check if it exists and belongs to the user
        const interview = await db.findInterviewById(interviewId);

        if (!interview) {
          console.log(`Interview with ID ${interviewId} not found`);
          results.failed.push(interviewId);
          continue;
        }

        // Check if the user has access to this interview
        if (interview.userId !== session.user.id) {
          console.log(`User ${session.user.id} not authorized to access interview ${interviewId}`);
          results.failed.push(interviewId);
          continue;
        }

        // Delete the interview from our database
        console.log(`Deleting interview with ID: ${interviewId}`);
        const deleted = await db.deleteInterview(interviewId);

        if (!deleted) {
          console.error(`Failed to delete interview with ID: ${interviewId}`);
          results.failed.push(interviewId);
          continue;
        }

        // Also delete related data
        console.log(`Deleting messages for interview with ID: ${interviewId}`);
        await db.deleteMessagesByInterviewId(interviewId);

        console.log(`Deleting questions for interview with ID: ${interviewId}`);
        await db.deleteQuestionsByInterviewId(interviewId);

        // Mark as successful
        results.success.push(interviewId);
        console.log(`Successfully deleted interview ${interviewId}`);
      } catch (err) {
        console.error(`Error deleting interview ${interviewId}:`, err);
        results.failed.push(interviewId);
      }
    }

    // Try to forward the request to the backend server as well, but don't rely on it for success
    try {
      // Make a request to the backend to get the JWT token
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          // Use a special flag to indicate this is a server-side request
          serverSideRequest: true,
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const token = tokenData.token;

        // Forward the request to the backend server
        const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/batch-delete`;
        console.log(`Forwarding batch delete request to: ${backendUrl}`);

        const response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ interviewIds }),
        });

        if (response.ok) {
          console.log("Backend batch delete successful");
        } else {
          console.warn(`Backend batch delete returned status ${response.status}. Continuing anyway since local delete was processed.`);
        }
      }
    } catch (backendError) {
      console.warn(`Error forwarding batch delete to backend: ${backendError}. Continuing anyway since local delete was processed.`);
    }

    // Return the results
    if (results.success.length === 0) {
      return NextResponse.json(
        { error: "Failed to delete any interviews", failedIds: results.failed },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${results.success.length} interviews`,
      deletedCount: results.success.length,
      successIds: results.success,
      failedIds: results.failed.length > 0 ? results.failed : undefined
    });
  } catch (error: any) {
    console.error("Error deleting interviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete interviews" },
      { status: 500 }
    );
  }
}
