import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(
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

    const interviewId = params.id;
    const { questionIndex, answer } = await req.json();

    if (questionIndex === undefined || answer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: questionIndex and answer are required" },
        { status: 400 }
      );
    }

    // Get the interview
    const interview = await db.findInterviewById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the question index is valid
    if (!interview.questions || questionIndex < 0 || questionIndex >= interview.questions.length) {
      return NextResponse.json(
        { error: "Invalid question index" },
        { status: 400 }
      );
    }

    // Update the answer
    const updatedQuestions = [...interview.questions];
    updatedQuestions[questionIndex].answer = answer;

    // Generate feedback for the answer
    const question = updatedQuestions[questionIndex].question;
    const prompt = `Evaluate this answer to the question: "${question}". The answer is: "${answer}". Provide constructive feedback for a ${interview.level} level ${interview.domain} developer focusing on ${interview.subDomain}.`;

    try {
      // Get API key from environment variables
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("Gemini API key not configured");
        throw new Error("API key not configured");
      }

      // Call Gemini API for feedback
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate feedback from AI");
      }

      const data = await response.json();
      const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!feedback) {
        throw new Error("Empty feedback from AI");
      }

      // Update the feedback
      updatedQuestions[questionIndex].feedback = feedback;
    } catch (error) {
      console.error("Error generating feedback:", error);
      // If feedback generation fails, provide a generic feedback
      updatedQuestions[questionIndex].feedback = `Thank you for your answer. Let's continue with the next question.`;
    }

    // Update the interview with the new questions array
    const updatedInterview = await db.updateInterview(interviewId, {
      questions: updatedQuestions
    });

    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}