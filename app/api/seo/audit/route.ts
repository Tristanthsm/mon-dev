import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performTechnicalAudit } from '@/lib/seo/audit';
import { generateAuditSummary } from '@/lib/ai/seo';

export const maxDuration = 60; // Allow longer execution

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Perform Technical Audit
        let auditResult;
        try {
            auditResult = await performTechnicalAudit(url);
        } catch (e: any) {
            return NextResponse.json({ error: `Audit failed: ${e.message}` }, { status: 500 });
        }

        // 2. AI Analysis
        const aiAnalysis = await generateAuditSummary(auditResult.data, auditResult.issues, auditResult.score);

        // 3. Save to DB
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const fullReport = {
            ...auditResult,
            ai: aiAnalysis
        };

        const { data: savedAudit, error: dbError } = await supabase
            .from('seo_audits' as any)
            .insert({
                url: url,
                score: auditResult.score,
                status: 'completed',
                report: fullReport,
                user_id: user?.id
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB Save Error:', dbError);
            // We don't block the response if save fails, but we should log it
        }

        return NextResponse.json({
            success: true,
            audit: fullReport,
            id: (savedAudit as any)?.id
        });

    } catch (error: any) {
        console.error('SEO Audit API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
