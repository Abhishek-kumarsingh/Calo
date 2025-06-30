import mongoose from 'mongoose';
import QuestionBankModel, { IQuestionBankItem } from '../models/QuestionBank';
import InterviewModel, { IAIQuestion, IInterview } from '../models/Interview';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Service for managing the Question Bank
 */
export class QuestionBankService {
  /**
   * Add questions from an interview to the question bank
   * @param interviewId The ID of the interview
   * @param userId The ID of the user
   */
  static async addInterviewQuestionsToBank(interviewId: string, userId: string): Promise<boolean> {
    try {
      // Find the interview
      const interview = await InterviewModel.findById(interviewId);
      
      if (!interview) {
        throw new Error('Interview not found');
      }
      
      // Check if the interview has already been saved to the question bank
      if (interview.savedToQuestionBank) {
        return true; // Already saved, no need to do it again
      }
      
      // Get the questions from the interview
      const { questions, domain, subDomain, level } = interview;
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions found in the interview');
      }
      
      // Map difficulty level from interview to question bank format
      let difficulty: 'easy' | 'intermediate' | 'advanced' = 'intermediate';
      if (level === 'entry-level' || level === 'junior') {
        difficulty = 'easy';
      } else if (level === 'mid-level') {
        difficulty = 'intermediate';
      } else if (level === 'senior' || level === 'principal_staff') {
        difficulty = 'advanced';
      }
      
      // Convert interview questions to question bank format
      const questionBankItems = questions.map((q: IAIQuestion) => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctOption: q.correctOption,
        codeSnippet: q.codeSnippet || "",
        domain,
        subDomain,
        difficulty,
        user: new mongoose.Types.ObjectId(userId)
      }));
      
      // Insert the questions into the question bank
      await QuestionBankModel.insertMany(questionBankItems);
      
      // Mark the interview as saved to the question bank
      interview.savedToQuestionBank = true;
      await interview.save();
      
      return true;
    } catch (error) {
      console.error('Error adding interview questions to bank:', error);
      return false;
    }
  }
  
  /**
   * Get the count of questions in the question bank by domain
   */
  static async getQuestionCountByDomain(): Promise<Record<string, number>> {
    try {
      const result = await QuestionBankModel.aggregate([
        { $group: { _id: "$domain", count: { $sum: 1 } } }
      ]);
      
      // Convert the result to a more usable format
      const countByDomain: Record<string, number> = {};
      result.forEach((item) => {
        countByDomain[item._id] = item.count;
      });
      
      return countByDomain;
    } catch (error) {
      console.error('Error getting question count by domain:', error);
      return {};
    }
  }
  
  /**
   * Process questions in the bank that don't have answers
   * This is triggered when the question count exceeds 100
   * @param domain The domain to process questions for
   */
  static async processQuestionsWithoutAnswers(domain: string): Promise<number> {
    try {
      // Find questions without answers (correctOption is null for multiple-choice)
      const questions = await QuestionBankModel.find({
        domain,
        $or: [
          { type: 'text', correctOption: null },
          { type: 'multiple-choice', correctOption: null },
          { type: 'coding', codeSnippet: { $in: [null, ""] } }
        ]
      }).limit(20); // Process in batches of 20
      
      if (questions.length === 0) {
        return 0;
      }
      
      // Process each question to generate answers
      let processedCount = 0;
      
      for (const question of questions) {
        const success = await this.generateAnswerForQuestion(question);
        if (success) {
          processedCount++;
        }
      }
      
      return processedCount;
    } catch (error) {
      console.error('Error processing questions without answers:', error);
      return 0;
    }
  }
  
  /**
   * Generate an answer for a question using AI
   * @param question The question to generate an answer for
   */
  static async generateAnswerForQuestion(question: IQuestionBankItem): Promise<boolean> {
    try {
      // Create a model instance
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Craft the prompt based on question type
      let prompt = '';
      
      if (question.type === 'text') {
        prompt = `You are an expert in ${question.domain} with focus on ${question.subDomain || 'general topics'}. 
        Please provide a comprehensive answer to the following question at ${question.difficulty} level:
        
        Question: ${question.question}
        
        Provide a detailed, accurate answer that demonstrates expertise in the subject.`;
      } else if (question.type === 'multiple-choice') {
        prompt = `You are an expert in ${question.domain} with focus on ${question.subDomain || 'general topics'}.
        
        For the following multiple-choice question at ${question.difficulty} level:
        
        Question: ${question.question}
        Options: ${question.options?.join(', ')}
        
        Please identify the correct option (provide the index number starting from 0) and explain why it's correct.
        Format your response as:
        Correct Option Index: [number]
        Explanation: [your explanation]`;
      } else if (question.type === 'coding') {
        prompt = `You are an expert programmer in ${question.domain} with focus on ${question.subDomain || 'general programming'}.
        
        For the following coding question at ${question.difficulty} level:
        
        Question: ${question.question}
        
        Please provide a working code solution. Make sure the code is efficient, well-commented, and follows best practices.`;
      }
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Update the question with the generated answer
      if (question.type === 'multiple-choice') {
        // Extract the correct option index from the response
        const match = text.match(/Correct Option Index:\s*(\d+)/i);
        if (match && match[1]) {
          const correctOptionIndex = parseInt(match[1]);
          if (!isNaN(correctOptionIndex) && correctOptionIndex >= 0 && correctOptionIndex < (question.options?.length || 0)) {
            question.correctOption = correctOptionIndex;
            await question.save();
            return true;
          }
        }
      } else if (question.type === 'coding') {
        // Extract code from the response
        let codeSnippet = text;
        // If the response contains code blocks, extract the code
        if (text.includes('```')) {
          const codeBlocks = text.match(/```(?:[\w-]+)?\n([\s\S]*?)```/g);
          if (codeBlocks && codeBlocks.length > 0) {
            // Extract the content inside the first code block
            const match = codeBlocks[0].match(/```(?:[\w-]+)?\n([\s\S]*?)```/);
            if (match && match[1]) {
              codeSnippet = match[1];
            }
          }
        }
        
        question.codeSnippet = codeSnippet;
        await question.save();
        return true;
      } else {
        // For text questions, just save the entire response
        question.correctOption = 0; // Use correctOption as a flag to indicate the question has been processed
        await question.save();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error generating answer for question:', error);
      return false;
    }
  }
}
