import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import mongoose from "mongoose";
import { generateAIContent, parseJsonFromAIResponse } from "@/lib/services/aiService";
import { QuestionBankService } from "@/lib/services/questionBankService";

// Define interfaces for question types and distribution
interface QuestionTypes {
  text: boolean;
  multipleChoice: boolean;
  coding: boolean;
  codeCorrection: boolean;
  [key: string]: boolean; // Index signature to allow string indexing
}

interface QuestionTypeDistribution {
  text: number;
  multipleChoice: number;
  coding: number;
  codeCorrection: number;
  [key: string]: number; // Index signature to allow string indexing
}

// Function to generate AI questions
async function generateQuestionsWithAI(
  domain: string,
  subDomain: string,
  level: string,
  numQuestions: number = 5,
  questionTypes?: QuestionTypes,
  questionTypeDistribution?: QuestionTypeDistribution
) {
  try {
    console.log(`Generating ${numQuestions} questions for ${domain}/${subDomain} at ${level} level`);

    // Determine question type distribution
    let typeDistribution = '';

    if (questionTypes && questionTypeDistribution) {
      // Build a string describing the distribution of question types
      const enabledTypes: string[] = [];
      const exactCounts: Record<string, number> = {
        text: 0,
        multipleChoice: 0,
        coding: 0,
        codeCorrection: 0
      };
      let totalAllocated = 0;

      console.log(`Calculating distribution for ${numQuestions} questions with types:`, questionTypes);
      console.log(`Distribution percentages:`, questionTypeDistribution);

      // Calculate exact counts for each type
      if (questionTypes.text && questionTypeDistribution.text > 0) {
        const count = Math.floor((questionTypeDistribution.text / 100) * numQuestions);
        exactCounts.text = count;
        totalAllocated += count;
        enabledTypes.push(`${count} text questions (open-ended questions)`);
        console.log(`Allocated ${count} text questions (${questionTypeDistribution.text}%)`);
      }

      if (questionTypes.multipleChoice && questionTypeDistribution.multipleChoice > 0) {
        const count = Math.floor((questionTypeDistribution.multipleChoice / 100) * numQuestions);
        exactCounts.multipleChoice = count;
        totalAllocated += count;
        enabledTypes.push(`${count} multiple-choice questions (with 4 options each)`);
        console.log(`Allocated ${count} multiple-choice questions (${questionTypeDistribution.multipleChoice}%)`);
      }

      if (questionTypes.coding && questionTypeDistribution.coding > 0) {
        const count = Math.floor((questionTypeDistribution.coding / 100) * numQuestions);
        exactCounts.coding = count;
        totalAllocated += count;
        enabledTypes.push(`${count} coding questions (programming problems)`);
        console.log(`Allocated ${count} coding questions (${questionTypeDistribution.coding}%)`);
      }

      if (questionTypes.codeCorrection && questionTypeDistribution.codeCorrection > 0) {
        const count = Math.floor((questionTypeDistribution.codeCorrection / 100) * numQuestions);
        exactCounts.codeCorrection = count;
        totalAllocated += count;
        enabledTypes.push(`${count} code correction questions (fixing bugs in code)`);
        console.log(`Allocated ${count} code correction questions (${questionTypeDistribution.codeCorrection}%)`);
      }

      // Distribute any remaining questions due to rounding
      let remaining = numQuestions - totalAllocated;
      console.log(`After initial allocation, ${remaining} questions remain to be distributed`);

      // Prioritize types in order of their percentage
      const typesByPriority = Object.entries(questionTypeDistribution)
        .filter(([type, percentage]) => questionTypes[type] && percentage > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([type]) => type);

      console.log(`Types by priority for remaining distribution:`, typesByPriority);

      // Distribute remaining questions
      let i = 0;
      while (remaining > 0 && typesByPriority.length > 0) {
        const type = typesByPriority[i % typesByPriority.length];
        exactCounts[type]++;
        remaining--;
        i++;
        console.log(`Allocated 1 additional ${type} question (${remaining} remaining)`);
      }

      // Update the enabledTypes array with the adjusted counts
      enabledTypes.length = 0;
      if (exactCounts.text) {
        enabledTypes.push(`${exactCounts.text} text questions (open-ended questions)`);
      }
      if (exactCounts.multipleChoice) {
        enabledTypes.push(`${exactCounts.multipleChoice} multiple-choice questions (with 4 options each)`);
      }
      if (exactCounts.coding) {
        enabledTypes.push(`${exactCounts.coding} coding questions (programming problems)`);
      }
      if (exactCounts.codeCorrection) {
        enabledTypes.push(`${exactCounts.codeCorrection} code correction questions (fixing bugs in code)`);
      }

      // Log the final exact counts for debugging
      console.log(`Final question counts after distribution:`, exactCounts);

      if (enabledTypes.length > 0) {
        typeDistribution = `
        The questions MUST be distributed EXACTLY as follows:
        ${enabledTypes.join('\n        ')}

        For each question type:
        - text: Simple open-ended questions that require detailed explanations
        - multiple-choice: Questions with 4 options (A, B, C, D) where one is correct
        - coding: Programming problems that require writing code
        - code-correction: Snippets of code with bugs that need to be identified and fixed

        This distribution is mandatory and must be followed precisely.
        `;
      }
    }

    // Craft the prompt with explicit instruction to generate exactly the requested number and types
    const prompt = `Generate EXACTLY ${numQuestions} technical interview questions for a ${level} level ${domain} developer with focus on ${subDomain}.

    !!!CRITICAL REQUIREMENTS!!!
    1. You MUST generate EXACTLY ${numQuestions} questions total, no more and no less.
    2. You MUST follow the EXACT question type distribution specified below.
    3. Each question MUST have the correct "type" field matching its content.
    4. DO NOT DEVIATE from these requirements under any circumstances.

    ${typeDistribution}

    For each question:
    1. Make sure it's challenging but appropriate for the ${level} level
    2. Focus specifically on ${subDomain} within ${domain}
    3. Provide the question text only, no answers or explanations

    Format the response as a JSON array of objects with this structure:
    [
      {
        "question": "Question text here",
        "type": "text" // Use one of: "text", "multiple-choice", "coding", "code-correction"
      },
      ...
    ]

    For multiple-choice questions, include an "options" array with 4 options:
    {
      "question": "Multiple choice question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }

    For coding questions, include a clear problem statement:
    {
      "question": "Write a function that...",
      "type": "coding"
    }

    For code correction questions, include buggy code to fix:
    {
      "question": "Fix the bugs in the following code: [code snippet]",
      "type": "code-correction",
      "codeSnippet": "// Buggy code here"
    }

    The JSON array MUST contain EXACTLY ${numQuestions} question objects with the exact distribution specified.
    Return ONLY the JSON array, no other text.

    FINAL CHECK PROCEDURE:
    1. Count the total number of questions - it MUST be exactly ${numQuestions}
    2. Verify each question has the correct type field
    3. Verify the distribution matches exactly what was requested
    4. If any of these checks fail, fix your response before submitting

    This is a critical task where precision is required. The exact number and types of questions must be followed.`;

    // Use our new AI service to generate content
    // This will automatically handle load balancing between Gemini and Claude
    console.log("Generating questions using AI service");
    const text = await generateAIContent(prompt, {
      preferredProvider: "auto", // This will distribute between Gemini and Claude
      maxRetries: 3,
      initialDelay: 2000
    });

    if (!text) {
      throw new Error("Failed to generate content after multiple attempts");
    }

    // Parse the JSON response using our utility function
    try {
      const questions = parseJsonFromAIResponse(text);

      // Validate the structure
      if (!Array.isArray(questions)) {
        console.error("Parsed result is not an array:", questions);
        throw new Error("Response is not an array");
      }

      console.log(`Successfully parsed ${questions.length} questions`);

      // Validate that we have the correct number of questions
      if (questions.length !== numQuestions) {
        console.warn(`AI generated ${questions.length} questions, but ${numQuestions} were requested. Adjusting...`);

        // If we have too many questions, trim the excess
        if (questions.length > numQuestions) {
          questions = questions.slice(0, numQuestions);
        }
        // If we have too few questions, add generic ones to match the requested count
        else if (questions.length < numQuestions) {
          const missingCount = numQuestions - questions.length;
          for (let i = 0; i < missingCount; i++) {
            questions.push({
              question: `Additional question ${i+1} for ${subDomain} (${level} level): Explain a key concept in ${subDomain} that's important for ${level} developers.`,
              type: "text"
            });
          }
        }
      }

      // Validate question type distribution if specified
      if (questionTypes && questionTypeDistribution) {
        const typeCounts: Record<string, number> = {
          text: 0,
          multipleChoice: 0,
          coding: 0,
          codeCorrection: 0
        };

        // Count current distribution
        questions.forEach(q => {
          const qType = q.type as string;
          if (typeCounts[qType] !== undefined) {
            typeCounts[qType]++;
          } else {
            // Default to text for unknown types
            typeCounts.text++;
          }
        });

        // Calculate expected counts
        const expectedCounts: Record<string, number> = {
          text: 0,
          multipleChoice: 0,
          coding: 0,
          codeCorrection: 0
        };
        let totalAllocated = 0;

        Object.entries(questionTypeDistribution).forEach(([type, percentage]) => {
          if (questionTypes[type] && percentage > 0) {
            const count = Math.floor((percentage / 100) * numQuestions);
            expectedCounts[type] = count;
            totalAllocated += count;
          } else {
            expectedCounts[type] = 0;
          }
        });

        // Distribute remaining questions
        let remaining = numQuestions - totalAllocated;
        const typesByPriority = Object.entries(questionTypeDistribution)
          .filter(([type, percentage]) => questionTypes[type] && percentage > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([type]) => type);

        let i = 0;
        while (remaining > 0 && typesByPriority.length > 0) {
          const type = typesByPriority[i % typesByPriority.length];
          expectedCounts[type]++;
          remaining--;
          i++;
        }

        // Adjust questions to match expected distribution
        for (const type in expectedCounts) {
          const diff = expectedCounts[type] - typeCounts[type];

          if (diff > 0) {
            // Need to add more of this type
            for (let i = 0; i < diff; i++) {
              // Find a question of a type we have too many of
              let adjusted = false;
              for (let j = 0; j < questions.length; j++) {
                const otherType = questions[j].type;
                if (typeCounts[otherType] > expectedCounts[otherType]) {
                  // Change this question's type
                  questions[j].type = type;

                  // Add appropriate properties based on the new type
                  if (type === 'multiple-choice' && !questions[j].options) {
                    questions[j].options = [
                      "Option A - First possible answer",
                      "Option B - Second possible answer",
                      "Option C - Third possible answer",
                      "Option D - Fourth possible answer"
                    ];
                  } else if (type === 'code-correction' && !questions[j].codeSnippet) {
                    questions[j].codeSnippet = "// This is a sample code snippet with bugs\nfunction example() {\n  let result = [];\n  for (let i = 0; i < 10; i++) {\n    result[i] = i;\n  }\n  return results; // Bug: 'results' is undefined, should be 'result'\n}";
                  }

                  typeCounts[otherType]--;
                  typeCounts[type]++;
                  adjusted = true;
                  break;
                }
              }

              // If we couldn't find a question to adjust, create a new one
              if (!adjusted) {
                // Create a new question of the required type
                let newQuestion;
                if (type === 'text') {
                  newQuestion = {
                    question: `Additional ${type} question for ${subDomain}: Explain a key concept in ${subDomain} that's important for ${level} developers.`,
                    type: type
                  };
                } else if (type === 'multiple-choice') {
                  newQuestion = {
                    question: `Multiple choice question about ${subDomain}: Which of the following is true about ${subDomain}?`,
                    type: type,
                    options: [
                      "Option A - First possible answer",
                      "Option B - Second possible answer",
                      "Option C - Third possible answer",
                      "Option D - Fourth possible answer"
                    ]
                  };
                } else if (type === 'coding') {
                  newQuestion = {
                    question: `Write a function that solves a common ${subDomain} problem appropriate for ${level} level.`,
                    type: type
                  };
                } else if (type === 'code-correction') {
                  newQuestion = {
                    question: `Fix the bugs in the following ${subDomain} code:`,
                    type: type,
                    codeSnippet: "// This is a sample code snippet with bugs\nfunction example() {\n  let result = [];\n  for (let i = 0; i < 10; i++) {\n    result[i] = i;\n  }\n  return results; // Bug: 'results' is undefined, should be 'result'\n}"
                  };
                }

                // Replace a question of a type we have too many of
                for (let j = 0; j < questions.length; j++) {
                  const otherType = questions[j].type;
                  if (typeCounts[otherType] > expectedCounts[otherType]) {
                    questions[j] = newQuestion;
                    typeCounts[otherType]--;
                    typeCounts[type]++;
                    break;
                  }
                }
              }
            }
          }
        }

        // Log the final distribution
        console.log("Final question type distribution after adjustments:", typeCounts);
      }

      // Ensure each question has the required fields
      return questions.map(q => {
        // Basic validation
        if (!q.question) {
          console.warn("Question missing 'question' field:", q);
          q.question = "Missing question text";
        }

        // Create a properly formatted question object
        return {
          question: q.question,
          type: q.type || "text",
          options: q.options || [],
          correctOption: q.correctOption || null,
          codeSnippet: q.codeSnippet || "",
          answer: "",
          feedback: "",
          score: 0
        };
      });
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      console.error("Raw response:", text);

      // As a fallback, try to generate a simple array of text questions
      try {
        console.log("Attempting fallback question generation");

        // Split the text by newlines and look for numbered questions
        const lines = text.split('\n');
        const questions = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Look for patterns like "1.", "2.", "Question 1:", etc.
          if (/^(\d+[\.\)]|Question\s+\d+:)/.test(line) && line.length > 5) {
            // Remove the number/prefix and use as a question
            const questionText = line.replace(/^(\d+[\.\)]|Question\s+\d+:)\s*/, "").trim();
            if (questionText) {
              questions.push({
                question: questionText,
                type: "text",
                answer: "",
                feedback: "",
                score: 0
              });
            }
          }
        }

        // If we found at least some questions, return them
        if (questions.length > 0) {
          console.log(`Fallback generated ${questions.length} questions`);
          return questions;
        }
      } catch (fallbackError) {
        console.error("Fallback question generation failed:", fallbackError);
      }

      throw new Error("Failed to parse AI response: " + error.message);
    }
  } catch (error: any) {
    console.error("Error generating questions with AI:", error);
    throw error;
  }
}

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

    // Parse request body
    const body = await req.json();

    // Get the number of questions from the request body or use the interview's questionQuantity
    // Support both numQuestions (from frontend) and questionQuantity (from database model)
    let numQuestions = body.numQuestions || body.questionQuantity;
    let requestQuestionTypes = body.questionTypes;
    let requestQuestionTypeDistribution = body.questionTypeDistribution;

    // Log the requested parameters
    console.log(`Requested number of questions from API call: ${numQuestions}`);
    console.log(`Requested question types from API call:`, requestQuestionTypes);
    console.log(`Requested question type distribution from API call:`, requestQuestionTypeDistribution);

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

    // If numQuestions is not provided in the request, try to get it from the interview
    if (numQuestions === undefined || numQuestions === null) {
      if (interview.questionQuantity) {
        numQuestions = interview.questionQuantity;
        console.log(`Using interview's questionQuantity: ${numQuestions}`);
      } else {
        // Default to 5 if neither is available
        numQuestions = 5;
        console.log(`No question quantity specified, defaulting to: ${numQuestions}`);
      }
    } else {
      // Ensure numQuestions is a number
      numQuestions = Number(numQuestions);
      console.log(`Using explicitly requested question quantity: ${numQuestions}`);
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

    // Generate AI questions with retry mechanism
    console.log(`Generating AI questions for interview ${params.id}`);

    // Use question types and distribution from the request if provided, otherwise use from the interview
    // Check if requestQuestionTypes is explicitly provided (not undefined or null)
    const questionTypes = requestQuestionTypes !== undefined && requestQuestionTypes !== null
        ? requestQuestionTypes
        : interview.questionTypes;

    // Check if requestQuestionTypeDistribution is explicitly provided (not undefined or null)
    const questionTypeDistribution = requestQuestionTypeDistribution !== undefined && requestQuestionTypeDistribution !== null
        ? requestQuestionTypeDistribution
        : interview.questionTypeDistribution;

    console.log(`Final question types to be used:`, questionTypes);
    console.log(`Final question type distribution to be used:`, questionTypeDistribution);

    // Retry parameters
    const maxRetries = 3;
    const initialDelay = 3000; // 3 seconds
    let questions;
    let lastError;

    // Try to generate questions with retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries} to generate questions for interview ${params.id}`);

        questions = await generateQuestionsWithAI(
          interview.domain,
          interview.subDomain,
          interview.level,
          numQuestions,
          questionTypes,
          questionTypeDistribution
        );

        // If we got questions successfully, break out of the retry loop
        if (questions && questions.length > 0) {
          console.log(`Successfully generated ${questions.length} questions on attempt ${attempt}`);
          break;
        } else {
          throw new Error("No questions were generated");
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Error on attempt ${attempt} to generate questions:`, error.message);

        // If this is the last attempt, don't wait
        if (attempt >= maxRetries) {
          console.error(`All ${maxRetries} attempts to generate questions failed`);
          throw error;
        }

        // Calculate exponential backoff delay
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying question generation in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we still don't have questions after all retries, throw an error
    if (!questions || questions.length === 0) {
      throw lastError || new Error("Failed to generate questions after multiple attempts");
    }

    // Update the interview with the generated questions
    interview.questions = questions;
    interview.status = "in_progress";
    await interview.save();

    // Save questions to the question bank
    try {
      console.log(`Saving questions to question bank for interview ${params.id}`);
      await QuestionBankService.addInterviewQuestionsToBank(params.id, user._id.toString());
    } catch (error) {
      console.error("Error saving questions to question bank:", error);
      // Continue even if saving to question bank fails
    }

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
      updatedAt: interview.updatedAt,
      savedToQuestionBank: interview.savedToQuestionBank
    };

    return NextResponse.json({
      message: "AI questions generated successfully",
      interview: transformedInterview
    });
  } catch (error: any) {
    console.error("Error generating AI questions:", error);

    // Determine the appropriate error message and status code
    let errorMessage = "Failed to generate AI questions";
    let statusCode = 500;

    if (error.message) {
      // Check for specific error types to provide better error messages
      if (error.message.includes("overloaded") || error.message.includes("503") || error.message.includes("Service Unavailable")) {
        errorMessage = "The AI service is currently overloaded. Please try again in a few minutes.";
        statusCode = 503;
      } else if (error.message.includes("parse") || error.message.includes("JSON")) {
        errorMessage = "There was an issue processing the AI response. Please try again.";
        statusCode = 422;
      } else if (error.message.includes("timeout") || error.message.includes("timed out")) {
        errorMessage = "The request timed out. Please try again later.";
        statusCode = 504;
      } else {
        // Use the original error message if available
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}
