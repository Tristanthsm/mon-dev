/**
 * /api/ai/chat - Unified chat endpoint
 * Routes to appropriate model, logs to Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/lib/agents/chat';
import { ChatRequest, ChatResponse } from '@/lib/agents/types';
import { createClient } from '@/lib/supabase/server';

// Extend ChatRequest to include mode and session
interface ExtendedChatRequest extends ChatRequest {
  mode?: 'general' | 'expert' | 'architect' | 'debug';
  sessionId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ExtendedChatRequest;
    const { message, allowAdvancedAI, userId, mode = 'general' } = body;
    let { sessionId } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid message: must be non-empty string' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Handle Session ID (Create if not exists)
    if (userId && !sessionId) {
      const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_sessions')
        .insert({ user_id: userId, title })
        .select('id')
        .single();

      if (sessionError) console.error('Error creating session:', sessionError);
      else sessionId = sessionData.id;
    }

    // 2. Prepare System Prompt with Tool Instructions
    let systemInstruction = `You are a helpful AI Assistant.`;

    // Mode specific instructions
    const modePrompts = {
      expert: "You are a Code Expert. Focus on performance, best practices, and clean code.",
      architect: "You are a System Architect. Focus on high-level design, patterns, scalability, and structure.",
      debug: "You are a Debugging Assistant. Analyze the error or issue, propose specific fixes, and explain the root cause.",
      general: ""
    };
    if (mode !== 'general') systemInstruction += ` ${modePrompts[mode]}`;

    // Tool instructions
    systemInstruction += `\n\nTOOLS AVAILABLE:\n- Create Note: To save a note, output strictly: [CREATE_NOTE: {"title": "Title", "content": "Content"}]`;

    const adjustedMessage = `[SYSTEM: ${systemInstruction}]\n\nUser Message: ${message}`;

    // 3. Call AI
    const response: ChatResponse = await processChat({
      message: adjustedMessage,
      allowAdvancedAI: allowAdvancedAI ?? true,
      userId,
    });

    let finalContent = response.content;
    let toolUsed = false;

    // 4. Parse & Execute Tools
    if (userId) {
      const noteRegex = /\[CREATE_NOTE: ([\s\S]*?)\]/;
      const match = finalContent.match(noteRegex);

      if (match && match[1]) {
        try {
          const noteData = JSON.parse(match[1]);
          // Save Note to DB
          await supabase.from('blocnode_notes').insert({
            user_id: userId,
            title: noteData.title,
            content: noteData.content,
          });

          // Remove tool command from visible response and add confirmation
          finalContent = finalContent.replace(match[0], '').trim();
          finalContent += `\n\n✅ Note créée : "${noteData.title}"`;
          toolUsed = true;
        } catch (e) {
          console.error('Error executing tool:', e);
          finalContent += `\n\n⚠️ Erreur lors de la création de la note.`;
        }
      }
    }

    // 5. Log Conversation
    if (userId && sessionId) {
      try {
        await supabase.from('ai_conversations').insert({
          user_id: userId,
          session_id: sessionId,
          message,
          response: finalContent,
          model_used: response.modelUsed,
          is_uncensored: response.isUncensored,
          created_at: new Date().toISOString(),
        });

        // Update session timestamp
        await supabase.from('ai_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);

      } catch (err) {
        console.error('[Supabase] Logging error:', err);
      }
    }

    console.log(`[API] Chat complete | session: ${sessionId} | toolUsed: ${toolUsed}`);

    return NextResponse.json({ ...response, content: finalContent, sessionId }, { status: 200 });
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
