import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BackgroundProcessingService } from "@/lib/services/backgroundProcessingService";
import { QuestionBankService } from "@/lib/services/questionBankService";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    let token;
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      token = tokenData.token;
    } else {
      console.error("Failed to get token from backend");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Forward the request to the backend server
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/question-banks`;

    console.log(`Forwarding request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch question banks" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check if we need to process questions in the background
    try {
      // Get the count of questions by domain
      const countByDomain = await QuestionBankService.getQuestionCountByDomain();

      // Check if any domain has more than 100 questions
      const domainsToProcess = Object.entries(countByDomain)
        .filter(([_, count]) => count >= 100)
        .map(([domain]) => domain);

      if (domainsToProcess.length > 0) {
        console.log(`Found domains with 100+ questions: ${domainsToProcess.join(', ')}. Triggering background processing.`);
        // Trigger background processing without waiting for it to complete
        BackgroundProcessingService.checkAndProcessQuestionBank().catch(error => {
          console.error('Error in background processing:', error);
        });
      }
    } catch (error) {
      console.error('Error checking question count:', error);
      // Continue even if the check fails
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching question banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch question banks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    let token;
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      token = tokenData.token;
    } else {
      console.error("Failed to get token from backend");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Forward the request to the backend server
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/question-banks`;

    console.log(`Forwarding request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await req.json()),
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to create question bank" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating question bank:", error);
    return NextResponse.json(
      { error: "Failed to create question bank" },
      { status: 500 }
    );
  }
}
