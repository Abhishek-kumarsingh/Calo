/**
 * Mock Analytics Data
 * 
 * This file provides mock data for analytics endpoints when a user is not authenticated.
 * It's useful for development and demonstration purposes.
 */

export const mockAnalyticsOverview = {
  overallScore: 78,
  totalInterviews: 12,
  completedInterviews: 10,
  avgDuration: 45
};

export const mockSkillsAnalysis = [
  {
    name: "Technical Knowledge",
    score: 85
  },
  {
    name: "Problem Solving",
    score: 82
  },
  {
    name: "Code Quality",
    score: 75
  },
  {
    name: "Communication",
    score: 90
  },
  {
    name: "System Design",
    score: 70
  }
];

export const mockDomainPerformance = [
  {
    name: "Frontend",
    count: 5,
    avgScore: 82
  },
  {
    name: "Backend",
    count: 4,
    avgScore: 78
  },
  {
    name: "Full Stack",
    count: 3,
    avgScore: 75
  }
];

export const mockFeedbackThemes = [
  {
    theme: "Strengths",
    occurrences: 15,
    sentiment: {
      positive: 80,
      negative: 0,
      neutral: 20
    },
    examples: [
      "The candidate demonstrated excellent knowledge of React hooks and component lifecycle.",
      "Strong problem-solving skills were evident in the algorithmic questions.",
      "Communication was clear and concise throughout the interview."
    ]
  },
  {
    theme: "Areas for Improvement",
    occurrences: 8,
    sentiment: {
      positive: 0,
      negative: 75,
      neutral: 25
    },
    examples: [
      "Could improve understanding of advanced CSS concepts like flexbox and grid.",
      "Needs more practice with database optimization techniques.",
      "Should work on explaining complex concepts more clearly."
    ]
  },
  {
    theme: "Technical Skills",
    occurrences: 12,
    sentiment: {
      positive: 60,
      negative: 10,
      neutral: 30
    },
    examples: [
      "Technical knowledge of JavaScript frameworks is solid.",
      "Good understanding of RESTful API design principles.",
      "Familiar with common data structures and algorithms."
    ]
  }
];

export const mockRecentInterviews = [
  {
    id: "mock-interview-1",
    title: "Frontend Developer Interview",
    candidateName: "Alex Johnson",
    candidateRole: "Frontend Developer",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    score: 85,
    domain: "frontend",
    difficulty: "intermediate"
  },
  {
    id: "mock-interview-2",
    title: "Backend Developer Interview",
    candidateName: "Sam Smith",
    candidateRole: "Backend Developer",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    score: 78,
    domain: "backend",
    difficulty: "advanced"
  },
  {
    id: "mock-interview-3",
    title: "Full Stack Developer Interview",
    candidateName: "Jamie Taylor",
    candidateRole: "Full Stack Developer",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    score: 92,
    domain: "fullstack",
    difficulty: "intermediate"
  }
];

export const mockInterviewAnalysis = {
  interview: {
    id: "mock-interview-1",
    title: "Frontend Developer Interview",
    domain: "frontend",
    subDomain: "React",
    difficulty: "intermediate",
    status: "completed",
    score: 85,
    overallFeedback: "The candidate demonstrated strong knowledge of React concepts and frontend development best practices. Their problem-solving skills were excellent, and they communicated their thoughts clearly. There's room for improvement in advanced CSS techniques and state management patterns. Overall, a strong performance that shows good potential for a frontend role."
  },
  analysis: {
    skills: [
      { name: "Technical Knowledge", score: 85 },
      { name: "Problem Solving", score: 90 },
      { name: "Code Quality", score: 80 },
      { name: "Communication", score: 88 },
      { name: "System Design", score: 75 }
    ],
    themes: [
      {
        theme: "Strengths",
        occurrences: 8,
        sentiment: { positive: 100, negative: 0, neutral: 0 },
        examples: [
          "Strong knowledge of React hooks and component lifecycle.",
          "Excellent problem-solving approach to algorithmic questions.",
          "Clear and concise communication throughout the interview."
        ]
      },
      {
        theme: "Areas for Improvement",
        occurrences: 4,
        sentiment: { positive: 0, negative: 100, neutral: 0 },
        examples: [
          "Could improve understanding of advanced CSS concepts.",
          "Should practice more complex state management patterns.",
          "Needs more experience with performance optimization."
        ]
      }
    ],
    recommendations: [
      { type: "positive", text: "Overall performance is excellent. Consider moving forward with this candidate." },
      { type: "positive", text: "Strong performance in problem solving, which is a key strength." },
      { type: "negative", text: "Focus on improving system design skills, which scored below average." },
      { type: "neutral", text: "Review the detailed feedback for specific improvement suggestions." }
    ]
  }
};
