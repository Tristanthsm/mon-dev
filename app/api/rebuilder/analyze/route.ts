
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scrapeWebsite } from '@/lib/rebuilder/scraper';
import { analyzeWebsiteStructure, generateReactCode } from '@/lib/ai/rebuilder';

export const maxDuration = 60; // Allow longer timeout for Vercel/Next

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const supabase = await createClient(); // Await the promise

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape
        const scrapedData = await scrapeWebsite(url);
        if (!scrapedData) {
            return NextResponse.json({ error: 'Failed to scrape website' }, { status: 500 });
        }

        // 2. AI Analysis
        const analysis = await analyzeWebsiteStructure(scrapedData);

        // 3. AI Generation (Chained immediately for "One Click" effect requested by user)
        const generatedCode = await generateReactCode(analysis);

        // 4. Save to DB
        // Get User
        const { data: { user } } = await supabase.auth.getUser();

        const { data: project, error: dbError } = await supabase
            .from('rebuild_projects' as any)
            .insert({
                target_url: url,
                user_id: user?.id,
                status: 'completed',
                analysis_json: analysis,
                generated_code: generatedCode
            })
            .select()
            .single();

        if (dbError) {
            console.error("DB Error", dbError);
            return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            projectId: (project as any).id,
            analysis,
            code: generatedCode
        });

    } catch (error) {
        console.error('Rebuilder API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
