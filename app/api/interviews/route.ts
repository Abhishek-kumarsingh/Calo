import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";

// Helper function to handle user interviews
async function handleUserInterviews(user: any) {
  try {
    // Find all interviews for this user
    const interviews = await InterviewModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${interviews.length} interviews for user ${user.email}`);

    // Transform the data to match the expected format
    const transformedInterviews = interviews.map(interview => ({
      id: (interview._id as { toString(): string }).toString(),
      domain: interview.domain,
      subDomain: interview.subDomain,
      level: interview.level,
      status: interview.status,
      score: interview.score,
      overallFeedback: interview.overallFeedback,
      questions: interview.questions,
      title: interview.title,
      description: interview.description,
      date: interview.date,
      duration: interview.duration,
      type: interview.type,
      userId: interview.user.toString(),
      candidateId: interview.candidateId?.toString(),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt
    }));

    return NextResponse.json(transformedInterviews);
  } catch (error: any) {
    console.error("Error processing interviews:", error);
    return NextResponse.json(
      { error: error.message || "Error processing interviews" },
      { status: 500 }
    );
  }
}

// Get all interviews for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in GET interviews:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    console.log("Looking for user with email:", session.user.email);

    // Find the user by email
    const user = await UserModel.findOne({ email: session.user.email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      // Try to find the user by ID if email fails
      console.log("Trying to find user by ID:", session.user.id);

      // Check if the ID is a valid MongoDB ObjectId
      let userById = null;
      try {
        if (mongoose.Types.ObjectId.isValid(session.user.id)) {
          userById = await UserModel.findById(session.user.id);
        }
      } catch (error) {
        console.error("Error finding user by ID:", error);
      }

      console.log("User found by ID:", userById ? "Yes" : "No");

      if (userById) {
        console.log("User found by ID:", userById.email);
        return await handleUserInterviews(userById);
      }

      // If we still can't find the user, try to use demo data
      console.log("Using demo data as fallback");

      // Check if this is a demo user
      if (session.user.email === "admin@gmail.com" || session.user.email === "user@gmail.com") {
        console.log("Creating demo interviews for demo user");

        // Return some demo interviews
        return NextResponse.json([
          {
            id: "demo1",
            domain: "Web Development",
            subDomain: "Frontend",
            level: "Intermediate",
            status: "completed",
            score: 85,
            title: "Frontend Developer Interview",
            description: "Interview for frontend developer position",
            type: "technical",
            userId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "demo2",
            domain: "Web Development",
            subDomain: "Backend",
            level: "Advanced",
            status: "scheduled",
            title: "Backend Developer Interview",
            description: "Interview for backend developer position",
            type: "technical",
            userId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }

      return NextResponse.json([]);
    }

    return await handleUserInterviews(user);
  } catch (error: any) {
    console.error("Error in interviews API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new interview
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST interview:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    console.log("Looking for user with email:", session.user.email);

    // Find the user by email
    let user = await UserModel.findOne({ email: session.user.email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      // Try to find the user by ID if email fails
      console.log("Trying to find user by ID:", session.user.id);

      // Check if the ID is a valid MongoDB ObjectId
      let userById = null;
      try {
        if (mongoose.Types.ObjectId.isValid(session.user.id)) {
          userById = await UserModel.findById(session.user.id);
        }
      } catch (error) {
        console.error("Error finding user by ID:", error);
      }

      console.log("User found by ID:", userById ? "Yes" : "No");

      if (userById) {
        console.log("User found by ID:", userById.email);
        user = userById;
      } else {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { domain, subDomain, level, type = 'ai_generated', title, description } = body;

    if (!domain || !subDomain || !level) {
      return NextResponse.json(
        { error: "Missing required fields: domain, subDomain, and level are required" },
        { status: 400 }
      );
    }

    // Create a new interview
    const interview = new InterviewModel({
      domain,
      subDomain,
      level,
      type,
      title,
      description,
      status: 'scheduled',
      user: user._id,
      questions: [],
      ...(body.candidateId && { candidateId: new mongoose.Types.ObjectId(body.candidateId) })
    });

    // Save the interview
    await interview.save();

    // Return the created interview
    return NextResponse.json({
      id: (interview._id as { toString(): string }).toString(),
      domain: interview.domain,
      subDomain: interview.subDomain,
      level: interview.level,
      status: interview.status,
      type: interview.type,
      title: interview.title,
      description: interview.description,
      userId: interview.user.toString(),
      candidateId: interview.candidateId?.toString(),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating interview:", error);

    // Log more detailed error information
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: error.message || "Failed to create interview" },
      { status: 500 }
    );
  }
}
