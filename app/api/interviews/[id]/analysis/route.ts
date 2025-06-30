import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { mockInterviewAnalysis } from "@/lib/mock-analytics";

// Define skill categories and keywords to look for in feedback
const SKILL_CATEGORIES = {
  "Technical Knowledge": [
    "technical", "knowledge", "understanding", "concept", "fundamentals"
  ],
  "Problem Solving": [
    "problem solving", "algorithm", "solution", "approach", "logic", "reasoning"
  ],
  "Code Quality": [
    "code quality", "clean code", "readable", "maintainable", "best practices", "standards"
  ],
  "Communication": [
    "communication", "articulate", "explain", "clarity", "expression"
  ],
  "System Design": [
    "design", "architecture", "structure", "pattern", "scalable", "maintainable"
  ],
  "Debugging": [
    "debug", "troubleshoot", "fix", "issue", "error", "problem"
  ],
  "Framework Knowledge": [
    "framework", "library", "react", "angular", "vue", "node", "express", "django", "spring"
  ]
};

// Define feedback themes to look for
const FEEDBACK_THEMES = {
  "Strengths": [
    { keyword: "strong", sentiment: "positive" },
    { keyword: "excellent", sentiment: "positive" },
    { keyword: "impressive", sentiment: "positive" },
    { keyword: "good", sentiment: "positive" },
    { keyword: "great", sentiment: "positive" },
    { keyword: "solid", sentiment: "positive" },
    { keyword: "proficient", sentiment: "positive" },
    { keyword: "skilled", sentiment: "positive" }
  ],
  "Areas for Improvement": [
    { keyword: "improve", sentiment: "negative" },
    { keyword: "lacking", sentiment: "negative" },
    { keyword: "weak", sentiment: "negative" },
    { keyword: "needs", sentiment: "negative" },
    { keyword: "should", sentiment: "negative" },
    { keyword: "could", sentiment: "negative" },
    { keyword: "better", sentiment: "negative" },
    { keyword: "work on", sentiment: "negative" }
  ],
  "Technical Skills": [
    { keyword: "technical", sentiment: "neutral" },
    { keyword: "coding", sentiment: "neutral" },
    { keyword: "programming", sentiment: "neutral" },
    { keyword: "algorithm", sentiment: "neutral" },
    { keyword: "data structure", sentiment: "neutral" },
    { keyword: "syntax", sentiment: "neutral" }
  ],
  "Soft Skills": [
    { keyword: "communication", sentiment: "neutral" },
    { keyword: "articulate", sentiment: "neutral" },
    { keyword: "explain", sentiment: "neutral" },
    { keyword: "clarity", sentiment: "neutral" },
    { keyword: "collaborate", sentiment: "neutral" },
    { keyword: "teamwork", sentiment: "neutral" }
  ]
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // For development, return mock data if not authenticated
    if (!session || !session.user) {
      console.log("No authenticated user found, returning mock interview analysis data");
      return NextResponse.json(mockInterviewAnalysis);
    }

    // Fetch the interview from our database
    const interview = await db.findInterviewById(params.id);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Check if the user has access to this interview
    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Analyze skills from the interview feedback
    const skillsAnalysis = analyzeSkills(interview.overallFeedback || "");

    // Analyze feedback themes
    const feedbackThemes = analyzeFeedbackThemes(interview.overallFeedback || "");

    // Generate recommendations based on the analysis
    const recommendations = generateRecommendations(interview, skillsAnalysis);

    return NextResponse.json({
      interview,
      analysis: {
        skills: skillsAnalysis,
        themes: feedbackThemes,
        recommendations
      }
    });
  } catch (error) {
    console.error("Error analyzing interview:", error);
    return NextResponse.json(
      { error: "Failed to analyze interview" },
      { status: 500 }
    );
  }
}

// Helper function to analyze skills from feedback
function analyzeSkills(feedback: string) {
  const skills = [];
  const lowerFeedback = feedback.toLowerCase();

  for (const [name, keywords] of Object.entries(SKILL_CATEGORIES)) {
    const mentioned = keywords.some(keyword => lowerFeedback.includes(keyword.toLowerCase()));

    if (mentioned) {
      // Generate a score based on sentiment analysis (simplified)
      const positiveWords = ["excellent", "good", "great", "strong", "impressive"];
      const negativeWords = ["improve", "weak", "lacking", "needs work", "poor"];

      let score = 70; // Default score

      // Adjust score based on positive/negative words near the skill keywords
      positiveWords.forEach(word => {
        if (lowerFeedback.includes(word)) score += 5;
      });

      negativeWords.forEach(word => {
        if (lowerFeedback.includes(word)) score -= 5;
      });

      // Ensure score is within 0-100 range
      score = Math.max(0, Math.min(100, score));

      skills.push({ name, score });
    }
  }

  return skills.sort((a, b) => b.score - a.score);
}

// Helper function to analyze feedback themes
function analyzeFeedbackThemes(feedback: string) {
  const results = [];
  const sentences = feedback.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const lowerFeedback = feedback.toLowerCase();

  for (const [theme, keywords] of Object.entries(FEEDBACK_THEMES)) {
    let occurrences = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const examples = [];

    keywords.forEach(({ keyword, sentiment }) => {
      const regex = new RegExp(keyword, "gi");
      const matches = lowerFeedback.match(regex);
      const count = matches ? matches.length : 0;

      occurrences += count;

      if (sentiment === "positive") {
        positiveCount += count;
      } else if (sentiment === "negative") {
        negativeCount += count;
      } else {
        neutralCount += count;
      }

      // Find example sentences containing this keyword
      if (count > 0) {
        sentences.forEach(sentence => {
          if (sentence.toLowerCase().includes(keyword.toLowerCase()) && examples.length < 3) {
            examples.push(sentence.trim());
          }
        });
      }
    });

    if (occurrences > 0) {
      results.push({
        theme,
        occurrences,
        sentiment: {
          positive: positiveCount > 0 ? Math.round((positiveCount / occurrences) * 100) : 0,
          negative: negativeCount > 0 ? Math.round((negativeCount / occurrences) * 100) : 0,
          neutral: neutralCount > 0 ? Math.round((neutralCount / occurrences) * 100) : 0
        },
        examples: [...new Set(examples)].slice(0, 3) // Remove duplicates and limit to 3
      });
    }
  }

  return results.sort((a, b) => b.occurrences - a.occurrences);
}

// Helper function to generate recommendations
function generateRecommendations(interview: any, skills: any[]) {
  const recommendations = [];

  // Overall score recommendation
  if (interview.score) {
    if (interview.score >= 80) {
      recommendations.push({
        type: 'positive',
        text: 'Overall performance is excellent. Consider moving forward with this candidate.'
      });
    } else if (interview.score >= 60) {
      recommendations.push({
        type: 'neutral',
        text: 'Performance is satisfactory. Consider a follow-up interview to clarify specific areas.'
      });
    } else {
      recommendations.push({
        type: 'negative',
        text: 'Performance is below expectations. Additional training or practice recommended before proceeding.'
      });
    }
  }

  // Skill-specific recommendations
  skills.forEach(skill => {
    if (skill.score < 60) {
      recommendations.push({
        type: 'negative',
        text: `Focus on improving ${skill.name.toLowerCase()} skills, which scored below average.`
      });
    } else if (skill.score >= 80) {
      recommendations.push({
        type: 'positive',
        text: `Strong performance in ${skill.name.toLowerCase()}, which is a key strength.`
      });
    }
  });

  // Add generic recommendations if we don't have enough
  if (recommendations.length < 3) {
    recommendations.push({
      type: 'neutral',
      text: 'Review the detailed feedback for specific improvement suggestions.'
    });
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
