import { ChatRequest, ChatResponse } from './types';

// Using DeepSeek V3 via OpenRouter (very cheap/performant)
export const DEFAULT_MODEL = 'deepseek/deepseek-chat';

/**
 * Call OpenRouter API with DeepSeek as default
 */
async function callDeepSeek(message: string): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dev Cockpit',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      modelUsed: 'deepseek-chat',
      isUncensored: false,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error('DeepSeek error:', error);
    throw error;
  }
}

export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { message, allowAdvancedAI } = request;

  // Use DeepSeek as the primary model
  console.log(`[Chat Router] Using DeepSeek for message: "${message.substring(0, 50)}..."`);
  return callDeepSeek(message);
}
