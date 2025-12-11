
import { createClient } from '@/lib/supabase/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- TYPES ---
export interface VideoStrategyAnalysis {
    why_it_works: string[];
    hooks_to_model: string[];
    content_structure: string;
    cta_strategy: string;
    summary: string;
}

export interface NicheAnalysis {
    opportunity_score: number; // 0-100
    competition_verdict: string;
    content_gap: string;
    video_ideas: { title: string; format: 'Short' | 'Long'; angle: string }[];
}

export interface ChannelAnalysis {
    persona_breakdown: string;
    winning_formats: string[];
    posting_strategy: string;
    replication_tips: string[];
}

// --- HELPER FOR OPENROUTER ---
async function callAI(systemPrompt: string, userPrompt: string, model: string = "deepseek/deepseek-chat") {
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "YouTube Creator Hub"
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" } // Force JSON for easier parsing
        })
    });

    if (!response.ok) throw new Error(`AI Error: ${response.statusText}`);
    const data = await response.json();
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.error("JSON Parse Error", data.choices[0].message.content);
        return null;
    }
}

// --- MAIN FUNCTIONS ---

/**
 * Analyzes a SINGLE video to understand its virality.
 */
export async function analyzeVideoStrategy(video: { title: string; channel: string; views: string; description: string }): Promise<VideoStrategyAnalysis | null> {
    const system = `You are an expert YouTube Strategist. You analyze viral videos to explain WHY they work and HOW to copy them. Return JSON only.`;
    const prompt = `
    Analyze this video:
    Title: "${video.title}"
    Channel: "${video.channel}"
    Views: ${video.views}
    Description Snippet: "${video.description.slice(0, 300)}..."

    Provide a strategic breakdown in French (JSON format):
    {
        "why_it_works": ["point 1", "point 2", "point 3"],
        "hooks_to_model": ["Specific phrasing style used in title", "Psychological trigger used"],
        "content_structure": "Brief description of likely structure (e.g. Story -> Conflict -> Resolution)",
        "cta_strategy": "How they likely drive engagement",
        "summary": "1 sentence takeaway"
    }
    `;

    return await callAI(system, prompt);
}

/**
 * Analyzes a KEYWORD/NICHE to find opportunities.
 */
export async function analyzeNicheOpportunity(keyword: string, topVideos: { title: string; views: string }[]): Promise<NicheAnalysis | null> {
    const system = `You are a Market Research Expert for YouTube. Identify Blue Ocean opportunities. Return JSON only.`;
    const videoList = topVideos.map(v => `- ${v.title} (${v.views})`).join('\n');

    const prompt = `
    Keyword: "${keyword}"
    Top 5 Videos currently:
    ${videoList}

    Analyze the saturation and opportunity. Return French JSON:
    {
        "opportunity_score": 0-100 (integer, high = good opportunity),
        "competition_verdict": "Faible/Moyenne/Elevée/Saturée",
        "content_gap": "What is missing? What angle is under-exploited?",
        "video_ideas": [
            { "title": "Proposed Title 1", "format": "Short/Long", "angle": "Why this angle?" },
            { "title": "Proposed Title 2", "format": "Short/Long", "angle": "Why this angle?" },
            { "title": "Proposed Title 3", "format": "Short/Long", "angle": "Why this angle?" }
        ]
    }
    `;

    return await callAI(system, prompt);
}
