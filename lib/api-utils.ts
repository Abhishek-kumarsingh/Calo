/**
 * API Utilities for Interview System
 */

// Ensure API_BASE_URL doesn't end with /api to avoid double /api in URLs
// For Next.js API routes, we should use an empty string as the base URL
// This will make the fetch requests relative to the current domain
const API_BASE_URL = "";

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
    // Get the token from session storage or local storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;

    // Debug: Log token status
    console.log(`API Request token: ${token ? 'found' : 'not found'}`);
    if (!token) {
      console.warn('No token found in localStorage or sessionStorage');

      // For interview-related endpoints, try to get the token again after a short delay
      // This helps with race conditions when navigating between components
      if (endpoint.includes('/interviews/') && typeof window !== 'undefined') {
        console.log('Attempting to retrieve token again for interview endpoint...');
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (retryToken) {
          console.log('Token found on retry!');
          return fetchWithErrorHandling(endpoint, options); // Retry the request with the new token
        }
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { 'Authorization': `Bearer ${token}` }),
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
      const responseText = await response.text().catch(() => "Could not read error response text.");

      // Check if the response is HTML (likely an error page)
      const isHtmlResponse = responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html');

      let errorMessage = `API request failed with status ${response.status}`;
      if (isHtmlResponse) {
        errorMessage += `. Server returned an HTML page instead of JSON. This typically indicates a server-side error.`;
      } else {
        errorMessage += `, and response was not valid JSON.`;
      }

      console.error("API Error Data (not JSON):", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      console.error(`API Error for ${url}: ${errorMessage}`);

      // Create a more detailed error message for debugging
      const detailedError = new Error(errorMessage);
      (detailedError as any).status = response.status;
      (detailedError as any).url = url;
      (detailedError as any).responseText = responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '');
      (detailedError as any).isHtmlResponse = isHtmlResponse;

      throw detailedError;
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || // Standard error message key from your backend
        data?.error || // Alternative error message key
        `API request failed with status ${response.status}`;

      console.error("API Error Data (JSON parsed):", data);
      console.error(`API Error for ${url}: ${errorMessage}`);

      // Create a more detailed error message for debugging
      const detailedError = new Error(errorMessage);
      (detailedError as any).status = response.status;
      (detailedError as any).url = url;
      (detailedError as any).responseData = data;

      throw detailedError;
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
 * Chat Session API functions
 */
export const chatSessionApi = {
  // Get all chat sessions
  getChatSessions: () => {
    return fetchWithErrorHandling('/api/chat-sessions');
  },

  // Get a specific chat session
  getChatSession: (id: string) => {
    return fetchWithErrorHandling(`/api/chat-sessions/${id}`);
  },

  // Create a new chat session
  createChatSession: (data: { title?: string; initialMessage?: string }) => {
    return fetchWithErrorHandling('/api/chat-sessions', {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Add a message to a chat session
  addMessage: (sessionId: string, content: string) => {
    return fetchWithErrorHandling(`/api/chat-sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // Update a chat session (title or add feedback to a message)
  updateChatSession: (
    id: string,
    data: { title?: string; messageIndex?: number; feedback?: 'positive' | 'negative' }
  ) => {
    return fetchWithErrorHandling(`/api/chat-sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete a chat session
  deleteChatSession: (id: string) => {
    return fetchWithErrorHandling(`/api/chat-sessions/${id}`, {
      method: "DELETE",
    });
  },
};

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

  batchDeleteInterviews: (interviewIds: string[]) => {
    return fetchWithErrorHandling(`/api/interviews/batch-delete`, {
      method: "POST",
      body: JSON.stringify({ interviewIds }),
    });
  },

  getQuestions: (interviewId: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/questions`);
  },

  // Modified to handle the specific response structure: { message: "...", interview: { ... } }
  generateAiQuestions: async (interviewId: string, numQuestions?: number, questionTypes?: any, questionTypeDistribution?: any) => {
    console.log(`API: Generating AI questions with count: ${numQuestions}`);
    console.log(`API: Question types:`, questionTypes);
    console.log(`API: Question type distribution:`, questionTypeDistribution);

    // Create a request body with only defined parameters
    const requestBody: Record<string, any> = {};

    // Only include parameters that are explicitly provided (not undefined or null)
    if (numQuestions !== undefined && numQuestions !== null) {
      requestBody.numQuestions = Number(numQuestions); // Ensure it's a number
    }

    if (questionTypes !== undefined && questionTypes !== null) {
      // Ensure we're sending the correct structure
      requestBody.questionTypes = {
        text: Boolean(questionTypes.text),
        multipleChoice: Boolean(questionTypes.multipleChoice),
        coding: Boolean(questionTypes.coding),
        codeCorrection: Boolean(questionTypes.codeCorrection)
      };
    }

    if (questionTypeDistribution !== undefined && questionTypeDistribution !== null) {
      // Ensure we're sending the correct structure
      requestBody.questionTypeDistribution = {
        text: Number(questionTypeDistribution.text) || 0,
        multipleChoice: Number(questionTypeDistribution.multipleChoice) || 0,
        coding: Number(questionTypeDistribution.coding) || 0,
        codeCorrection: Number(questionTypeDistribution.codeCorrection) || 0
      };
    }

    console.log(`API: Final request body:`, requestBody);

    const responseData = await fetchWithErrorHandling(
      `/api/interviews/${interviewId}/generate-ai-questions`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
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
    // If the structure is different or 'interview' key is missing, but response was OK (2xx)
    // this might indicate an unexpected successful response format.
    // If fetchWithErrorHandling already threw for non-OK, this part might not be hit for errors.
    console.warn(
      "generateAiQuestions: Response structure was not as expected (missing 'interview' key in wrapped response), returning raw data.",
      responseData
    );
    return responseData; // Fallback to returning raw data; calling component must be robust
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

  // For regenerating overall feedback - expects { message: "...", interview: { ... } }
  generateFeedback: async (interviewId: string) => {
    const responseData = await fetchWithErrorHandling(
      `/api/interviews/${interviewId}/generate-overall-feedback`, // This should be the endpoint for regenerating
      {
        method: "POST",
      }
    );
    if (responseData && typeof responseData === "object") {
      return responseData; // Return only the interview object
    }
    console.warn(
      "generateFeedback: Response structure was not as expected (missing 'interview' key), returning raw data.",
      responseData
    );
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
  getAnalyticsOverview: (filters?: { domain?: string; timeframe?: string }) => {
    // Constructs query params like ?domain=frontend&timeframe=month
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>
    ).toString() : '';

    console.log(`Analytics Overview URL: /api/analytics/overview${queryParams ? `?${queryParams}` : ""}`);
    return fetchWithErrorHandling(
      `/api/analytics/overview${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getSkillsAnalysis: (filters?: { domain?: string; timeframe?: string }) => {
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>
    ).toString() : '';

    console.log(`Skills Analysis URL: /api/analytics/skills${queryParams ? `?${queryParams}` : ""}`);
    return fetchWithErrorHandling(
      `/api/analytics/skills${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getDomainPerformance: (filters?: { domain?: string; timeframe?: string }) => {
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>
    ).toString() : '';

    console.log(`Domain Performance URL: /api/analytics/domains${queryParams ? `?${queryParams}` : ""}`);
    return fetchWithErrorHandling(
      `/api/analytics/domains${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getRecentCompletedInterviews: (filters?: {
    domain?: string;
    timeframe?: string;
    limit?: number;
  }) => {
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>
    ).toString() : '';

    console.log(`Recent Completed Interviews URL: /api/interviews?status=completed&sort=-updatedAt${
      queryParams ? `&${queryParams}` : ""
    }`);
    return fetchWithErrorHandling(
      `/api/interviews?status=completed&sort=-updatedAt${
        queryParams ? `&${queryParams}` : ""
      }`
    );
    // This assumes your GET /api/interviews supports filtering and sorting
  },

  getFeedbackThemes: (filters?: { domain?: string; timeframe?: string }) => {
    const queryParams = filters ? new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>
    ).toString() : '';

    console.log(`Feedback Themes URL: /api/analytics/feedback-themes${queryParams ? `?${queryParams}` : ""}`);
    return fetchWithErrorHandling(
      `/api/analytics/feedback-themes${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getInterviewAnalysis: (interviewId: string) => {
    return fetchWithErrorHandling(`/api/interviews/${interviewId}/analysis`);
  },
  // NEW METHOD TO GET ALL CANDIDATES
  getAllCandidates: () => {
    return fetchWithErrorHandling(`/api/candidates`); // Assuming this endpoint exists on your backend
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

  if (setError && typeof setError === 'function') {
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
