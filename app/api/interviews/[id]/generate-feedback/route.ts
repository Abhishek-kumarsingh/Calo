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

    // Fetch the interview from our database
    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      console.error(`Interview with ID ${params.id} not found`);
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Check if the user has access to this interview
    if (interview.userId !== session.user.id) {
      console.error(`User ${session.user.id} not authorized to access interview ${params.id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch candidate data
    if (!interview.candidateId) {
      return NextResponse.json({ error: "Candidate ID not found in interview" }, { status: 404 });
    }
    const candidate = await db.findCandidateById(interview.candidateId);
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Get all questions for this interview
    const questions = await db.findQuestionsByInterviewId(params.id);

    // For now, we'll simulate responses since we don't have a dedicated responses table
    // In a real app, you would fetch actual responses from the database
    const responses = questions.map(question => ({
      id: `response-${question.id}`,
      content: `Sample response for question: ${question.content.substring(0, 50)}...`,
      questionId: question.id,
      interviewId: params.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (responses.length === 0) {
      return NextResponse.json(
        { error: "No responses found for this interview" },
        { status: 400 }
      );
    }

    // Create a mapping of questions to responses
    const questionResponseMap = new Map();
    questions.forEach(question => {
      const response = responses.find(r => r.questionId === question.id);
      questionResponseMap.set(question, response || null);
    });

    // Create a prompt for Gemini API to generate feedback
    let promptText = `
You are an expert technical interviewer evaluating a candidate for a ${interview.domain || 'technical'} position, specifically focusing on ${interview.subDomain || 'general programming'} at the ${interview.difficulty || 'intermediate'} level.

The candidate's name is ${candidate.name}.

Below are the questions asked during the interview and the candidate's responses. Please provide:

1. A comprehensive evaluation of the candidate's technical skills
2. Strengths demonstrated in their answers
3. Areas for improvement
4. A score from 0-100 based on their performance
5. A recommendation on whether to proceed with this candidate

Questions and Answers:
`;

    // Add each question and response to the prompt
    let questionNumber = 1;
    questionResponseMap.forEach((response, question) => {
      promptText += `\nQuestion ${questionNumber}: ${question.content}\n`;
      promptText += `Question Type: ${question.type}\n`;
      if (question.correctAnswer) {
        promptText += `Expected Answer: ${question.correctAnswer}\n`;
      }
      promptText += `Candidate's Response: ${response ? response.content : "No answer provided"}\n`;
      questionNumber++;
    });

    promptText += `\nPlease format your feedback in a structured way with clear sections for each of the requested evaluation points. Make sure to include a numerical score between 0 and 100.`;

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

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
              parts: [{ text: promptText }]
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "AI API error", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate feedback.";

    // Extract score from feedback (assuming the AI includes a score in its response)
    let score = null;
    const scoreMatch = feedbackText.match(/score:?\s*(\d+)/i) || feedbackText.match(/(\d+)\s*\/\s*100/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
      if (isNaN(score) || score < 0 || score > 100) {
        score = null;
      }
    }

    // In a real application, you would update the interview in your database
    // For this demo, we'll just create an updated object
    const updatedInterview = {
      ...interview,
      feedback: feedbackText,
      score: score,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      message: "Feedback generated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
