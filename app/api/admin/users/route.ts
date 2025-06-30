import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import bcrypt from "bcrypt";

// GET all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user by email
    const adminUser = await UserModel.findOne({ email: session.user.email });

    // Check if user exists and is an admin
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get all users
    const users = await UserModel.find({}).select("-password").sort({ createdAt: -1 });

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json(transformedUsers);
  } catch (error: any) {
    console.error("Error in admin users API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new user (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user by email
    const adminUser = await UserModel.findOne({ email: session.user.email });

    // Check if user exists and is an admin
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { name, email, password, role = "user", image } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
      image
    });

    // Save the user
    await newUser.save();

    // Return the created user without password
    return NextResponse.json({
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      image: newUser.image,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in admin users API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
