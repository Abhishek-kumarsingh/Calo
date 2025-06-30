import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, content } = body;

    if (!questionId || !content) {
      return NextResponse.json(
        { error: "Question ID and content are required" },
        { status: 400 }
      );
    }

    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // In a real application, you would check if the question exists
    // For now, we'll create a simple response object
    const response = {
      id: Date.now().toString(),
      content,
      questionId,
      interviewId: params.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating response:", error);
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all questions for this interview
    const questions = await db.findQuestionsByInterviewId(params.id);

    // For now, we'll simulate responses since we don't have a dedicated responses table
    // In a real app, you would fetch actual responses from the database
    const responses = questions.map(question => ({
      id: `response-${question.id}`,
      content: `Sample response for question: ${question.content.substring(0, 50)}...`,
      score: Math.floor(Math.random() * 100),
      feedback: "This is sample feedback for the response.",
      questionId: question.id,
      question: question,
      interviewId: params.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
