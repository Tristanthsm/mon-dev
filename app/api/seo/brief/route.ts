import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContentBrief } from '@/lib/ai/content-brief';

export const maxDuration = 60; // Allow longer generation time

export async function POST(req: Request) {
    try {
        const { keyword, contentType, language } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // 1. Generate Brief
        const brief = await generateContentBrief(keyword, contentType || 'blog', language || 'fr');

        // 2. Save to DB
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: savedBrief, error: dbError } = await supabase
            .from('seo_briefs' as any)
            .insert({
                target_keyword: keyword,
                status: 'generated',
                brief_data: brief,
                user_id: user?.id
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB Save Error:', dbError);
            // Non-blocking error
        }

        return NextResponse.json({
            success: true,
            brief,
            id: (savedBrief as any)?.id
        });

    } catch (error: any) {
        console.error('Content Brief API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
