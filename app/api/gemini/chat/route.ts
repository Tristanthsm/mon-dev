import type { NextRequest } from 'next/server'

// Gemini API route removed. Keep a 410 response to indicate the endpoint is gone.
export async function POST(req: NextRequest) {
  return new Response('Gemini integration removed. Use OpenRouter endpoints instead.', { status: 410 });
}
