import * as cheerio from 'cheerio';

export interface SeoIssue {
    id: string;
    severity: 'high' | 'medium' | 'low' | 'info';
    category: 'technical' | 'content' | 'performance' | 'mobile';
    title: string;
    description: string;
    recommendation: string;
}

export interface SeoAuditData {
    url: string;
    statusCode: number;
    timing: number; // ms
    htmlSize: number; // bytes

    meta: {
        title: string | null;
        titleLength: number;
        description: string | null;
        descriptionLength: number;
        viewport: string | null;
        robots: string | null;
        canonical: string | null;
        charset: string | null;
    };

    headings: {
        h1Count: number;
        h1Content: string[];
        h2Count: number;
        h3Count: number;
        structure: string[]; // Simplistic structure visualization
    };

    content: {
        wordCount: number;
        imageCount: number;
        imagesWithoutAlt: number;
    };

    links: {
        internal: number;
        external: number;
        broken: number; // Placeholder for now, hard to check usually in one go without timeout
    };

    resources: {
        scripts: number;
        styles: number;
    };
}

export async function performTechnicalAudit(url: String): Promise<{ data: SeoAuditData; issues: SeoIssue[]; score: number }> {
    const startTime = Date.now();
    let response: Response;
    let html: string;

    // 1. Fetch
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'BeFood-SEO-Bot/1.0',
                'Accept': 'text/html'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Status ${response.status}`);
        }

        html = await response.text();
    } catch (error: any) {
        throw new Error(`Failed to fetch URL: ${error.message}`);
    }

    const timing = Date.now() - startTime;
    const $ = cheerio.load(html);

    // 2. Extract Data
    const data: SeoAuditData = {
        url: url.toString(),
        statusCode: response.status,
        timing,
        htmlSize: new TextEncoder().encode(html).length,

        meta: {
            title: $('title').first().text() || null,
            titleLength: $('title').first().text().length || 0,
            description: $('meta[name="description"]').attr('content') || null,
            descriptionLength: ($('meta[name="description"]').attr('content') || '').length,
            viewport: $('meta[name="viewport"]').attr('content') || null,
            robots: $('meta[name="robots"]').attr('content') || null,
            canonical: $('link[rel="canonical"]').attr('href') || null,
            charset: $('meta[charset]').attr('charset') || null,
        },

        headings: {
            h1Count: $('h1').length,
            h1Content: $('h1').map((_, el) => $(el).text().trim()).get(),
            h2Count: $('h2').length,
            h3Count: $('h3').length,
            structure: [],
        },

        content: {
            wordCount: $('body').text().split(/\s+/).filter(w => w.length > 0).length,
            imageCount: $('img').length,
            imagesWithoutAlt: $('img:not([alt]), img[alt=""]').length,
        },

        links: {
            internal: $('a[href^="/"], a[href^="' + url + '"]').length,
            external: $('a[href^="http"]:not([href^="' + url + '"])').length,
            broken: 0
        },

        resources: {
            scripts: $('script[src]').length,
            styles: $('link[rel="stylesheet"]').length
        }
    };

    // 3. Analyze & Generate Issues
    const issues: SeoIssue[] = [];
    let scoreParams = { passed: 0, total: 0 };

    const check = (condition: boolean, weight: number, successParams: any, failIssue: SeoIssue | null) => {
        scoreParams.total += weight;
        if (condition) {
            scoreParams.passed += weight;
        } else if (failIssue) {
            issues.push(failIssue);
        }
    };

    // Title
    check(!!data.meta.title && data.meta.titleLength >= 30 && data.meta.titleLength <= 65, 10, {}, {
        id: 'meta-title',
        severity: 'high',
        category: 'content',
        title: 'Balise Title optimisée',
        description: `Le titre fait ${data.meta.titleLength} caractères.`,
        recommendation: 'La longueur idéale est entre 30 et 65 caractères. Assurez-vous qu\'il contient le mot-clé principal.'
    });

    // Description
    check(!!data.meta.description && data.meta.descriptionLength >= 120 && data.meta.descriptionLength <= 160, 8, {}, {
        id: 'meta-desc',
        severity: 'medium',
        category: 'content',
        title: 'Meta Description',
        description: data.meta.description ? `Longueur: ${data.meta.descriptionLength} caractères.` : 'Manquante.',
        recommendation: 'Ajoutez une meta description unique entre 120 et 160 caractères pour améliorer le CTR.'
    });

    // H1
    check(data.headings.h1Count === 1, 10, {}, {
        id: 'h1-count',
        severity: 'high',
        category: 'technical',
        title: 'Balise H1 unique',
        description: `Trouvé ${data.headings.h1Count} balise(s) H1.`,
        recommendation: 'Il doit y avoir exactement un titre H1 par page décrivant le sujet principal.'
    });

    // Images Alt
    check(data.content.imagesWithoutAlt === 0, 5, {}, {
        id: 'img-alt',
        severity: 'medium',
        category: 'accessibility',
        title: 'Texte alternatif des images',
        description: `${data.content.imagesWithoutAlt} image(s) sans attribut alt.`,
        recommendation: 'Ajoutez un texte descriptif (alt) à toutes les images importantes pour le SEO et l\'accessibilité.'
    });

    // HTTPS (via URL check mainly, but fetch worked so it's reachable)
    check(url.toString().startsWith('https'), 5, {}, {
        id: 'https',
        severity: 'high',
        category: 'technical',
        title: 'Sécurisation HTTPS',
        description: 'Le site n\'utilise pas HTTPS par défaut.',
        recommendation: 'Migrez vers HTTPS pour sécuriser les données et éviter d\'être pénalisé par Google.'
    });

    // Viewport
    check(!!data.meta.viewport, 10, {}, {
        id: 'viewport',
        severity: 'high',
        category: 'mobile',
        title: 'Configuration Mobile',
        description: 'Balise meta viewport manquante.',
        recommendation: 'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> pour le responsive.'
    });

    // Word Count
    check(data.content.wordCount > 300, 5, {}, {
        id: 'content-length',
        severity: 'medium',
        category: 'content',
        title: 'Longueur du contenu',
        description: `${data.content.wordCount} mots trouvés.`,
        recommendation: 'Pour le SEO, visez au moins 300-500 mots de contenu unique.'
    });

    // Load Time (approx)
    check(data.timing < 1500, 8, {}, {
        id: 'load-time',
        severity: 'medium',
        category: 'performance',
        title: 'Temps de chargement (Server)',
        description: `La réponse serveur a pris ${data.timing}ms.`,
        recommendation: 'Optimisez le serveur, activez la compression ou utilisez un cache pour descendre sous 800ms.'
    });

    // Calculate Score (Simple percentage weighted)
    const score = Math.round((scoreParams.passed / scoreParams.total) * 100);

    return {
        data,
        issues,
        score
    };
}
