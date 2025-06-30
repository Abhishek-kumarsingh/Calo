import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get all chat sessions for the current user
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/chat-sessions`;
    
    console.log(`Forwarding request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch chat sessions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

// Create a new chat session
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/chat-sessions`;
    
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
        { error: errorData.message || "Failed to create chat session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat session" },
      { status: 500 }
    );
  }
}
