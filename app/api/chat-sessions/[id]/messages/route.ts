import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Add a message to a chat session
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/chat-sessions/${params.id}/messages`;
    
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
      const errorData = await response.json();
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to add message to chat session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error adding message to chat session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add message to chat session" },
      { status: 500 }
    );
  }
}
