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

// GET all questions from the question bank
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const domain = url.searchParams.get("domain");
    const difficulty = url.searchParams.get("difficulty");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Build query
    const query: any = {};
    
    if (domain) {
      query.domain = domain;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { subDomain: { $regex: search, $options: "i" } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await QuestionBankModel.countDocuments(query);
    
    // Get questions with pagination
    const questions = await QuestionBankModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform the data
    const transformedQuestions = questions.map(question => ({
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
    }));

    // Return questions with pagination metadata
    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error in admin question bank API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new question
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await checkAdminAuth(session);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: authCheck.status }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Get request body
    const body = await req.json();
    const { 
      question, 
      type = 'text', 
      options = [], 
      correctOption = null, 
      codeSnippet = "", 
      domain, 
      subDomain, 
      difficulty 
    } = body;

    // Validate required fields
    if (!question || !domain || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: question, domain, and difficulty are required" },
        { status: 400 }
      );
    }

    // Create a new question
    const newQuestion = new QuestionBankModel({
      question,
      type,
      options,
      correctOption,
      codeSnippet,
      domain,
      subDomain,
      difficulty
    });

    // Save the question
    await newQuestion.save();

    // Return the created question
    return NextResponse.json({
      id: newQuestion._id.toString(),
      question: newQuestion.question,
      type: newQuestion.type,
      options: newQuestion.options,
      correctOption: newQuestion.correctOption,
      codeSnippet: newQuestion.codeSnippet,
      domain: newQuestion.domain,
      subDomain: newQuestion.subDomain,
      difficulty: newQuestion.difficulty,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in admin question bank API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
