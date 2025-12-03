/**
 * /api/ai/chat - Unified chat endpoint
 * Routes to appropriate model, logs to Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/lib/agents/chat';
import { ChatRequest, ChatResponse } from '@/lib/agents/types';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest;
    const { message, allowAdvancedAI, userId } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid message: must be non-empty string' },
        { status: 400 }
      );
    }

    if (typeof allowAdvancedAI !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid allowAdvancedAI: must be boolean' },
        { status: 400 }
      );
    }

    // Process chat
    console.log('[API] Processing chat request...');
    const response: ChatResponse = await processChat({
      message,
      allowAdvancedAI,
      userId,
    });

    // Log to Supabase if userId provided
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
          // Don't fail the request if logging fails
        }
      } catch (err) {
        console.error('[Supabase] Exception during logging:', err);
        // Continue anyway
      }
    }

    console.log(`[API] Chat complete | model: ${response.modelUsed} | uncensored: ${response.isUncensored}`);

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
