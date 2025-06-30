import { logPerformance, logError } from './logger';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  name: string;
  type: 'api' | 'render' | 'database' | 'computation';
  status: 'success' | 'error';
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics>;
  private readonly SLOW_THRESHOLD = 1000; // 1 second

  private constructor() {
    this.metrics = new Map();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMetric(name: string, type: PerformanceMetrics['type'], metadata?: Record<string, unknown>) {
    const metric: PerformanceMetrics = {
      startTime: performance.now(),
      name,
      type,
      status: 'success',
      metadata,
    };
    this.metrics.set(name, metric);
    return name;
  }

  public endMetric(name: string, status: 'success' | 'error' = 'success') {
    const metric = this.metrics.get(name);
    if (!metric) return;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = status;

    // Log performance data
    logPerformance(name, metric.duration, {
      type: metric.type,
      status: metric.status,
      ...metric.metadata,
    });

    // Alert on slow operations
    if (metric.duration > this.SLOW_THRESHOLD) {
      logError('slow_operation', 'performance', {
        name,
        duration: metric.duration,
        type: metric.type,
        threshold: this.SLOW_THRESHOLD,
        ...metric.metadata,
      });
    }

    this.metrics.delete(name);
    return metric;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Error tracking
interface ErrorTrackingOptions {
  context?: Record<string, unknown>;
  userId?: string;
  tags?: string[];
}

export function trackError(error: unknown, options: ErrorTrackingOptions = {}) {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof Error ? error.constructor.name : typeof error,
    ...options.context,
  };

  logError('error_tracked', 'error', errorDetails, {
    userId: options.userId,
    tags: options.tags,
  });

  // You could add integration with external error tracking services here
  // e.g., Sentry, LogRocket, etc.
}

// API monitoring wrapper
export async function monitorApiCall<T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const metricName = `api_call_${name}`;
  performanceMonitor.startMetric(metricName, 'api', metadata);

  try {
    const result = await apiCall();
    performanceMonitor.endMetric(metricName, 'success');
    return result;
  } catch (error) {
    performanceMonitor.endMetric(metricName, 'error');
    trackError(error, { context: { apiCall: name, ...metadata } });
    throw error;
  }
}

// React component performance monitoring
export function useComponentPerformance(componentName: string) {
  return {
    trackMount: () => performanceMonitor.startMetric(`mount_${componentName}`, 'render'),
    trackUnmount: () => performanceMonitor.endMetric(`mount_${componentName}`),
    trackOperation: (name: string, operation: () => void) => {
      const metricName = `${componentName}_${name}`;
      performanceMonitor.startMetric(metricName, 'computation');
      try {
        operation();
        performanceMonitor.endMetric(metricName, 'success');
      } catch (error) {
        performanceMonitor.endMetric(metricName, 'error');
        throw error;
      }
    },
  };
}