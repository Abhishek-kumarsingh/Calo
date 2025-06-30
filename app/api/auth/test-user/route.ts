import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

// This endpoint is for development purposes only
// It creates a test user with known credentials
export async function GET(req: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Check if the test user already exists
    let user = await db.findUserByEmail("test@example.com");

    if (!user) {
      // The hashed version of "password123"
      const hashedPassword = "$2b$10$GQl8yVMr.EgK3ykG3MJ7TOeKqUZNnoWmGg6NP82dVz/0UFPZXR0Ky";

      // Create the test user
      user = await db.createUser({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "user"
      });
    }

    return NextResponse.json(
      {
        message: "Test user created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        credentials: {
          email: "test@example.com",
          password: "password123"
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
