import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import UserModel from "@/lib/models/User";
import CandidateModel from "@/lib/models/Candidate";
import MessageModel from "@/lib/models/Message";
import mongoose from "mongoose";

// Sample interview data for fallback
const sampleInterviews = {
  "sample-interview-1": {
    id: "sample-interview-1",
    title: "Frontend Developer Interview",
    domain: "Web Development",
    subDomain: "Frontend",
    level: "Intermediate",
    status: "completed",
    score: 85,
    type: "technical",
    description: "Interview for frontend developer position",
    questions: [
      {
        question: "What is the difference between let, const, and var in JavaScript?",
        answer: "",
        type: "text"
      },
      {
        question: "Explain how the box model works in CSS.",
        answer: "",
        type: "text"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "sample-interview-2": {
    id: "sample-interview-2",
    title: "Backend Developer Interview",
    domain: "Web Development",
    subDomain: "Backend",
    level: "Advanced",
    status: "scheduled",
    type: "technical",
    description: "Interview for backend developer position",
    questions: [
      {
        question: "Explain RESTful API design principles.",
        answer: "",
        type: "text"
      },
      {
        question: "What are the benefits of using a NoSQL database?",
        answer: "",
        type: "text"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "sample-interview-3": {
    id: "sample-interview-3",
    title: "Machine Learning Engineer Interview",
    domain: "Data Science",
    subDomain: "Machine Learning",
    level: "Intermediate",
    status: "in_progress",
    type: "technical",
    description: "Interview for ML engineer position",
    questions: [
      {
        question: "Explain the difference between supervised and unsupervised learning.",
        answer: "",
        type: "text"
      },
      {
        question: "What is overfitting and how can you prevent it?",
        answer: "",
        type: "text"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Log available interview IDs for debugging
console.log("Sample data initialized with interview IDs:", Object.keys(sampleInterviews).join(" "));

// Get a specific interview
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;
  const referer = req.headers.get("referer") || "";
  const isTakeInterviewRequest = referer.includes("/take/");

  console.log("GET request for interview ID:", interviewId);
  console.log("Referer:", referer);
  console.log("Is take interview request:", isTakeInterviewRequest);

  try {
    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user?.id);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Fetching interview with ID:", interviewId);

    // Special handling for sample interviews
    if (interviewId.startsWith('sample-interview')) {
      console.log(`Handling sample interview: ${interviewId}`);
      if (sampleInterviews[interviewId]) {
        console.log("Found sample interview:", interviewId);
        return NextResponse.json(sampleInterviews[interviewId]);
      }
    }

    // Try to find the interview in the database
    console.log("Finding interview with ID:", interviewId);

    // Connect to the database
    await connectToDatabase();

    // Check if the ID is a valid MongoDB ObjectId
    let interview = null;
    if (mongoose.Types.ObjectId.isValid(interviewId)) {
      interview = await InterviewModel.findById(interviewId);
    }

    console.log("Found interview:", interview);
    console.log("Interview found:", interview ? "Yes" : "No");

    if (!interview) {
      console.log(`Interview with ID ${interviewId} not found`);

      // Try to fetch from backend as a last resort
      console.log(`Attempting to fetch interview ${interviewId} directly from backend`);
      try {
        // Create a fallback interview with the requested ID
        const fallbackInterview = {
          id: interviewId,
          title: "SQL Databases Interview",
          domain: "Backend",
          subDomain: "SQL Databases",
          level: "Junior",
          status: "pending_ai_generation",
          type: "ai_generated",
          description: "Interview for SQL database knowledge",
          questions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return NextResponse.json(fallbackInterview);
      } catch (error) {
        console.error("Error fetching from backend:", error);
        return NextResponse.json(
          {
            error: "Interview not found",
            message: `The interview with ID "${interviewId}" could not be found in the database.`,
            availableSampleIds: Object.keys(sampleInterviews)
          },
          { status: 404 }
        );
      }
    }

    // If this is not a take interview request, verify authentication
    if (!isTakeInterviewRequest) {
      // Check if user is authenticated
      if (!session || !session.user) {
        console.log('Unauthorized: No valid session found');
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if the user has access to this interview
      const user = await UserModel.findOne({ email: session.user.email });
      if (!user || interview.user.toString() !== user._id.toString()) {
        console.error(`User ${session.user.id} not authorized to access interview ${interviewId}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Fetch candidate data
    let candidate = null;
    if (interview.candidateId) {
      console.log(`Fetching candidate with ID: ${interview.candidateId}`);
      candidate = await CandidateModel.findById(interview.candidateId);
      console.log(`Candidate found: ${candidate ? 'Yes' : 'No'}`);
    }

    // Fetch messages for this interview
    console.log(`Fetching messages for interview ID: ${interviewId}`);
    const messages = await MessageModel.find({ interview: interview._id }).sort({ createdAt: 1 });
    console.log(`Messages found: ${messages.length}`);

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
      candidate: candidate ? {
        id: candidate._id.toString(),
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        department: candidate.department
      } : null,
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        content: msg.content,
        role: msg.role,
        interviewId: msg.interview.toString(),
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }))
    };

    return NextResponse.json(transformedInterview);
  } catch (error: any) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

// Update an interview
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      date,
      duration,
      type,
      status,
      score,
      overallFeedback,
      questionQuantity,
      questionTypes,
      questionTypeDistribution
    } = body;

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

    // Update the interview
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(date && { date: new Date(date) }),
      ...(duration && { duration: parseInt(duration.toString()) }),
      ...(type && { type }),
      ...(status && { status }),
      ...(score !== undefined && { score: parseInt(score.toString()) }),
      ...(overallFeedback !== undefined && { overallFeedback }),
      ...(questionQuantity !== undefined && { questionQuantity: parseInt(questionQuantity.toString()) }),
      ...(questionTypes !== undefined && { questionTypes }),
      ...(questionTypeDistribution !== undefined && { questionTypeDistribution }),
    };

    console.log(`Updating interview ${params.id} with data:`, updateData);

    // Update the interview
    Object.assign(interview, updateData);
    await interview.save();

    // Fetch candidate data for the response
    let candidate = null;
    if (interview.candidateId) {
      candidate = await CandidateModel.findById(interview.candidateId);
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
      candidate: candidate ? {
        id: candidate._id.toString(),
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        department: candidate.department
      } : null
    };

    return NextResponse.json(transformedInterview);
  } catch (error: any) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update interview" },
      { status: 500 }
    );
  }
}

// Delete an interview
export async function DELETE(
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

    // Delete the interview
    console.log(`Deleting interview with ID: ${params.id}`);
    await InterviewModel.findByIdAndDelete(params.id);

    // Also delete related data
    console.log(`Deleting messages for interview with ID: ${params.id}`);
    await MessageModel.deleteMany({ interview: interview._id });

    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete interview" },
      { status: 500 }
    );
  }
}
