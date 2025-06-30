import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";

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

// GET a single interview by ID
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

    const { id } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid interview ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the interview
    const interview = await InterviewModel.findById(id)
      .populate("user", "name email")
      .populate("candidateId", "name email");

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedInterview = {
      id: interview._id.toString(),
      title: interview.title || "Untitled Interview",
      domain: interview.domain,
      subDomain: interview.subDomain,
      level: interview.level,
      status: interview.status,
      score: interview.score,
      type: interview.type,
      description: interview.description,
      date: interview.date,
      duration: interview.duration,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      user: interview.user ? {
        id: interview.user._id.toString(),
        name: interview.user.name,
        email: interview.user.email
      } : null,
      candidate: interview.candidateId ? {
        id: interview.candidateId._id.toString(),
        name: interview.candidateId.name,
        email: interview.candidateId.email
      } : null,
      questions: interview.questions ? interview.questions.map((q: any) => ({
        id: q._id.toString(),
        question: q.question,
        answer: q.answer,
        feedback: q.feedback,
        score: q.score,
        type: q.type
      })) : []
    };

    return NextResponse.json(transformedInterview);
  } catch (error: any) {
    console.error("Error in admin interview API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update an interview
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

    const { id } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid interview ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the interview
    const interview = await InterviewModel.findById(id);

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Get request body
    const body = await req.json();
    const { title, status, description, date, duration } = body;

    // Update fields
    if (title !== undefined) interview.title = title;
    if (status !== undefined) interview.status = status;
    if (description !== undefined) interview.description = description;
    if (date !== undefined) interview.date = new Date(date);
    if (duration !== undefined) interview.duration = duration;

    // Save the updated interview
    await interview.save();

    // Return the updated interview
    return NextResponse.json({
      id: interview._id.toString(),
      title: interview.title,
      status: interview.status,
      description: interview.description,
      date: interview.date,
      duration: interview.duration,
      updatedAt: interview.updatedAt
    });
  } catch (error: any) {
    console.error("Error in admin interview API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE an interview
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

    const { id } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid interview ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find and delete the interview
    const result = await InterviewModel.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in admin interview API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
