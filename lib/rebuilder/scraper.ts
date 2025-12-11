import * as cheerio from 'cheerio';

export interface ScrapedData {
    url: string;
    title: string;
    description: string;
    headings: { level: string; text: string }[];
    images: { alt: string; src: string }[];
    colors: string[]; // Simplistic extraction
    structure: string; // Simplified HTML structure for the LLM
}

export async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
    try {
        console.log(`[Scraper] Fetching ${url}...`);

        // Validation basique de l'URL
        if (!url.startsWith('http')) {
            throw new Error('URL invalide (doit commencer par http/https)');
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache pendant 1h
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Metadata
        const title = $('title').text().trim() || '';
        const description = $('meta[name="description"]').attr('content') || '';

        // 2. Headings (Structure Hints)
        const headings: { level: string; text: string }[] = [];
        $('h1, h2, h3').each((_, el) => {
            const level = el.tagName.toUpperCase();
            const text = $(el).text().trim();
            if (text.length > 0 && text.length < 100) {
                headings.push({ level, text });
            }
        });

        // 3. Images (For context)
        const images: { alt: string; src: string }[] = [];
        $('img').each((_, el) => {
            const alt = $(el).attr('alt') || '';
            const src = $(el).attr('src') || '';
            if (src && images.length < 5) images.push({ alt, src }); // Limit to top 5
        });

        // 4. Simplified DOM Structure for LLM
        // We remove scripts, styles, svgs to reduce token usage
        $('script').remove();
        $('style').remove();
        $('svg').remove();
        $('link').remove();
        $('noscript').remove();
        $('iframe').remove();
        $('*').removeAttr('class').removeAttr('id').removeAttr('style').removeAttr('data-test-id').removeAttr('data-v-app');

        // Take the body content
        let structure = $('body').html() || '';

        // Truncate if too huge (naive approach)
        if (structure.length > 50000) {
            structure = structure.substring(0, 50000) + '...[TRUNCATED]';
        }

        return {
            url,
            title,
            description,
            headings,
            images,
            colors: [], // Placeholder for now
            structure
        };

    } catch (error) {
        console.error('[Scraper] Error:', error);
        return null;
    }
}
