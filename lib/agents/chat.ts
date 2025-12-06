/**
 * Dual-model AI router: automatically chooses between GPT-4 and Dolphin Mistral
 * Based on request content analysis and user permissions
 */

import { ChatRequest, ChatResponse } from './types';

/**
 * Analyze if a request needs advanced/uncensored AI
 * Simple heuristics: check for keywords that might need less restrictions
 */
function analyzeRequestNeedsAdvancedAI(message: string): boolean {
  const lowerMsg = message.toLowerCase();

  // Keywords that might benefit from uncensored model
  const advancedKeywords = [
    'controversial',
    'taboo',
    'explicit',
    'restricted',
    'sensitive',
    'uncensored',
    'no filter',
    'raw',
    'unfiltered',
    'adult',
    'mature',
    'explicit content',
    'nsfw',
  ];

  // Check if message contains any advanced keywords
  return advancedKeywords.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Call OpenRouter API with GPT-4 model (standard, censored)
 */
async function callGPT4(message: string): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

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
        model: 'openai/gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT-4 API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      modelUsed: 'gpt-4',
      isUncensored: false,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error('GPT-4 error:', error);
    throw error;
  }
}

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';
/**
 * Call OpenRouter API with Dolphin Mistral (uncensored)
 * Model: cognitivecomputations/dolphin-mistral-24b-venice-edition:free
 */
async function callDolphinMistral(message: string): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

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
        model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Dolphin error, falling back to GPT-4:', error);
      // Fallback to GPT-4 if Dolphin fails
      return callGPT4(message);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      modelUsed: 'dolphin-mistral',
      isUncensored: true,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Dolphin Mistral error, falling back to GPT-4:', error);
    // Fallback to GPT-4
    return callGPT4(message);
  }
}

/**
 * Main function: processes chat request and routes to appropriate model
 * 
 * Decision logic:
 * 1. If allowAdvancedAI is false → always use GPT-4
 * 2. If allowAdvancedAI is true AND message suggests advanced AI → try Dolphin, fallback to GPT-4
 * 3. Otherwise → use GPT-4
 */
export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  const { message, allowAdvancedAI } = request;

  // Analyze if message needs advanced AI
  const needsAdvancedAI = analyzeRequestNeedsAdvancedAI(message);

  // Decide which model to use
  const useUncensored = allowAdvancedAI && needsAdvancedAI;

  console.log(`[Chat Router] message: "${message.substring(0, 50)}..." | needsAdvanced: ${needsAdvancedAI} | allowAdvanced: ${allowAdvancedAI} | useUncensored: ${useUncensored}`);

  if (useUncensored) {
    return callDolphinMistral(message);
  } else {
    return callGPT4(message);
  }
}
