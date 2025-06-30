import { useEffect, useRef } from 'react';
import { useComponentPerformance } from '@/lib/monitoring';

export function usePerformanceMonitoring(componentName: string) {
  const performance = useComponentPerformance(componentName);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    performance.trackMount();
    mountTimeRef.current = Date.now();

    return () => {
      performance.trackUnmount();
    };
  }, []);

  const trackOperation = (name: string, operation: () => void) => {
    performance.trackOperation(name, operation);
  };

  const trackAsyncOperation = async <T,>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const metricName = `${componentName}_${name}`;
    try {
      performance.trackOperation(metricName, () => {});
      const result = await operation();
      performance.trackOperation(metricName, () => {});
      return result;
    } catch (error) {
      performance.trackOperation(metricName, () => {
        throw error;
      });
      throw error;
    }
  };

  return {
    trackOperation,
    trackAsyncOperation,
  };
}