import { SeoAuditData, SeoIssue } from '@/lib/seo/audit';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://befood-app.com';

if (!OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY is missing. AI analysis will fail.');
}

/**
 * Uses AI to generate a natural language summary and prioritize recommendations.
 */
export async function generateAuditSummary(auditData: SeoAuditData, issues: SeoIssue[], score: number): Promise<{ summary: string, prioritized_advice: string[] }> {
    if (!OPENROUTER_API_KEY) {
        return {
            summary: "L'analyse IA n'est pas disponible (Clé API manquante).",
            prioritized_advice: ["Corrigez les erreurs critiques identifiées dans le rapport."]
        };
    }

    try {
        const prompt = `
            Tu es un expert SEO senior. Analyse les données techniques suivantes d'une page web et génère un résumé executif court et percutant.
            
            DONNÉES:
            - URL: ${auditData.url}
            - Score Global: ${score}/100
            - Titre: "${auditData.meta.title}" (${auditData.meta.titleLength} chars)
            - Description: "${auditData.meta.description}" (${auditData.meta.descriptionLength} chars)
            - H1: ${auditData.headings.h1Count} (Contenu: ${auditData.headings.h1Content.join(', ')})
            - Mots: ${auditData.content.wordCount}
            - Problèmes (${issues.length}):
            ${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`).join('\n')}

            TACHE:
            1. Rédige un "Résumé Executif" de 3-4 phrases. Sois direct. Si le score est bon, félicite. Si mauvais, alerte.
            2. Donne 3 "Recommandations Prioritaires" concrètes pour augmenter le score rapidement.
            
            FORMAT DE REPONSE JSON:
            {
                "summary": "string",
                "prioritized_advice": ["string", "string", "string"]
            }
        `;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': 'BeFood Dev Cockpit'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful and strict SEO expert AI. You output strict JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('AI SEO Summary - Invalid API Response:', JSON.stringify(data, null, 2));
            throw new Error(`OpenRouter API Error: ${data.error?.message || 'Unknown error'}`);
        }

        const content = data.choices[0].message.content;

        if (!content) throw new Error('No content from AI');

        return JSON.parse(content);

    } catch (error) {
        console.error('AI SEO Summary Error:', error);
        return {
            summary: "L'analyse IA a rencontré une erreur momentanée. Fiez-vous aux données techniques ci-dessous.",
            prioritized_advice: issues.filter(i => i.severity === 'high').map(i => i.title).slice(0, 3)
        };
    }
}
