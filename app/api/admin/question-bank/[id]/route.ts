import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import QuestionBankModel from "@/lib/models/QuestionBank";
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

// GET a single question by ID
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
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the question
    const question = await QuestionBankModel.findById(id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedQuestion = {
      id: question._id.toString(),
      question: question.question,
      type: question.type,
      options: question.options,
      correctOption: question.correctOption,
      codeSnippet: question.codeSnippet,
      domain: question.domain,
      subDomain: question.subDomain,
      difficulty: question.difficulty,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };

    return NextResponse.json(transformedQuestion);
  } catch (error: any) {
    console.error("Error in admin question bank API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update a question
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
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the question
    const question = await QuestionBankModel.findById(id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Get request body
    const body = await req.json();
    const { 
      question: questionText, 
      type, 
      options, 
      correctOption, 
      codeSnippet, 
      domain, 
      subDomain, 
      difficulty 
    } = body;

    // Update fields
    if (questionText !== undefined) question.question = questionText;
    if (type !== undefined) question.type = type;
    if (options !== undefined) question.options = options;
    if (correctOption !== undefined) question.correctOption = correctOption;
    if (codeSnippet !== undefined) question.codeSnippet = codeSnippet;
    if (domain !== undefined) question.domain = domain;
    if (subDomain !== undefined) question.subDomain = subDomain;
    if (difficulty !== undefined) question.difficulty = difficulty;

    // Save the updated question
    await question.save();

    // Return the updated question
    return NextResponse.json({
      id: question._id.toString(),
      question: question.question,
      type: question.type,
      options: question.options,
      correctOption: question.correctOption,
      codeSnippet: question.codeSnippet,
      domain: question.domain,
      subDomain: question.subDomain,
      difficulty: question.difficulty,
      updatedAt: question.updatedAt
    });
  } catch (error: any) {
    console.error("Error in admin question bank API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a question
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
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find and delete the question
    const result = await QuestionBankModel.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in admin question bank API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
