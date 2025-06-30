import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/question-banks/${params.id}`;
    
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
        { error: "Failed to fetch question bank" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return NextResponse.json(
      { error: "Failed to fetch question bank" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/question-banks/${params.id}`;
    
    console.log(`Forwarding request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to delete question bank" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting question bank:", error);
    return NextResponse.json(
      { error: "Failed to delete question bank" },
      { status: 500 }
    );
  }
}
