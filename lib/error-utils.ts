import { logSystemEvent } from './logger';

export interface ErrorDetails {
  code?: string;
  context?: Record<string, unknown>;
  severity?: 'error' | 'warning' | 'info';
  source?: string;
}

export class AppError extends Error {
  code: string;
  context: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
  source: string;

  constructor(message: string, details: ErrorDetails = {}) {
    super(message);
    this.name = 'AppError';
    this.code = details.code || 'UNKNOWN_ERROR';
    this.context = details.context || {};
    this.severity = details.severity || 'error';
    this.source = details.source || 'application';
  }
}

export const errorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function handleError(error: unknown, context?: Record<string, unknown>) {
  const appError = error instanceof AppError ? error : new AppError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    { context }
  );

  logSystemEvent({
    action: 'error_handled',
    category: 'error',
    details: {
      message: appError.message,
      code: appError.code,
      context: appError.context,
      stack: appError.stack,
    },
    severity: appError.severity,
  });

  return appError;
}

export function createAPIError(message: string, statusCode: number, context?: Record<string, unknown>) {
  return new AppError(message, {
    code: `API_${statusCode}`,
    context,
    source: 'api',
    severity: statusCode >= 500 ? 'error' : 'warning',
  });
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    ('code' in error && error.code === 'NETWORK_ERROR' ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch failed'))
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}