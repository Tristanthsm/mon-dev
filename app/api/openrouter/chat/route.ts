import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    // Build OpenRouter messages format
    const messages = [
      ...(Array.isArray(history)
        ? history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.parts?.map((p: any) => p.text).join('') }))
        : []),
      { role: 'user', content: message },
    ];

    const openrouterRes = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages,
        stream: true,
      }),
    });

    if (!openrouterRes.ok || !openrouterRes.body) {
      const text = await openrouterRes.text();
      return new Response(text || 'OpenRouter error', { status: openrouterRes.status });
    }

    // Stream the upstream response body directly to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const reader = openrouterRes.body.getReader();
    const decoder = new TextDecoder();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // forward chunk as-is
          await writer.write(value);
        }
      } catch (err) {
        console.error('Error streaming from OpenRouter:', err);
      } finally {
        try {
          await writer.close();
        } catch (e) {}
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('OpenRouter proxy error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}
