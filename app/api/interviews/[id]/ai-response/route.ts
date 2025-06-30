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
    const { userMessage } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }

    // Fetch the interview from our database
    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // In a real app, we would fetch candidate and messages data
    // For now, we'll use empty data
    interview.candidate = {
      id: "candidate-id",
      name: "Candidate",
      email: "candidate@example.com",
      role: "Developer",
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    interview.messages = [];

    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Save the user message
    const savedUserMessage = await db.createMessage({
      content: userMessage,
      role: "user",
      interviewId: params.id,
    });

    // Prepare context for AI
    const messageHistory = interview.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message to the history
    messageHistory.push({
      role: "user",
      content: userMessage,
    });

    // Create a prompt for the AI
    const prompt = `
You are an AI interviewer conducting a ${interview.type} interview for a ${interview.candidate.role || "professional"} position.
The candidate's name is ${interview.candidate.name}.

Based on the conversation history and the candidate's latest response, provide a thoughtful follow-up question or comment.
Keep your response concise, professional, and focused on evaluating the candidate's skills and experience.

If this is nearing the end of the interview (after about 8-10 exchanges), consider wrapping up with a final question or a thank you message.
`;

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
              parts: [
                { text: prompt },
                { text: "Conversation history:\n" + messageHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n") }
              ],
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
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that. Can you tell me more?";

    // Save the AI response
    const savedAiMessage = await db.createMessage({
      content: aiResponseText,
      role: "assistant",
      interviewId: params.id,
    });

    return NextResponse.json({
      userMessage: savedUserMessage,
      aiResponse: savedAiMessage,
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
