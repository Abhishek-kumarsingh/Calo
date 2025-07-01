import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 });
    }

    // Find the interview
    const interview = await InterviewModel.findById(params.id);

    if (!interview) {
      console.error(`Interview with ID ${params.id} not found`);
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Find the user
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has access to this interview
    if (interview.user.toString() !== user._id.toString()) {
      console.error(`User ${user._id} not authorized to access interview ${params.id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create a prompt for Gemini API to generate feedback
    let promptText = `
You are an expert technical interviewer evaluating a candidate for a ${interview.domain || 'technical'} position, specifically focusing on ${interview.subDomain || 'general programming'} at the ${interview.difficulty || 'intermediate'} level.

Please provide comprehensive feedback on the candidate's performance based on their answers to the following questions. Your feedback should include:

1. Overall assessment of technical knowledge and skills
2. Strengths demonstrated during the interview
3. Areas for improvement
4. Specific recommendations for growth
5. A numerical score between 0 and 100 that reflects their overall performance

Questions and Answers:
`;

    // Add each question and answer to the prompt
    if (interview.questions && interview.questions.length > 0) {
      // Count how many questions have answers
      const answeredQuestions = interview.questions.filter(
        (q: { answer?: string }) => q.answer && q.answer.trim() !== ""
      );

      if (answeredQuestions.length === 0) {
        return NextResponse.json(
          { error: "No answered questions found. Cannot generate feedback." },
          { status: 400 }
        );
      }

      // Add all questions to the prompt, even unanswered ones
      interview.questions.forEach((qa: { question: string; answer?: string }, index: number) => {
        promptText += `\nQuestion ${index + 1}: ${qa.question}\n`;
        // For unanswered questions, indicate that the candidate didn't know the answer
        const answer = qa.answer?.trim()
          ? qa.answer
          : "The candidate indicated they did not know the answer to this question.";
        promptText += `Candidate's Answer: ${answer}\n`;
      });
    } else {
      return NextResponse.json(
        { error: "No questions found for this interview" },
        { status: 400 }
      );
    }

    promptText += `\nPlease format your feedback in a structured way with clear sections for each of the requested evaluation points. Make sure to include a numerical score between 0 and 100.`;

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log("Sending prompt to Gemini API:", promptText.substring(0, 100) + "...");

    try {
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);

      // Create a model instance
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Generate content
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const feedbackText = response.text();

      // Extract score from feedback (assuming the AI includes a score in its response)
      let score = null;
      const scoreMatch = feedbackText.match(/score:?\s*(\d+)/i) || feedbackText.match(/(\d+)\s*\/\s*100/i);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
        if (isNaN(score) || score < 0 || score > 100) {
          score = null;
        }
      }

      // Update the interview in the database
      interview.overallFeedback = feedbackText;
      if (score !== null) {
        interview.score = score;
      }
      interview.status = "completed";
      await interview.save();

      // Transform the interview data
      const transformedInterview = {
        id: interview._id.toString(),
        domain: interview.domain,
        subDomain: interview.subDomain,
        level: interview.level,
        status: interview.status,
        score: interview.score,
        overallFeedback: interview.overallFeedback,
        questions: interview.questions,
        title: interview.title || `${interview.domain} Interview`,
        description: interview.description || `${interview.level} level interview for ${interview.domain}`,
        date: interview.date,
        duration: interview.duration,
        type: interview.type,
        userId: interview.user.toString(),
        candidateId: interview.candidateId?.toString(),
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      };

      return NextResponse.json({
        message: "Feedback generated successfully",
        interview: transformedInterview,
      });
    } catch (error: any) {
      console.error("Error generating feedback:", error);
      return NextResponse.json(
        { error: error.message || "Failed to generate feedback" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in generate-overall-feedback endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
