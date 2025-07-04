import { GoogleGenerativeAI } from "@google/generative-ai";
import { Anthropic } from "@anthropic-ai/sdk";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize Claude API
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY || "" });

/**
 * Distributes AI requests between Gemini and Claude to avoid hitting rate limits
 * @param prompt The prompt to send to the AI
 * @param options Configuration options
 * @returns The AI response
 */
export async function generateAIContent(
  prompt: string,
  options: {
    preferredProvider?: "gemini" | "claude" | "auto";
    maxRetries?: number;
    initialDelay?: number;
  } = {}
) {
  const {
    preferredProvider = "auto",
    maxRetries = 3,
    initialDelay = 2000
  } = options;

  // Determine which provider to use
  let provider = preferredProvider;
  
  if (provider === "auto") {
    // Simple round-robin distribution based on a random number
    // This ensures roughly 50/50 distribution between providers
    provider = Math.random() < 0.5 ? "gemini" : "claude";
  }

  // Try the preferred provider first
  try {
    if (provider === "gemini") {
      return await generateWithGemini(prompt, maxRetries, initialDelay);
    } else {
      return await generateWithClaude(prompt, maxRetries, initialDelay);
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    
    // If the preferred provider fails, try the other one
    try {
      if (provider === "gemini") {
        console.log("Falling back to Claude API");
        return await generateWithClaude(prompt, maxRetries, initialDelay);
      } else {
        console.log("Falling back to Gemini API");
        return await generateWithGemini(prompt, maxRetries, initialDelay);
      }
    } catch (fallbackError) {
      console.error("Both AI providers failed:", fallbackError);
      throw new Error("Failed to generate content with any AI provider");
    }
  }
}

/**
 * Generates content using Google's Gemini API
 */
async function generateWithGemini(
  prompt: string,
  maxRetries: number,
  initialDelay: number
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini API attempt ${attempt} of ${maxRetries}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`Successfully generated content with Gemini on attempt ${attempt}`);
      return text;
    } catch (error: any) {
      console.error(`Error on Gemini attempt ${attempt}:`, error.message);

      // Check if this is a service overload error
      const isOverloaded = error.message && (
        error.message.includes("overloaded") ||
        error.message.includes("503") ||
        error.message.includes("Service Unavailable")
      );

      // If we've reached max retries or it's not an overload error, rethrow
      if (attempt >= maxRetries || !isOverloaded) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying Gemini in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Failed to generate content with Gemini after multiple attempts");
}

/**
 * Generates content using Anthropic's Claude API
 */
async function generateWithClaude(
  prompt: string,
  maxRetries: number,
  initialDelay: number
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Claude API attempt ${attempt} of ${maxRetries}`);
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      });
      console.log(`Successfully generated content with Claude on attempt ${attempt}`);
      return response.content[0].text;
    } catch (error: any) {
      console.error(`Error on Claude attempt ${attempt}:`, error.message);
      
      // If we've reached max retries, rethrow
      if (attempt >= maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying Claude in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Failed to generate content with Claude after multiple attempts");
}

/**
 * Parses JSON from AI response text, handling various formats
 */
export function parseJsonFromAIResponse(text: string): any {
  // Log the raw response for debugging
  console.log("Raw AI response:", text.substring(0, 500) + (text.length > 500 ? '...' : ''));

  // Extract JSON if it's wrapped in markdown code blocks
  let jsonText = text;

  // Try different patterns to extract JSON
  if (text.includes("```json")) {
    console.log("Found ```json pattern");
    jsonText = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    console.log("Found ``` pattern");
    jsonText = text.split("```")[1].split("```")[0].trim();
  } else if (text.includes("[") && text.includes("]")) {
    // Try to extract JSON array directly
    console.log("Trying to extract JSON array directly");
    const startIdx = text.indexOf("[");
    const endIdx = text.lastIndexOf("]") + 1;
    if (startIdx >= 0 && endIdx > startIdx) {
      jsonText = text.substring(startIdx, endIdx);
    }
  }

  console.log("Extracted JSON text:", jsonText.substring(0, 500) + (jsonText.length > 500 ? '...' : ''));

  // Try to parse the JSON
  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Initial JSON parsing failed:", parseError);

    // Try to clean the JSON text and parse again
    const cleanedText = jsonText
      .replace(/(\r\n|\n|\r)/gm, "") // Remove newlines
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();

    console.log("Cleaned JSON text:", cleanedText.substring(0, 500) + (cleanedText.length > 500 ? '...' : ''));

    // Try parsing again
    return JSON.parse(cleanedText);
  }
}