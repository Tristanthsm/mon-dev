import { NextRequest, NextResponse } from 'next/server';
import { orchestrateAgents } from '@/lib/agents/orchestrator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, history, forcedAgentId } = body;

        // Verify API Key
        const apiKey = process.env.OPENROUTER_API_KEY;
        console.log('[API] OpenRouter Key present:', !!apiKey, apiKey ? `(starts with ${apiKey.substring(0, 8)}...)` : '');

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const responses = await orchestrateAgents(message, history || [], forcedAgentId);

        return NextResponse.json({ responses });
    } catch (error) {
        console.error('[API] Chat error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
