import { QuestionBankService } from './questionBankService';
import connectToDatabase from '../mongodb';
import SystemLogModel from '../models/SystemLog';

/**
 * Service for handling background processing tasks
 */
export class BackgroundProcessingService {
  /**
   * Check if question bank needs processing and trigger processing if needed
   */
  static async checkAndProcessQuestionBank(): Promise<void> {
    try {
      // Connect to the database
      await connectToDatabase();
      
      // Log the start of the process
      await this.logSystemEvent('QUESTION_BANK_CHECK', 'Starting question bank check');
      
      // Get the count of questions by domain
      const countByDomain = await QuestionBankService.getQuestionCountByDomain();
      
      // Check each domain
      for (const [domain, count] of Object.entries(countByDomain)) {
        // If the count exceeds 100, trigger processing
        if (count >= 100) {
          await this.logSystemEvent('QUESTION_BANK_PROCESSING', `Domain ${domain} has ${count} questions, triggering processing`);
          
          // Process questions without answers for this domain
          const processedCount = await QuestionBankService.processQuestionsWithoutAnswers(domain);
          
          await this.logSystemEvent('QUESTION_BANK_PROCESSED', `Processed ${processedCount} questions for domain ${domain}`);
        }
      }
      
      await this.logSystemEvent('QUESTION_BANK_CHECK', 'Completed question bank check');
    } catch (error) {
      console.error('Error in background processing:', error);
      await this.logSystemEvent('QUESTION_BANK_ERROR', `Error in background processing: ${error}`);
    }
  }
  
  /**
   * Log a system event
   * @param eventType The type of event
   * @param message The event message
   */
  static async logSystemEvent(eventType: string, message: string): Promise<void> {
    try {
      await SystemLogModel.create({
        eventType,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  }
}
