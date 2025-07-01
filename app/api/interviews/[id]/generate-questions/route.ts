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

    // Fetch the interview
    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      console.error(`Interview with ID ${params.id} not found`);
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Check authorization
    if (interview.userId !== session.user.id) {
      console.error(`User ${session.user.id} not authorized to access interview ${params.id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the domain, subdomain, level, and question settings from the interview
    const domain = interview.domain;
    const subDomain = interview.subDomain;
    const level = interview.level;

    // Ensure we respect the user's selected question quantity (default to 5 only if not specified)
    const questionQuantity = interview.questionQuantity || 5;
    console.log(`Using question quantity from interview settings: ${questionQuantity}`);

    const questionTypes = interview.questionTypes || { text: true, multipleChoice: false, coding: false, codeCorrection: false };
    const questionTypeDistribution = interview.questionTypeDistribution || { text: 100, multipleChoice: 0, coding: 0, codeCorrection: 0 };

    // Log the question configuration for debugging
    console.log(`Question configuration:
      - Quantity: ${questionQuantity}
      - Types: ${JSON.stringify(questionTypes)}
      - Distribution: ${JSON.stringify(questionTypeDistribution)}
    `);

    console.log(`Generating ${questionQuantity} questions for domain: ${domain}, subdomain: ${subDomain}, level: ${level}`);
    console.log(`Question types:`, questionTypes);
    console.log(`Question type distribution:`, questionTypeDistribution);

    let questionsData: any[] = [];
    let useGeminiAPI = true;

    // Try to generate questions using Gemini API
    if (useGeminiAPI) {
      try {
        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          console.error("Gemini API key not configured");
          throw new Error("API key not configured");
        }

        // Create a prompt for Gemini API based on domain, subdomain, level, and question settings
        // Determine question type instructions based on enabled types
        const typeInstructions = [];
        if (questionTypes.text) typeInstructions.push("text-based conceptual questions");
        if (questionTypes.multipleChoice) typeInstructions.push("multiple-choice questions with 4 options (A, B, C, D) and a correct answer");
        if (questionTypes.coding) typeInstructions.push("coding challenges with problem statements and examples");
        if (questionTypes.codeCorrection) typeInstructions.push("code correction questions with buggy code snippets to fix");

        const typeInstruction = typeInstructions.length > 0
          ? `Include the following types of questions based on this distribution: ${typeInstructions.join(", ")}.`
          : "Include a mix of question types (conceptual, problem-solving, etc.).";

        const promptText = `
You are an expert technical interviewer creating questions for a ${domain} developer position with a focus on ${subDomain}. The candidate's skill level is ${level}.

Please generate EXACTLY ${questionQuantity} interview questions that are appropriate for this position and skill level. I need precisely ${questionQuantity} questions, no more and no less. For each question:
1. Make sure it's relevant to the ${domain} domain and specifically to ${subDomain}
2. Ensure the difficulty is appropriate for a ${level} level developer
3. ${typeInstruction}

IMPORTANT: You must generate EXACTLY ${questionQuantity} questions as requested.

Format your response as a JSON array with the following structure for each question:
[
  {
    "question": "Question text here",
    "answer": "",
    "feedback": ""
  },
  // more questions...
]

Make sure your response is valid JSON that can be parsed directly.
`;

        console.log("Sending prompt to Gemini API:", promptText);

        // Call Gemini API
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
          console.error("Gemini API error:", errorData);
          throw new Error("Failed to generate questions from AI");
        }

        const data = await response.json();
        const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponseText) {
          throw new Error("Empty response from AI");
        }

        console.log("AI response received:", aiResponseText);

        // Extract JSON from the response
        // The AI might include markdown code blocks or other text, so we need to extract just the JSON part
        const jsonMatch = aiResponseText.match(/\[\s*\{.*\}\s*\]/s);

        if (!jsonMatch) {
          throw new Error("Could not extract valid JSON from AI response");
        }

        try {
          // Parse the JSON
          questionsData = JSON.parse(jsonMatch[0]);
          console.log("Parsed questions:", questionsData);

          // Validate the questions format
          if (!Array.isArray(questionsData) || questionsData.length === 0) {
            throw new Error("Invalid questions format");
          }

          // Ensure each question has the required fields
          const currentTime = new Date().toISOString();
          questionsData = questionsData.map(q => ({
            question: q.question,
            answer: "",
            feedback: "",
            createdAt: currentTime
          }));

        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          throw new Error("Failed to parse AI-generated questions");
        }
      } catch (aiError) {
        console.error("Error using Gemini API:", aiError);

        // Fall back to predefined questions
        console.log("Falling back to predefined questions");
        useGeminiAPI = false;
      }
    }

    // If Gemini API failed or returned invalid data, use fallback questions
    if (!useGeminiAPI || questionsData.length === 0) {
      console.log("Using fallback questions");

      // Create fallback questions based on domain, subDomain and level
      const currentTime = new Date().toISOString();
      const fallbackQuestions = [
        {
          question: `What are the key principles of ${subDomain} development in ${domain}?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `Explain how you would implement a ${subDomain} solution for a common ${domain} problem.`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What are the best practices for ${level} ${subDomain} development?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How would you debug a complex issue in a ${domain} application?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `Describe your experience with ${subDomain} frameworks and libraries.`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What are the most important performance considerations for ${domain} applications?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How do you approach testing in ${subDomain} development?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What are the security best practices in ${domain} development?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How do you stay updated with the latest trends in ${subDomain}?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `Describe a challenging ${domain} project you've worked on and how you overcame the difficulties.`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What tools and technologies do you use for ${subDomain} development?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How would you optimize a slow ${domain} application?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What version control practices do you follow in your ${domain} projects?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How do you handle error handling and logging in ${subDomain} applications?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `Explain your approach to code reviews in ${domain} development.`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What are the challenges of scaling ${subDomain} applications?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How do you ensure accessibility in your ${domain} applications?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What's your experience with CI/CD pipelines for ${subDomain} projects?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `How do you handle internationalization in ${domain} applications?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        },
        {
          question: `What metrics do you track to ensure the quality of your ${subDomain} code?`,
          answer: "",
          feedback: "",
          createdAt: currentTime
        }
      ];

      // Take only the number of questions requested (or all if fewer are available)
      questionsData = fallbackQuestions.slice(0, questionQuantity);
    }

    // Ensure we have the requested number of questions (up to the configured quantity)
    if (questionsData.length > questionQuantity) {
      console.log(`Received ${questionsData.length} questions but only requested ${questionQuantity}, trimming excess questions`);
      questionsData = questionsData.slice(0, questionQuantity);
    } else if (questionsData.length < questionQuantity) {
      console.log(`Warning: Received only ${questionsData.length} questions but requested ${questionQuantity}`);

      // If we have at least one question, duplicate to meet the requirement
      if (questionsData.length > 0) {
        console.log(`Duplicating questions to meet the required count of ${questionQuantity}`);

        // Duplicate questions if needed to reach the required count
        while (questionsData.length < questionQuantity) {
          const originalQuestion = questionsData[questionsData.length % questionsData.length];
          questionsData.push({
            question: `${originalQuestion.question} (variation ${Math.floor(Math.random() * 1000)})`,
            answer: "",
            feedback: "",
            createdAt: new Date().toISOString()
          });
        }

        console.log(`After duplication: ${questionsData.length} questions`);
      }
    } else {
      console.log(`Successfully received exactly ${questionQuantity} questions as requested`);
    }

    console.log(`Updating interview with ${questionsData.length} questions`);

    // Update the interview with the generated questions
    const updatedInterview = await db.updateInterview(params.id, {
      questions: questionsData
    });

    return NextResponse.json({
      message: "Questions generated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Error generating questions:", error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate questions",
        message: errorMessage,
        details: "There was an error generating questions for this interview. Please try again or contact support if the issue persists."
      },
      { status: 500 }
    );
  }
}
