import { MongoClient, ObjectId } from 'mongodb';
import { getMongoDb } from './mongodb';

type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

interface LogEvent {
  timestamp: Date;
  action: string;
  category: string;
  details?: Record<string, unknown>;
  userId?: string;
  resourceId?: string;
  severity: LogSeverity;
  source?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  duration?: number;
  tags?: string[];
}

interface LogOptions {
  userId?: string;
  resourceId?: string;
  source?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  duration?: number;
  tags?: string[];
}

const MAX_LOG_SIZE = 10 * 1024; // 10KB limit for log details

function sanitizeLogDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(details)) {
    // Remove sensitive data patterns
    if (
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('key')
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Handle different value types
    if (value === null || value === undefined) {
      sanitized[key] = null;
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeLogDetails(value as Record<string, unknown>);
    } else if (value instanceof Error) {
      sanitized[key] = {
        message: value.message,
        name: value.name,
        stack: value.stack,
      };
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

async function saveLog(event: LogEvent): Promise<void> {
  try {
    const mongooseInstance = await getMongoDb();
    if (!mongooseInstance?.connection?.db) throw new Error('MongoDB connection is null');
    const collection = mongooseInstance.connection.db.collection('systemLogs');

    // Ensure log details don't exceed size limit
    if (event.details) {
      const detailsSize = JSON.stringify(event.details).length;
      if (detailsSize > MAX_LOG_SIZE) {
        event.details = {
          original_size: detailsSize,
          truncated: true,
          message: 'Log details exceeded size limit and were truncated',
        };
      }
    }

    await collection.insertOne(event);
  } catch (error) {
    console.error('Failed to save log:', error);
    // For critical errors, attempt to write to a backup location or notify
    if (event.severity === 'critical') {
      console.error('CRITICAL LOG FAILED TO SAVE:', JSON.stringify(event));
    }
  }
}

export async function log(
  action: string,
  category: string,
  details: Record<string, unknown>,
  severity: LogSeverity = 'info',
  options: LogOptions = {}
): Promise<void> {
  const sanitizedDetails = sanitizeLogDetails(details);

  const event: LogEvent = {
    timestamp: new Date(),
    action,
    category,
    details: sanitizedDetails,
    severity,
    ...options,
  };

  await saveLog(event);
}

// Convenience methods for different log levels
export const logDebug = (action: string, category: string, details: Record<string, unknown>, options?: LogOptions) =>
  log(action, category, details, 'debug', options);

export const logInfo = (action: string, category: string, details: Record<string, unknown>, options?: LogOptions) =>
  log(action, category, details, 'info', options);

export const logWarning = (action: string, category: string, details: Record<string, unknown>, options?: LogOptions) =>
  log(action, category, details, 'warning', options);

export const logError = (action: string, category: string, details: Record<string, unknown>, options?: LogOptions) =>
  log(action, category, details, 'error', options);

export const logCritical = (action: string, category: string, details: Record<string, unknown>, options?: LogOptions) =>
  log(action, category, details, 'critical', options);

// Specialized logging functions
export const logSystemEvent = (details: Record<string, unknown>) =>
  log('system_event', 'system', details);

export const logAuthEvent = (details: Record<string, unknown>, userId?: string) =>
  log('auth_event', 'auth', details, 'info', { userId });

export const logUserEvent = (details: Record<string, unknown>, userId: string) =>
  log('user_event', 'user', details, 'info', { userId });

export const logInterviewEvent = (details: Record<string, unknown>, userId: string, interviewId: string) =>
  log('interview_event', 'interview', details, 'info', { userId, resourceId: interviewId });

export const logAdminEvent = (details: Record<string, unknown>, adminId: string) =>
  log('admin_event', 'admin', details, 'info', { userId: adminId });

// Performance monitoring
export const logPerformance = (action: string, duration: number, details: Record<string, unknown> = {}) =>
  log(action, 'performance', { ...details, duration }, 'info', { duration });

// Security events
export const logSecurityEvent = (details: Record<string, unknown>, severity: LogSeverity = 'warning') =>
  log('security_event', 'security', details, severity);
