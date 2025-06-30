import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IQuestionBankItem } from '../models/QuestionBank';

/**
 * Service for exporting question bank items to PDF
 */
export class PDFExportService {
  /**
   * Generate a PDF from question bank items
   * @param questions The questions to include in the PDF
   * @param domain The domain of the questions
   * @param includeAnswers Whether to include answers in the PDF
   * @returns The generated PDF as a Blob
   */
  static async generateQuestionBankPDF(
    questions: IQuestionBankItem[],
    domain: string,
    includeAnswers: boolean = true
  ): Promise<Blob> {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${domain.toUpperCase()} Question Bank`, 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Questions: ${questions.length}`, 14, 35);
    
    // Prepare table data
    const tableData = questions.map((q, index) => {
      const row = [
        (index + 1).toString(),
        q.question,
        q.type,
        q.difficulty
      ];
      
      // Add answer column if includeAnswers is true
      if (includeAnswers) {
        if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
          // For multiple choice, show options and correct answer
          const options = q.options.map((opt, i) => 
            `${i === q.correctOption ? '✓ ' : ''}${i + 1}. ${opt}`
          ).join('\\n');
          row.push(options);
        } else if (q.type === 'coding' && q.codeSnippet) {
          // For coding questions, show code snippet
          row.push(q.codeSnippet);
        } else {
          // For text questions or if no specific answer format
          row.push('See detailed view');
        }
      }
      
      return row;
    });
    
    // Define table headers
    const headers = ['#', 'Question', 'Type', 'Difficulty'];
    if (includeAnswers) {
      headers.push('Answer');
    }
    
    // Generate the table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // # column
        1: { cellWidth: includeAnswers ? 70 : 100 }, // Question column
        2: { cellWidth: 20 }, // Type column
        3: { cellWidth: 20 }, // Difficulty column
        4: includeAnswers ? { cellWidth: 60 } : {} // Answer column (if included)
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
            `Page ${i} of ${pageCount} - Aithor Question Bank`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      },
    });
    
    // Return the PDF as a blob
    return doc.output('blob');
  }
  
  /**
   * Generate a PDF for a single question with detailed information
   * @param question The question to include in the PDF
   * @returns The generated PDF as a Blob
   */
  static async generateSingleQuestionPDF(question: IQuestionBankItem): Promise<Blob> {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Question Details: ${question.domain} - ${question.subDomain || 'General'}`, 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Type: ${question.type}`, 14, 30);
    doc.text(`Difficulty: ${question.difficulty}`, 14, 35);
    
    // Add question
    doc.setFontSize(12);
    doc.text('Question:', 14, 45);
    
    // Split long question text into multiple lines
    const questionLines = doc.splitTextToSize(question.question, 180);
    doc.text(questionLines, 14, 55);
    
    let yPosition = 55 + (questionLines.length * 7);
    
    // Add answer section based on question type
    if (question.type === 'multiple-choice' && question.options && question.options.length > 0) {
      // For multiple choice, show options and correct answer
      doc.setFontSize(12);
      doc.text('Options:', 14, yPosition + 10);
      
      yPosition += 20;
      
      question.options.forEach((option, index) => {
        const isCorrect = index === question.correctOption;
        doc.setFontSize(10);
        if (isCorrect) {
          doc.setTextColor(0, 128, 0); // Green for correct answer
        }
        doc.text(`${index + 1}. ${option} ${isCorrect ? '(Correct Answer)' : ''}`, 20, yPosition);
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 7;
      });
    } else if (question.type === 'coding' && question.codeSnippet) {
      // For coding questions, show code snippet
      doc.setFontSize(12);
      doc.text('Solution:', 14, yPosition + 10);
      
      yPosition += 20;
      
      // Add a gray background for code
      doc.setFillColor(240, 240, 240);
      doc.rect(14, yPosition - 5, 180, 100, 'F');
      
      // Split code into lines
      const codeLines = doc.splitTextToSize(question.codeSnippet, 170);
      doc.setFontSize(8);
      doc.text(codeLines, 19, yPosition);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} - Aithor Question Bank`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    
    // Return the PDF as a blob
    return doc.output('blob');
  }
}
