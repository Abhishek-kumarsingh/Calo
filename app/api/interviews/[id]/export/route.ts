import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import InterviewModel from "@/lib/models/Interview";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const includeAnswers = url.searchParams.get("includeAnswers") === "true";
    const includeFeedback = url.searchParams.get("includeFeedback") === "true";
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the interview
    const interview = await InterviewModel.findById(params.id);
    
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this interview
    if (interview.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to access this interview" },
        { status: 403 }
      );
    }
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Interview: ${interview.title || interview.domain + ' Interview'}`, 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Domain: ${interview.domain}`, 14, 32);
    doc.text(`Sub-domain: ${interview.subDomain || 'General'}`, 14, 37);
    doc.text(`Level: ${interview.level}`, 14, 42);
    doc.text(`Date: ${interview.createdAt.toLocaleDateString()}`, 14, 47);
    
    // Add overall score if available
    if (interview.score !== undefined && interview.score !== null) {
      doc.text(`Overall Score: ${interview.score}/100`, 14, 52);
    }
    
    let yPosition = 60;
    
    // Add overall feedback if available and requested
    if (interview.overallFeedback && includeFeedback) {
      doc.setFontSize(14);
      doc.text('Overall Feedback:', 14, yPosition);
      
      yPosition += 10;
      
      // Split feedback into paragraphs
      const feedbackParagraphs = interview.overallFeedback.split('\n');
      
      doc.setFontSize(10);
      for (const paragraph of feedbackParagraphs) {
        if (paragraph.trim() === '') continue;
        
        // Split long paragraph into multiple lines
        const lines = doc.splitTextToSize(paragraph, 180);
        
        // Check if we need to add a new page
        if (yPosition + (lines.length * 7) > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(lines, 14, yPosition);
        yPosition += (lines.length * 7) + 5;
      }
      
      yPosition += 10;
    }
    
    // Add questions and answers if available
    if (interview.questions && interview.questions.length > 0) {
      // Check if we need to add a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Questions & Answers:', 14, yPosition);
      
      yPosition += 10;
      
      // Prepare table data
      const tableData = interview.questions.map((q, index) => {
        const row = [
          (index + 1).toString(),
          q.question
        ];
        
        // Add answer column if includeAnswers is true
        if (includeAnswers) {
          row.push(q.answer || 'No answer provided');
        }
        
        // Add feedback column if includeFeedback is true
        if (includeFeedback) {
          row.push(q.feedback || 'No feedback available');
        }
        
        return row;
      });
      
      // Define table headers
      const headers = ['#', 'Question'];
      if (includeAnswers) {
        headers.push('Answer');
      }
      if (includeFeedback) {
        headers.push('Feedback');
      }
      
      // Generate the table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 10 }, // # column
          1: { cellWidth: 70 }, // Question column
          2: includeAnswers ? { cellWidth: 50 } : {}, // Answer column (if included)
          3: includeFeedback ? { cellWidth: 50 } : {} // Feedback column (if included)
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: 255,
          fontStyle: 'bold',
        },
        didDrawPage: (data) => {
          // Add footer with page numbers
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
              `Page ${i} of ${pageCount} - Aithor Interview Export`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        },
      });
    }
    
    // Convert PDF to buffer
    const pdfBuffer = await doc.output('arraybuffer');
    
    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="interview_${params.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting interview to PDF:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
