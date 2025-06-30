import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

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

// GET a specific user by ID (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await UserModel.findById(params.id).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return the user
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error: any) {
    console.error("Error in admin user API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update a user (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { name, email, password, role, image } = body;

    // Find the user by ID
    const user = await UserModel.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await UserModel.findOne({ email, _id: { $ne: params.id } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use by another user" },
          { status: 409 }
        );
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role) user.role = role;
    if (image !== undefined) user.image = image;

    // Save the updated user
    await user.save();

    // Return the updated user without password
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error: any) {
    console.error("Error in admin user API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a user (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await UserModel.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the last admin user
    if (user.role === "admin") {
      const adminCount = await UserModel.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        );
      }
    }

    // Delete the user
    await UserModel.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error in admin user API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
