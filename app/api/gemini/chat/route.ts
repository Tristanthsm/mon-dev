import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build clean history for Gemini (user/model alternating, starting with user)
    let cleanHistory: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        cleanHistory.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.parts?.[0]?.text || h.content || '' }],
        });
      }
    }

    // Start chat with or without history
    const chat = cleanHistory.length > 0
      ? model.startChat({ history: cleanHistory })
      : model.startChat();

    const result = await chat.sendMessageStream(message);
    const encoder = new TextEncoder();

    // Create a stream that sends chunks progressively
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error('Gemini streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return new Response(`Gemini error: ${err.message || 'Unknown error'}`, { status: 500 });
  }
}
