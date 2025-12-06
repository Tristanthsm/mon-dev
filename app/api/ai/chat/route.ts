/**
 * /api/ai/chat - Unified chat endpoint
 * Routes to appropriate model, logs to Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/lib/agents/chat';
import { ChatRequest, ChatResponse } from '@/lib/agents/types';
import { createClient } from '@/lib/supabase/server';

// Extend ChatRequest to include mode
interface ExtendedChatRequest extends ChatRequest {
  mode?: 'general' | 'expert' | 'architect' | 'debug';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ExtendedChatRequest;
    const { message, allowAdvancedAI, userId, mode = 'general' } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid message: must be non-empty string' },
        { status: 400 }
      );
    }

    // Process chat
    console.log(`[API] Processing chat request... Mode: ${mode}`);

    // In a real implementation, we would pass the 'mode' to processChat to adjust the system prompt.
    // For now, we'll append a mode instruction to the user message to simulate this behavior
    // without modifying the deep internals of 'processChat' if it doesn't support it yet.
    let adjustedMessage = message;
    if (mode !== 'general') {
      const modePrompts = {
        expert: "You are a Code Expert. Focus on performance, best practices, and clean code. Be concise and technical.",
        architect: "You are a System Architect. Focus on high-level design, patterns, scalability, and structure.",
        debug: "You are a Debugging Assistant. Analyze the error or issue, propose specific fixes, and explain the root cause."
      };
      adjustedMessage = `[SYSTEM: ${modePrompts[mode]}]\n\nUser Message: ${message}`;
    }

    const response: ChatResponse = await processChat({
      message: adjustedMessage,
      allowAdvancedAI: allowAdvancedAI ?? true,
      userId,
    });

    // Log to Supabase ONLY if userId provided and client can be created
    if (userId) {
      try {
        const supabase = createClient();

        const { error: logError } = await supabase.from('ai_conversations').insert({
          user_id: userId,
          message,
          response: response.content,
          model_used: response.modelUsed,
          is_uncensored: response.isUncensored,
          created_at: new Date().toISOString(),
        });

        if (logError) {
          console.error('[Supabase] Logging error:', logError);
        }
      } catch (err) {
        console.error('[Supabase] Exception during logging (likely no configured client):', err);
        // Continue anyway - we are in standalone mode
      }
    }

    console.log(`[API] Chat complete | model: ${response.modelUsed} | mode: ${mode}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Chat API is running',
  });
}
