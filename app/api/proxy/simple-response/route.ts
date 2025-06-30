import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple AI response endpoint that doesn't require authentication
 * This replaces the Express server route /api/proxy/simple-response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log("Sending prompt to Gemini API:", prompt);

    // Call Gemini API directly with the model that works for question generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);

      return NextResponse.json(
        {
          error: 'Gemini API error',
          message: errorData.error?.message || 'Error calling Gemini API',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Unexpected Gemini API response format:', data);
      return NextResponse.json(
        {
          error: 'Unexpected response format',
          message: 'The Gemini API returned an unexpected response format',
          details: data
        },
        { status: 500 }
      );
    }

    console.log('Gemini API response received successfully');

    // Return a simplified response format
    return NextResponse.json({
      text,
      model: 'gemini-2.0-flash',
      originalResponse: data
    });
  } catch (error: any) {
    console.error('Error in simple AI response:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
