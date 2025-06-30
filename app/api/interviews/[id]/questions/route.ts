import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureSampleInterview } from "@/lib/sample-interviews";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET request for questions for interview ID: ${params.id}`);

  try {
    // Check if this is a request from the take interview page
    const referer = req.headers.get('referer') || '';
    console.log(`Referer: ${referer}`);
    const isTakeInterviewRequest = referer.includes(`/dashboard/interviews/${params.id}/take`);
    console.log(`Is take interview request: ${isTakeInterviewRequest}`);

    // Get session (if available)
    const session = await getServerSession(authOptions);
    console.log(`Session user: ${session?.user?.id || 'No session'}`);

    console.log(`Fetching interview with ID: ${params.id}`);
    let interview = await db.findInterviewById(params.id);
    console.log(`Interview found: ${interview ? 'Yes' : 'No'}`);

    // Special handling for sample interviews
    if (params.id.startsWith('sample-interview') && !interview) {
      console.log(`Handling sample interview: ${params.id}`);

      try {
        // Use our utility function to ensure the sample interview exists
        interview = await ensureSampleInterview(
          params.id,
          session?.user?.id || "admin-1"
        );
        console.log(`Sample interview ${params.id} was created`);
      } catch (error) {
        console.error(`Error ensuring sample interview ${params.id}:`, error);
      }
    }

    if (!interview) {
      console.error(`Interview with ID ${params.id} not found`);
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // If this is not a take interview request, verify authentication
    if (!isTakeInterviewRequest) {
      // Check if user is authenticated
      if (!session || !session.user) {
        console.log('Unauthorized: No valid session found');
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if the user has access to this interview
      if (interview.userId !== session.user.id) {
        console.error(`User ${session.user.id} not authorized to access interview ${params.id}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    console.log(`Fetching questions for interview ID: ${params.id}`);
    const questions = await db.findQuestionsByInterviewId(params.id);
    console.log(`Questions found: ${questions.length}`);

    // If no questions are found, create some default ones for sample interviews
    if (questions.length === 0 && params.id.startsWith('sample-interview')) {
      console.log(`Creating default questions for sample interview: ${params.id}`);

      const domain = interview.domain || 'general';
      const subDomain = interview.subDomain || null;

      // Create default questions based on domain
      const defaultQuestions = [];

      if (domain === 'frontend') {
        defaultQuestions.push(
          {
            content: "What is the difference between 'let', 'const', and 'var' in JavaScript?",
            type: "text",
            correctAnswer: "var is function-scoped, let and const are block-scoped. const cannot be reassigned.",
            domain: "frontend",
            difficulty: "basic",
            interviewId: params.id,
            subDomain: subDomain
          },
          {
            content: "Explain the concept of closures in JavaScript.",
            type: "text",
            correctAnswer: "A closure is a function that has access to its own scope, the outer function's variables, and global variables, even after the outer function has returned.",
            domain: "frontend",
            difficulty: "intermediate",
            interviewId: params.id,
            subDomain: subDomain
          }
        );

        if (subDomain === 'react') {
          defaultQuestions.push(
            {
              content: "What is the virtual DOM in React and why is it used?",
              type: "text",
              correctAnswer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to improve performance by minimizing direct DOM manipulation.",
              domain: "frontend",
              difficulty: "intermediate",
              interviewId: params.id,
              subDomain: "react"
            },
            {
              content: "Explain the difference between state and props in React.",
              type: "text",
              correctAnswer: "Props are passed to a component from its parent and are read-only. State is managed within the component and can be updated using setState().",
              domain: "frontend",
              difficulty: "intermediate",
              interviewId: params.id,
              subDomain: "react"
            }
          );
        }
      } else if (domain === 'backend') {
        defaultQuestions.push(
          {
            content: "What is the difference between SQL and NoSQL databases?",
            type: "text",
            correctAnswer: "SQL databases are relational, table-based, and use structured query language. NoSQL databases are non-relational, document-based, and have flexible schemas.",
            domain: "backend",
            difficulty: "basic",
            interviewId: params.id,
            subDomain: subDomain
          },
          {
            content: "Explain the concept of middleware in Express.js.",
            type: "text",
            correctAnswer: "Middleware functions are functions that have access to the request object, response object, and the next middleware function. They can execute code, modify request/response objects, end the request-response cycle, or call the next middleware.",
            domain: "backend",
            difficulty: "intermediate",
            interviewId: params.id,
            subDomain: subDomain
          }
        );

        if (subDomain === 'nodejs') {
          defaultQuestions.push(
            {
              content: "Explain the event loop in Node.js and how it enables non-blocking I/O operations.",
              type: "text",
              correctAnswer: "The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It works by offloading operations to the system kernel whenever possible and executing callbacks when operations complete.",
              domain: "backend",
              difficulty: "advanced",
              interviewId: params.id,
              subDomain: "nodejs"
            }
          );
        }
      } else if (domain === 'fullstack') {
        defaultQuestions.push(
          {
            content: "Explain how React's Context API works and when you would use it instead of Redux.",
            type: "text",
            correctAnswer: "Context API provides a way to pass data through the component tree without having to pass props down manually at every level. It's useful for sharing data that can be considered 'global' for a tree of React components. You might use Context instead of Redux for simpler applications where you don't need complex state management features like middleware, time-travel debugging, etc.",
            domain: "fullstack",
            difficulty: "intermediate",
            interviewId: params.id,
            subDomain: subDomain
          },
          {
            content: "Describe your approach to handling authentication in a full stack application.",
            type: "text",
            correctAnswer: "A comprehensive approach would include secure password storage (hashing with bcrypt), JWT or session-based authentication, HTTPS, CSRF protection, and proper authorization checks on both client and server sides.",
            domain: "fullstack",
            difficulty: "intermediate",
            interviewId: params.id,
            subDomain: subDomain
          }
        );
      }

      // Add a general question for all domains
      defaultQuestions.push({
        content: "How do you approach debugging a complex issue?",
        type: "text",
        correctAnswer: "Open-ended question about debugging methodology",
        domain: "general",
        difficulty: "intermediate",
        interviewId: params.id,
        subDomain: null
      });

      // Save the default questions to the database
      const savedQuestions = [];
      for (const questionData of defaultQuestions) {
        const question = await db.createQuestion(questionData);
        savedQuestions.push(question);
      }

      console.log(`Created ${savedQuestions.length} default questions`);
      return NextResponse.json(savedQuestions);
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
