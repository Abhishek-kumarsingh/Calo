import { createAPIError, isNetworkError } from './error-utils';
import { monitorApiCall } from './monitoring';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export async function fetchWithErrorHandling<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < retries + 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error ${response.status}`;
        } catch {
          errorMessage = `HTTP error ${response.status}`;
        }
        throw createAPIError(errorMessage, response.status);
      }

      // Handle empty responses
      if (response.status === 204) {
        return null as T;
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        throw createAPIError('Invalid response format', 500);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      if (
        attempt < retries &&
        (isNetworkError(error) || (error instanceof Error && error.name === 'AbortError'))
      ) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        attempt++;
        continue;
      }
      break;
    }
  }

  throw lastError;
}

export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  return monitorApiCall(
    `GET ${new URL(url).pathname}`,
    () => fetchWithErrorHandling<T>(url, { ...options, method: 'GET' }),
    { method: 'GET', url }
  );
}

export async function post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return monitorApiCall(
    `POST ${new URL(url).pathname}`,
    () => fetchWithErrorHandling<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
    { method: 'POST', url, dataSize: data ? JSON.stringify(data).length : 0 }
  );
}

export async function put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return monitorApiCall(
    `PUT ${new URL(url).pathname}`,
    () => fetchWithErrorHandling<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    { method: 'PUT', url, dataSize: data ? JSON.stringify(data).length : 0 }
  );
}

export async function patch<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
  return monitorApiCall(
    `PATCH ${new URL(url).pathname}`,
    () => fetchWithErrorHandling<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    { method: 'PATCH', url, dataSize: data ? JSON.stringify(data).length : 0 }
  );
}

export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  return monitorApiCall(
    `DELETE ${new URL(url).pathname}`,
    () => fetchWithErrorHandling<T>(url, { ...options, method: 'DELETE' }),
    { method: 'DELETE', url }
  );
}

// Rate limiting utility
class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;

  constructor(private minRequestInterval: number) {}

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve =>
              setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
          }
          const result = await request();
          this.lastRequestTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) await request();
    }
    this.processing = false;
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(100); // 100ms between requests
