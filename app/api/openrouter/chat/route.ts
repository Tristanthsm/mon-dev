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

    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

    // Parse SSE stream and extract text content
    const reader = openrouterRes.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;

              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6);
                  const data = JSON.parse(jsonStr);
                  const content = data.choices?.[0]?.delta?.content;

                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing SSE chunk:', e);
                }
              }
            }
          }
        } catch (err) {
          console.error('Stream reading error:', err);
          controller.error(err);
        } finally {
          controller.close();
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
    console.error('OpenRouter proxy error:', err);
    return new Response(`OpenRouter error: ${err.message || 'Unknown error'}`, { status: 500 });
  }
}
