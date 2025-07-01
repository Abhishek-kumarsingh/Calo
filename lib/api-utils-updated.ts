/**
 * API Utilities for Interview System
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"; // Base URL of your backend

// Unified Gemini/Claude API key support
const GEMINI_CLAUDE_API_KEY = process.env.NEXT_PUBLIC_GEMINI_CLAUDE_API_KEY;

/**
 * Standard fetch wrapper with error handling
 * This function now assumes the backend might return the main data directly
 * or wrapped (e.g. { message: "...", data: ... } or { message: "...", interview: ... })
 * Individual API methods in `interviewApi` will handle specific extraction if needed.
 */
async function fetchWithErrorHandling(
  endpoint: string, // Should start with '/' e.g., '/api/interviews'
  options: RequestInit = {}
): Promise<any> {
  // Return type is any, specific methods will cast
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);
  if (options.body && typeof options.body === "string") {
    // Ensure body is string for logging
    try {
      // Attempt to log a prettified version if it's JSON, otherwise log as is
      const parsedBody = JSON.parse(options.body);
      console.log(`Request Body (parsed):`, parsedBody);
    } catch {
      console.log(`Request Body (raw): ${options.body}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Example for adding an auth token if you have one:
        // const token = getAuthToken(); // Implement this function
        // ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    console.log(`API Response status: ${response.status} for ${url}`);

    if (response.status === 204) {
      return null; // For DELETE or PUT operations that don't return content
    }

    // Attempt to parse JSON, but handle potential errors if body is not JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If JSON parsing fails but response was otherwise okay (e.g. 200 with non-JSON body)
      if (response.ok) {
        console.warn(
          `API Warning: Response from ${url} was not valid JSON, but status was ${response.status}.`
        );
        // Depending on your API, you might want to return response.text() or handle differently
        throw new Error(
          `Received non-JSON response from server (status ${response.status})`
        );
      }
      // If response was not ok AND not JSON, craft an error message
      const errorMessage = `API request failed with status ${response.status}, and response was not valid JSON.`;
      console.error(
        "API Error Data (not JSON):",
        await response.text().catch(() => "Could not read error response text.")
      );
      console.error(`API Error for ${url}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || // Standard error message key from your backend
        data?.error || // Alternative error message key
        `API request failed with status ${response.status}`;
      console.error("API Error Data (JSON parsed):", data);
      console.error(`API Error for ${url}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Successfully fetched and parsed data
    return data;
  } catch (error: any) {
    console.error(
      `Critical error in API call to ${url}: ${error.message}`,
      error
    );
    // Re-throw a new error to ensure a consistent error object structure if needed,
    // or just re-throw the original. Error.message is usually sufficient.
    throw new Error(
      error.message ||
        `Network error or an unexpected issue occurred with the API call to ${url}`
    );
  }
}

/**
 * Interview API functions
 */
export const interviewApi = {
  getAllInterviews: () => {
    return fetchWithErrorHandling(`/api/interviews`);
  },

  getInterview: (id: string) => {
    return fetchWithErrorHandling(`/api/interviews/${id}`);
  },

  getInterviewById: (id: string) => {
    return interviewApi.getInterview(id);
  },

  getSampleInterview: (id: string) => {
    return fetchWithErrorHandling(`/api/interviews/${id}?sample=true`);
  },

  createInterview: (data: Record<string, any>) => {
    return fetchWithErrorHandling(`/api/interviews`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateInterview: (id: string, data: Record<string, any>) => {
    return fetchWithErrorHandling(`/api/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteInterview: (id: string) => {
    return fetchWithErrorHandling(`/api/interviews/${id}`, {
      method: "DELETE",
    });
  },

  getQuestions: (interviewId: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/questions`);
  },

  // Modified to handle the specific response structure: { message: "...", interview: { ... } }
  generateAiQuestions: async (interviewId: string, numQuestions?: number) => {
    const responseData = await fetchWithErrorHandling(
      `/api/interviews/${interviewId}/generate-ai-questions`,
      {
        method: "POST",
        body: JSON.stringify({ numQuestions }),
      }
    );
    // Extract the nested 'interview' object if the response structure is { message: ..., interview: ... }
    if (
      responseData &&
      typeof responseData === "object" &&
      responseData.interview
    ) {
      return responseData.interview; // Return only the interview object
    }
    return responseData; // Fallback to returning raw data
  },

  submitResponse: (
    interviewId: string,
    questionId: string,
    content: string
  ) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/responses`, {
      method: "POST",
      body: JSON.stringify({ questionId, content }),
    });
  },

  submitAiAnswer: (
    interviewId: string,
    questionIndex: number,
    answerContent: string
  ) => {
    return fetchWithErrorHandling(
      `/api/interviews/${interviewId}/questions/${questionIndex}/submit-answer`,
      {
        method: "POST",
        body: JSON.stringify({ answer: answerContent }),
      }
    );
  },

  getResponses: (interviewId: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/responses`);
  },

  finalizeInterview: (interviewId: string) => {
    return fetchWithErrorHandling(
      `/api/interviews/${interviewId}/generate-overall-feedback`,
      {
        method: "POST",
      }
    );
  },

  // For regenerating overall feedback
  generateFeedback: async (interviewId: string) => {
    const responseData = await fetchWithErrorHandling(
      `/api/interviews/${interviewId}/generate-overall-feedback`,
      {
        method: "POST",
      }
    );
    if (responseData && typeof responseData === "object") {
      return responseData;
    }
    return responseData;
  },

  getAiResponse: (interviewId: string, userMessage: string) => {
    return fetchWithErrorHandling(
      `/api/ai/response`,
      {
        method: "POST",
        body: JSON.stringify({ interviewId, userMessage }),
      }
    );
  },

  getMessages: (interviewId: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/messages`);
  },

  addMessage: (interviewId: string, content: string, role: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, role }),
    });
  },
  
  getAllCandidates: () => {
    return fetchWithErrorHandling(`/api/candidates`);
  },

  getAnalyticsOverview: (filters: any) => {
    const params = new URLSearchParams(filters).toString();
    return fetchWithErrorHandling(`/api/analytics/overview${params ? `?${params}` : ""}`);
  },

  getSkillsAnalysis: (filters: any) => {
    const params = new URLSearchParams(filters).toString();
    return fetchWithErrorHandling(`/api/analytics/skills${params ? `?${params}` : ""}`);
  },

  getDomainPerformance: (filters: any) => {
    const params = new URLSearchParams(filters).toString();
    return fetchWithErrorHandling(`/api/analytics/domains${params ? `?${params}` : ""}`);
  },

  getRecentCompletedInterviews: (filters: any) => {
    const params = new URLSearchParams(filters).toString();
    return fetchWithErrorHandling(`/api/interviews${params ? `?${params}` : ""}`);
  },
};

export function handleApiError(
  error: any,
  setError?: (errorMsg: string | null) => void
): string {
  console.error("API Error caught by handleApiError:", error);
  let errorMessage = "An unknown error occurred. Please try again.";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error.message === "string") {
    errorMessage = error.message;
  }

  if (setError) {
    setError(errorMessage);
  }
  return errorMessage;
}

export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      attempt++;
      if (attempt > 1)
        console.log(`API Call: Attempt ${attempt} of ${maxRetries + 1}`);
      return await apiCall();
    } catch (err: any) {
      console.warn(`API Call Attempt ${attempt} failed: ${err.message}`);
      if (attempt > maxRetries) {
        console.error("Max retries reached. Throwing last error for API call.");
        throw err;
      }
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${Math.min(delay, 5000)}ms before next retry...`);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(delay, 5000))
      );
    }
  }
}

export async function fetchGemini(endpoint: string, options: RequestInit = {}) {
  return fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${GEMINI_CLAUDE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
}

export async function fetchClaude(endpoint: string, options: RequestInit = {}) {
  return fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${GEMINI_CLAUDE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
}
