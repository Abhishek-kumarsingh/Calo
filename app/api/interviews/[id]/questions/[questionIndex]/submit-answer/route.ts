import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; questionIndex: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Make a request to the backend to get the JWT token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        // Use a special flag to indicate this is a server-side request
        serverSideRequest: true,
      }),
    });

    let token;
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      token = tokenData.token;
    } else {
      console.error("Failed to get token from backend");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Parse the request body once
    const requestBody = await req.json();
    console.log(`Request body: ${JSON.stringify(requestBody)}`);

    // Declare response variable in the outer scope
    let response;

    try {
      // Forward the request to the backend server
      const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/interviews/${params.id}/questions/${params.questionIndex}/submit-answer`;

      console.log(`Forwarding request to: ${backendUrl}`);

      response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        let errorData;
        try {
          errorData = await response.json();
          console.error("Backend API error (JSON):", errorData);
        } catch (parseError) {
          // If not JSON, get text
          const errorText = await response.text();
          console.error("Backend API error (text):", errorText);
          errorData = { message: errorText };
        }

        // If interview not found, try to handle it locally
        if (response.status === 404 && errorData.message?.includes("Interview not found")) {
          // Try to get the interview from our database
          const interview = await db.findInterviewById(params.id);

          if (!interview) {
            return NextResponse.json(
              { error: "Interview not found" },
              { status: 404 }
            );
          }

          // Get the answer from the request body
          const { answer } = requestBody;

          // Update the answer in the interview
          const questionIndex = parseInt(params.questionIndex, 10);

          if (isNaN(questionIndex) || questionIndex < 0 ||
              !interview.questions || questionIndex >= interview.questions.length) {
            return NextResponse.json(
              { error: "Invalid question index" },
              { status: 400 }
            );
          }

          // Generate feedback using Gemini API
          const question = interview.questions[questionIndex].question;
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            console.error("Gemini API key not configured");
            return NextResponse.json(
              { error: "API key not configured" },
              { status: 500 }
            );
          }

          const prompt = `Evaluate this answer to the question: "${question}". The answer is: "${answer}". Provide constructive feedback for a ${interview.level || 'intermediate'} level ${interview.domain || 'technical'} developer focusing on ${interview.subDomain || 'general programming'}.`;

          const aiResponse = await fetch(
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

          if (!aiResponse.ok) {
            console.error("Gemini API error:", await aiResponse.text());
            return NextResponse.json(
              { error: "Failed to generate feedback" },
              { status: 500 }
            );
          }

          const aiData = await aiResponse.json();
          const feedback = aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
                          "Thank you for your answer.";

          // Update the interview with the answer and feedback
          const updatedQuestions = [...interview.questions];
          updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            answer,
            feedback
          };

          const updatedInterview = await db.updateInterview(params.id, {
            questions: updatedQuestions
          });

          return NextResponse.json({
            message: "Answer submitted and feedback generated.",
            question: updatedQuestions[questionIndex].question,
            answer: updatedQuestions[questionIndex].answer,
            feedback: updatedQuestions[questionIndex].feedback
          });
        }

        return NextResponse.json(
          { error: errorData.message || "Failed to submit answer" },
          { status: response.status }
        );
      }
    } catch (forwardError) {
      console.error("Error forwarding request:", forwardError);
      // Return a generic error since we couldn't process the request
      return NextResponse.json(
        { error: "Failed to process answer submission" },
        { status: 500 }
      );
    }

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return NextResponse.json(
        { message: "Answer submitted successfully" }
      );
    }
  } catch (error: any) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit answer" },
      { status: 500 }
    );
  }
}
