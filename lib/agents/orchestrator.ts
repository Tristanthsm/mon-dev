import { AGENTS, getAgentForQuery, AgentConfig } from './registry';

export interface AgentResponse {
    agentId: string;
    content: string;
    modelUsed: string;
}

export async function orchestrateAgents(
    message: string,
    history: any[],
    forcedAgentId?: string | null
): Promise<AgentResponse[]> {
    let selectedAgents: AgentConfig[] = [];

    if (forcedAgentId && AGENTS[forcedAgentId]) {
        console.log(`[Orchestrator] Forcing agent: ${forcedAgentId}`);
        selectedAgents = [AGENTS[forcedAgentId]];
    } else {
        selectedAgents = getAgentForQuery(message);
        console.log(`[Orchestrator] Selected agents for query "${message}":`, selectedAgents.map(a => a.name));
    }

    // In a real parallel execution environment, we would trigger these simultaneously.
    // For simplicity and to avoid rate limits/complexity in this demo, we'll execute them sequentially 
    // or just pick the most relevant one if we want to save tokens.

    // However, the user asked for collaboration. Let's try to fetch from all selected agents.

    const responses: AgentResponse[] = [];

    for (const agent of selectedAgents) {
        try {
            const response = await callOpenRouter(agent, message, history);
            responses.push(response);
        } catch (error) {
            console.error(`[Orchestrator] Error calling agent ${agent.name}:`, error);
            responses.push({
                agentId: agent.id,
                content: `Error: I could not generate a response. (${error instanceof Error ? error.message : 'Unknown'})`,
                modelUsed: agent.model
            });
        }
    }

    return responses;
}

async function callOpenRouter(agent: AgentConfig, message: string, history: any[]): Promise<AgentResponse> {
    const messages = [
        { role: 'system', content: agent.systemPrompt },
        ...history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
        })),
        { role: 'user', content: message }
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Dev Cockpit AI',
        },
        body: JSON.stringify({
            model: agent.model,
            messages,
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const data = await res.json();
    return {
        agentId: agent.id,
        content: data.choices[0]?.message?.content || 'No content received',
        modelUsed: data.model
    };
}
