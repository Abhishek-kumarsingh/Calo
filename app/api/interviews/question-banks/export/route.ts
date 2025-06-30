import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import QuestionBankModel from "@/lib/models/QuestionBank";
import { PDFExportService } from "@/lib/services/pdfExportService";

export async function GET(req: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    const includeAnswers = url.searchParams.get("includeAnswers") === "true";
    const questionId = url.searchParams.get("questionId");
    
    // Connect to the database
    await connectToDatabase();
    
    // If questionId is provided, export a single question
    if (questionId) {
      const question = await QuestionBankModel.findById(questionId);
      
      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 }
        );
      }
      
      // Generate PDF for the single question
      const pdfBlob = await PDFExportService.generateSingleQuestionPDF(question);
      
      // Convert blob to buffer
      const buffer = await pdfBlob.arrayBuffer();
      
      // Return the PDF
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="question_${questionId}.pdf"`,
        },
      });
    }
    
    // Otherwise, export questions by domain
    let query: any = {};
    
    // Filter by domain if provided
    if (domain && domain !== "all") {
      query.domain = domain;
    }
    
    // Get questions from the database
    const questions = await QuestionBankModel.find(query).sort({ createdAt: -1 });
    
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found" },
        { status: 404 }
      );
    }
    
    // Generate PDF
    const pdfBlob = await PDFExportService.generateQuestionBankPDF(
      questions,
      domain || "All Domains",
      includeAnswers
    );
    
    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer();
    
    // Return the PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${domain || "all"}_questions.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting questions to PDF:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
