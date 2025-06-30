import { BackgroundProcessingService } from '../services/backgroundProcessingService';

/**
 * Scheduled tasks for the application
 */
export class ScheduledTasks {
  private static isRunning = false;
  private static interval: NodeJS.Timeout | null = null;
  
  /**
   * Start the scheduled tasks
   */
  static start(): void {
    if (this.interval) {
      return; // Already running
    }
    
    console.log('Starting scheduled tasks');
    
    // Run every hour (3600000 ms)
    this.interval = setInterval(() => {
      this.runTasks();
    }, 3600000);
    
    // Run immediately on start
    this.runTasks();
  }
  
  /**
   * Stop the scheduled tasks
   */
  static stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Stopped scheduled tasks');
    }
  }
  
  /**
   * Run the scheduled tasks
   */
  private static async runTasks(): Promise<void> {
    if (this.isRunning) {
      return; // Prevent overlapping runs
    }
    
    this.isRunning = true;
    
    try {
      console.log('Running scheduled tasks:', new Date().toISOString());
      
      // Check and process question bank
      await BackgroundProcessingService.checkAndProcessQuestionBank();
      
      // Add more scheduled tasks here as needed
      
    } catch (error) {
      console.error('Error running scheduled tasks:', error);
    } finally {
      this.isRunning = false;
    }
  }
}
