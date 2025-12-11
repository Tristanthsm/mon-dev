import { getAgent } from '@/lib/agents/orchestrator';
import { ScrapedData } from '@/lib/rebuilder/scraper';

export interface WebsiteAnalysis {
    structure_summary: string;
    design_system: {
        colors: { name: string; hex: string; usage: string }[];
        fonts: { family: string; usage: string }[];
        vibe: string;
    };
    sections: {
        type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'footer' | 'header' | 'cta' | 'content';
        title: string;
        content_summary: string;
        suggested_modernization: string;
    }[];
}

/**
 * Step 1: Analyze the raw HTML/Structure to extract a clean JSON Plan
 */
export async function analyzeWebsiteStructure(data: ScrapedData): Promise<WebsiteAnalysis> {
    const prompt = `
    You are an Expert UI/UX Architect. Your goal is to analyze a raw HTML scrape and reverse-engineer the "Design DNA" and "Content Structure" of the website.
    
    WEBSITE CONTEXT:
    - URL: ${data.url}
    - Title: ${data.title}
    - Description: ${data.description}
    - Major Headings: ${JSON.stringify(data.headings.slice(0, 10))}

    RAW CONTENT SNIPPET:
    ${data.structure.substring(0, 5000)} ... [Truncated]

    TASK:
    1. Identify the Design System (likely colors, vibe, typography style).
    2. Break down the page into logical SECTIONS (Hero, Header, Features, etc.).
    3. For each section, summarize the content and suggest a "Modernization" (how to make it look 2025 Premium SaaS style).

    OUTPUT JSON FORMAT ONLY:
    {
        "structure_summary": "A brief overview...",
        "design_system": {
            "colors": [{"name": "primary", "hex": "#...", "usage": "buttons"}],
            "fonts": [{"family": "Inter", "usage": "body"}],
            "vibe": "Modern, Dark Mode, Corporate..."
        },
        "sections": [
            {
                "type": "hero",
                "title": "Main Hero Section",
                "content_summary": "Headline about X, CTA to Y",
                "suggested_modernization": "Use a large gradient text and glassmorphism cards"
            }
        ]
    }
    `;

    try {
        // We use the 'analyzer' agent (or similar available one) - defaulting to general if not specific
        // Forcing JSON mode often helps context
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://devcockpit.com',
                'X-Title': 'DevCockpit Rebuilder'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat', // Or another high-intelligence model
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            })
        });

        const json = await response.json();
        const content = json.choices[0].message.content;
        return JSON.parse(content);

    } catch (e) {
        console.error("AI Analysis Failed", e);
        throw new Error("Failed to analyze website structure.");
    }
}

/**
 * Step 2: Generate the Single File React Component
 */
export async function generateReactCode(analysis: WebsiteAnalysis): Promise<string> {
    const analysisStr = JSON.stringify(analysis, null, 2);

    const prompt = `
    You are an Elite Frontend Developer specializing in React, TypeScript, Tailwind CSS, and Lucide Icons.
    
    MISSION:
    Rebuild a website based on the following ARCHITECTURE ANALYSIS.
    Create a SINGLE FILE valid React Component (export default function RebuiltSite).
    
    CONSTRAINTS:
    1. **Design**: Use the "design_system" from the analysis. Make it look PREMIUM (2025 SaaS style).
    2. **Stack**: React (Next.js compatible), Tailwind CSS (use arbitrary values if strictly needed, but prefer standard classes), Lucide React icons.
    3. **Content**: Rewrite the content slightly to be generic but realistic (Lorem Ipsum is forbidden, use real "fake" business text).
    4. **Images**: Use placeholder images from 'https://placehold.co/600x400/1e293b/FFF' (you can adjust dimensions).
    5. **Output**: RETURN ONLY THE CODE. NO MARKDOWN WRAPPING like \`\`\`. JUST THE CODE.
    
    ANALYSIS DATA:
    ${analysisStr}

    Ensure the code includes all necessary imports from 'react' and 'lucide-react'.
    The component should be responsive and accessible.
    `;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://devcockpit.com',
                'X-Title': 'DevCockpit Rebuilder Code Gen'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-coder', // Logic/Code optimized model
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const json = await response.json();
        let code = json.choices[0].message.content;

        // Clean up markdown if present
        code = code.replace(/```tsx/g, '').replace(/```/g, '').trim();

        return code;

    } catch (e) {
        console.error("AI Generation Failed", e);
        throw new Error("Failed to generate code.");
    }
}
