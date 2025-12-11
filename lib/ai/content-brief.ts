export type ContentType = 'blog' | 'landing' | 'youtube';

export interface ContentBrief {
    keyword: string;
    language: string;
    contentType: ContentType;

    // Strategy
    searchIntent: "informationnelle" | "transactionnelle" | "navigationnelle" | "mixte";
    personaCible: string;
    anglePrincipal: string; // The "hook" or unique value proposition

    // Core Content
    h1Propose: string;
    titresAlternatifs: string[];

    plan: {
        h2: string;
        h3?: string[]; // Optional sub-points
        notes?: string; // Guidance for the writer
    }[];

    // SEO Data
    motsClesSecondaires: string[];
    questionsLiees: string[]; // PAA (People Also Ask)
    faq: {
        question: string;
        reponseSynthetique: string;
    }[];

    metaTitle: string;
    metaDescription: string;
    longueurCibleMots: number;

    recommandationsStrategiques: string; // Advice to outrank competitors
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://befood-app.com';

export async function generateContentBrief(keyword: string, contentType: ContentType = 'blog', language: string = 'fr'): Promise<ContentBrief> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is missing');
    }

    const systemPrompt = `Tu es un expert en Content Marketing et SEO senior. 
    Ton but est de générer des briefs de contenu ultra-détaillés et stratégiques pour des rédacteurs ou créateurs.
    
    Format de sortie : JSON uniquement, strictement valide.
    Langue de sortie : ${language === 'fr' ? 'Français' : 'English'}.
    `;

    const userPrompt = `Génère un brief SEO complet pour :
    - Mot-clé principal : "${keyword}"
    - Type de contenu : ${contentType}
    
    CONSIGNES SPÉCIFIQUES SELON TYPE :
    ${contentType === 'blog' ? '- Structure d\'article de blog pédagogique et engageant.\n- Focus sur la profondeur sémantique.' : ''}
    ${contentType === 'landing' ? '- Structure orientée conversion (AIDA/PAS).\n- Focus sur les bénéfices et la preuve sociale.' : ''}
    ${contentType === 'youtube' ? '- Structure de script vidéo (Intro, Hook, Contenu, CTA).\n- Les "H2" sont les chapitres de la vidéo.' : ''}
    
    STRUCTURE JSON ATTENDUE :
    {
        "keyword": "${keyword}",
        "language": "${language}",
        "contentType": "${contentType}",
        "searchIntent": "informationnelle" | "transactionnelle" | "navigationnelle" | "mixte",
        "personaCible": "Description précise du lecteur type",
        "anglePrincipal": "L'angle d'attaque unique pour se différencier",
        "h1Propose": "Titre principal accrocheur",
        "titresAlternatifs": ["Titre variante 1", "Titre variante 2"],
        "plan": [
            { "h2": "Titre de section", "h3": ["sous-point 1", "sous-point 2"], "notes": "Instructions pour le rédacteur" }
        ],
        "motsClesSecondaires": ["mot1", "mot2", "mot3"],
        "questionsLiees": ["question 1", "question 2"],
        "faq": [{ "question": "Q1", "reponseSynthetique": "R1 courte" }],
        "metaTitle": "Titre SEO optimisé (<60 chars)",
        "metaDescription": "Meta description incitative (<160 chars)",
        "longueurCibleMots": 1500,
        "recommandationsStrategiques": "Conseil pour battre la concurrence"
    }
    `;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': 'BeFood SEO Agent'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat', // Fast and good at JSON
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.4, // Creative but structured
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from AI');
        }

        // Clean JSON if needed (sometimes markdown blocks leak)
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('Content Brief Generation Error:', error);
        throw error;
    }
}
