import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple test endpoint to verify the proxy is working
 * This replaces the Express server route /api/proxy/test
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'AI proxy is working!',
    timestamp: new Date().toISOString()
  });
}
