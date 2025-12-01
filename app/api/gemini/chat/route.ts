import type { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat();

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

    // Restart chat with history if any
    if (cleanHistory.length > 0) {
      const lastIsUser = cleanHistory[cleanHistory.length - 1].role === 'user';
      const historyToUse = lastIsUser ? cleanHistory : cleanHistory;
      const newChat = model.startChat({ history: historyToUse });
      const result = await newChat.sendMessageStream(message);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
        }
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fullText));
          controller.close();
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
    } else {
      // First message, no history
      const result = await chat.sendMessageStream(message);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
        }
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fullText));
          controller.close();
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
    }
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return new Response(`Gemini error: ${err.message || 'Unknown error'}`, { status: 500 });
  }
}
