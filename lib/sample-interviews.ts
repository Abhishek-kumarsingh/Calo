/**
 * Sample Interviews Utility
 * 
 * This file provides utilities for creating and managing sample interviews.
 * It ensures that sample interviews are always available for demonstration purposes.
 */

import { db } from '@/lib/db';

/**
 * Ensures that a sample interview exists with the given ID
 * If the interview doesn't exist, it creates it with predefined data
 */
export async function ensureSampleInterview(id: string, userId: string = 'admin-1') {
  console.log(`Ensuring sample interview exists: ${id}`);
  
  // Check if the interview already exists
  const existingInterview = await db.findInterviewById(id);
  if (existingInterview) {
    console.log(`Sample interview ${id} already exists`);
    return existingInterview;
  }
  
  console.log(`Creating sample interview: ${id}`);
  
  // Determine interview properties based on ID
  const isFirstSample = id === 'sample-interview-1';
  const isSecondSample = id === 'sample-interview-2';
  const isThirdSample = id === 'sample-interview-3';
  
  // Create a sample candidate
  const candidateName = isFirstSample ? 'John Doe' : 
                        isSecondSample ? 'Jane Smith' : 'Alex Johnson';
  
  const candidateRole = isFirstSample ? 'Frontend Developer' : 
                        isSecondSample ? 'Backend Developer' : 'Full Stack Developer';
  
  const sampleCandidate = await db.createCandidate({
    name: candidateName,
    email: `${id}@example.com`,
    phone: "555-123-4567",
    role: candidateRole,
    department: "Engineering",
    userId: userId,
  });
  
  // Create the sample interview
  const domain = isFirstSample ? 'frontend' : 
                isSecondSample ? 'backend' : 'fullstack';
  
  const subDomain = isFirstSample ? 'react' : 
                   isSecondSample ? 'nodejs' : 'javascript';
  
  const status = isThirdSample ? 'completed' : 'scheduled';
  
  const interview = await db.createInterview({
    id: id,
    duration: 60,
    status: status,
    type: "technical",
    domain: domain,
    subDomain: subDomain,
    difficulty: "intermediate",
    score: isThirdSample ? 85 : null,
    overallFeedback: isThirdSample ? 
      `${candidateName} demonstrated strong knowledge of both frontend and backend technologies. Their ${subDomain} skills are excellent, and they have a good understanding of software architecture. They could improve on database optimization techniques and advanced state management patterns. Overall, a strong candidate who would be a valuable addition to the team.` : 
      null,
    userId: userId,
    candidateId: sampleCandidate.id,
  });
  
  // Create a welcome message
  await db.createMessage({
    content: `Welcome to your ${domain} developer interview!`,
    role: "system",
    interviewId: interview.id,
  });
  
  // Create sample questions
  await createSampleQuestions(interview.id, domain, subDomain);
  
  console.log(`Sample interview ${id} created successfully`);
  return interview;
}

/**
 * Creates sample questions for an interview based on domain and subdomain
 */
async function createSampleQuestions(interviewId: string, domain: string, subDomain: string) {
  const questions = [];
  
  // Common questions for all domains
  questions.push({
    content: "Describe your approach to debugging a complex issue.",
    type: "text",
    correctAnswer: "Open-ended question about debugging methodology",
    domain: "general",
    subDomain: null,
    difficulty: "intermediate",
    interviewId: interviewId,
  });
  
  // Domain-specific questions
  if (domain === 'frontend') {
    questions.push(
      {
        content: "Explain the difference between React's functional components and class components.",
        type: "text",
        correctAnswer: "Functional components are simpler, use hooks for state and lifecycle, and are the recommended approach. Class components use this keyword, lifecycle methods, and are more verbose.",
        domain: "frontend",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: interviewId,
      },
      {
        content: "What is the virtual DOM in React and how does it work?",
        type: "text",
        correctAnswer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to improve performance by minimizing direct DOM manipulation.",
        domain: "frontend",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: interviewId,
      }
    );
  } else if (domain === 'backend') {
    questions.push(
      {
        content: "Explain the event loop in Node.js and how it enables non-blocking I/O operations.",
        type: "text",
        correctAnswer: "The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It works by offloading operations to the system kernel whenever possible and executing callbacks when operations complete.",
        domain: "backend",
        subDomain: "nodejs",
        difficulty: "intermediate",
        interviewId: interviewId,
      },
      {
        content: "What are the differences between SQL and NoSQL databases? When would you choose one over the other?",
        type: "text",
        correctAnswer: "SQL databases are relational, table-based, and use structured query language. NoSQL databases are non-relational, document-based, and have flexible schemas.",
        domain: "backend",
        subDomain: "databases",
        difficulty: "intermediate",
        interviewId: interviewId,
      }
    );
  } else if (domain === 'fullstack') {
    questions.push(
      {
        content: "Explain how React's Context API works and when you would use it instead of Redux.",
        type: "text",
        correctAnswer: "Context API provides a way to pass data through the component tree without having to pass props down manually at every level. It's useful for sharing data that can be considered 'global' for a tree of React components.",
        domain: "fullstack",
        subDomain: "react",
        difficulty: "intermediate",
        interviewId: interviewId,
      },
      {
        content: "Describe your approach to handling authentication in a full stack application.",
        type: "text",
        correctAnswer: "A comprehensive approach would include secure password storage (hashing with bcrypt), JWT or session-based authentication, HTTPS, CSRF protection, and proper authorization checks on both client and server sides.",
        domain: "fullstack",
        subDomain: "security",
        difficulty: "intermediate",
        interviewId: interviewId,
      }
    );
  }
  
  // Create all questions in the database
  for (const questionData of questions) {
    await db.createQuestion(questionData);
  }
  
  console.log(`Created ${questions.length} sample questions for interview ${interviewId}`);
}
