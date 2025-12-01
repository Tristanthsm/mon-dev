import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    // Build OpenRouter messages format
    const messages = [
      ...(Array.isArray(history)
        ? history.map((h: any) => ({ 
            role: h.role === 'user' ? 'user' : 'assistant', 
            content: h.parts?.map((p: any) => p.text).join('') || h.content || '' 
          }))
        : []),
      { role: 'user', content: message },
    ];

    console.log('Calling OpenRouter with messages:', messages);

    const openrouterRes = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dev Cockpit',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free',
        messages,
        stream: true,
      }),
    });

    if (!openrouterRes.ok) {
      const errorText = await openrouterRes.text();
      console.error('OpenRouter error:', openrouterRes.status, errorText);
      return new Response(`OpenRouter error (${openrouterRes.status}): ${errorText}`, { status: openrouterRes.status });
    }

    if (!openrouterRes.body) {
      return new Response('No response body from OpenRouter', { status: 500 });
    }

    // Stream the upstream response body directly to the client
    return new Response(openrouterRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('OpenRouter proxy error:', err);
    return new Response(`OpenRouter error: ${err.message || 'Unknown error'}`, { status: 500 });
  }
}
