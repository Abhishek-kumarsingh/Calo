import { NextRequest } from 'next/server';
import SystemLogModel, { ISystemLog } from './models/SystemLog';
import connectToDatabase from './mongodb';
import mongoose from 'mongoose';

interface LogParams {
  action: string;
  category: 'auth' | 'user' | 'interview' | 'question' | 'admin' | 'system';
  details: string;
  userId?: string;
  resourceId?: string;
  resourceType?: 'User' | 'Interview' | 'Question' | 'Candidate' | 'QuestionBank';
  status?: 'success' | 'failure' | 'warning' | 'info';
  request?: NextRequest;
}

/**
 * Log a system event
 * @param params Log parameters
 * @returns Promise that resolves to the created log entry
 */
export async function logSystemEvent(params: LogParams): Promise<ISystemLog> {
  try {
    // Connect to the database
    await connectToDatabase();

    // Extract request information if available
    let ipAddress = undefined;
    let userAgent = undefined;

    if (params.request) {
      // Get IP address
      ipAddress = params.request.headers.get('x-forwarded-for') || 
                  params.request.headers.get('x-real-ip') || 
                  'unknown';
      
      // Get user agent
      userAgent = params.request.headers.get('user-agent') || 'unknown';
    }

    // Create log entry
    const logEntry = new SystemLogModel({
      action: params.action,
      category: params.category,
      details: params.details,
      userId: params.userId ? new mongoose.Types.ObjectId(params.userId) : undefined,
      resourceId: params.resourceId ? new mongoose.Types.ObjectId(params.resourceId) : undefined,
      resourceType: params.resourceType,
      ipAddress,
      userAgent,
      status: params.status || 'info'
    });

    // Save log entry
    await logEntry.save();
    
    return logEntry;
  } catch (error) {
    // Log to console if database logging fails
    console.error('Failed to log system event:', error);
    console.error('Event details:', params);
    
    // Return a dummy log entry
    return {
      _id: new mongoose.Types.ObjectId(),
      action: params.action,
      category: params.category,
      details: params.details,
      status: params.status || 'info',
      createdAt: new Date(),
      updatedAt: new Date()
    } as ISystemLog;
  }
}

/**
 * Log an authentication event
 */
export async function logAuthEvent(
  action: string, 
  details: string, 
  userId?: string, 
  status: 'success' | 'failure' | 'warning' | 'info' = 'info',
  request?: NextRequest
): Promise<ISystemLog> {
  return logSystemEvent({
    action,
    category: 'auth',
    details,
    userId,
    status,
    request
  });
}

/**
 * Log a user management event
 */
export async function logUserEvent(
  action: string, 
  details: string, 
  userId: string,
  targetUserId?: string,
  status: 'success' | 'failure' | 'warning' | 'info' = 'success',
  request?: NextRequest
): Promise<ISystemLog> {
  return logSystemEvent({
    action,
    category: 'user',
    details,
    userId,
    resourceId: targetUserId,
    resourceType: 'User',
    status,
    request
  });
}

/**
 * Log an interview event
 */
export async function logInterviewEvent(
  action: string, 
  details: string, 
  userId: string,
  interviewId?: string,
  status: 'success' | 'failure' | 'warning' | 'info' = 'success',
  request?: NextRequest
): Promise<ISystemLog> {
  return logSystemEvent({
    action,
    category: 'interview',
    details,
    userId,
    resourceId: interviewId,
    resourceType: 'Interview',
    status,
    request
  });
}

/**
 * Log an admin action
 */
export async function logAdminEvent(
  action: string, 
  details: string, 
  adminId: string,
  resourceId?: string,
  resourceType?: 'User' | 'Interview' | 'Question' | 'Candidate' | 'QuestionBank',
  status: 'success' | 'failure' | 'warning' | 'info' = 'success',
  request?: NextRequest
): Promise<ISystemLog> {
  return logSystemEvent({
    action,
    category: 'admin',
    details,
    userId: adminId,
    resourceId,
    resourceType,
    status,
    request
  });
}
