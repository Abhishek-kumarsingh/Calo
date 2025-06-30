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

    // Calculate score based on answers
    let totalScore = 0;
    const answeredQuestions = interview.questions.filter(q => q.answer && q.answer.trim() !== '');

    if (answeredQuestions.length > 0) {
      // Simple scoring algorithm - can be improved
      totalScore = Math.floor(Math.random() * 40) + 60; // Placeholder scoring between 60-100
    }

    // Generate overall feedback
    const prompt = `Provide overall feedback for a ${interview.level} level ${interview.domain} developer interview focusing on ${interview.subDomain}.

Here are the questions and answers:
${interview.questions.map((q, i) => `
Question ${i+1}: ${q.question}
Answer: ${q.answer || 'Not answered'}
`).join('\n')}

The candidate scored ${totalScore} out of 100. Provide constructive feedback on their performance, highlighting strengths and areas for improvement.`;

    let overallFeedback = "";

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
      overallFeedback = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!overallFeedback) {
        throw new Error("Empty feedback from AI");
      }
    } catch (error) {
      console.error("Error generating overall feedback:", error);
      // If feedback generation fails, provide a generic feedback
      overallFeedback = `Thank you for completing the interview. Your overall score is ${totalScore}/100. You demonstrated good knowledge in some areas, but there's room for improvement in others.`;
    }

    // Update the interview
    const updatedInterview = await db.updateInterview(interviewId, {
      status: "completed",
      score: totalScore,
      overallFeedback
    });

    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error("Error completing interview:", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}