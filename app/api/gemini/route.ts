import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API Key exists:', apiKey ? 'Yes' : 'No');
    console.log('API key length:', apiKey?.length);
    console.log('API key first 4 chars:', apiKey?.substring(0, 4));
    console.log('API key last 4 chars:', apiKey?.substring(apiKey.length - 4));

    // Check if API key is defined
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return NextResponse.json(
        {
          error: 'API key not configured',
          message: 'Please add your Gemini API key to the .env file. Get your key from: https://makersuite.google.com/app/apikey'
        },
        { status: 500 }
      );
    }

    console.log("Sending prompt to Gemini API directly:", prompt);

    // Use the model that we know works: gemini-2.0-flash
    console.log("Using model: gemini-2.0-flash with API version v1beta");

    // Call Gemini API with the working model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    console.log(`Using API URL: ${apiUrl}`);

    const response = await fetch(
      apiUrl,
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
      let errorData;
      let errorText;

      try {
        // Try to get the response as JSON first
        errorData = await response.json();
        console.error("Gemini API error (JSON):", errorData);
      } catch (e) {
        // If response is not JSON, get the text
        try {
          errorText = await response.text();
          console.error("Gemini API error (text):", errorText);
          errorData = { message: errorText || 'Failed to parse error response' };
        } catch (textError) {
          console.error("Failed to read error response:", textError);
          errorData = { message: `Error with status ${response.status}` };
        }
      }

      // Extract the specific error message if available
      const errorMessage =
        errorData?.error?.message ||
        errorData?.message ||
        errorText ||
        `API error with status ${response.status}`;

      return NextResponse.json(
        {
          error: 'Gemini API error',
          message: errorMessage,
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
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}