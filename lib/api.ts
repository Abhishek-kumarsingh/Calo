// API service for interacting with the Express.js backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData: { name?: string; email?: string }) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },
};

// Interview API calls
export const interviewAPI = {
  // Get all interviews
  getInterviews: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get a specific interview
  getInterview: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Create a new interview
  createInterview: async (interviewData: any) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(interviewData),
    });
    return handleResponse(response);
  },

  // Update an interview
  updateInterview: async (id: string, interviewData: any) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(interviewData),
    });
    return handleResponse(response);
  },

  // Delete an interview
  deleteInterview: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get messages for an interview
  getInterviewMessages: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews/${id}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Add a message to an interview
  addInterviewMessage: async (id: string, messageData: { content: string; role: string }) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/interviews/${id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },
};

// AI API calls
export const aiAPI = {
  // Generate AI response
  generateResponse: async (interviewId: string, userMessage: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/ai/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interviewId, userMessage }),
    });
    return handleResponse(response);
  },

  // Generate interview feedback
  generateFeedback: async (interviewId: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/ai/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interviewId }),
    });
    return handleResponse(response);
  },
};

// Candidate API calls
export const candidateAPI = {
  // Get all candidates
  getCandidates: async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/candidates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get a specific candidate
  getCandidate: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/candidates/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Create a new candidate
  createCandidate: async (candidateData: any) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(candidateData),
    });
    return handleResponse(response);
  },

  // Update a candidate
  updateCandidate: async (id: string, candidateData: any) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(candidateData),
    });
    return handleResponse(response);
  },

  // Delete a candidate
  deleteCandidate: async (id: string) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/candidates/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};
