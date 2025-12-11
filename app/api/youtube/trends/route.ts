
import { NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || ''; // e.g. 27=Education, 25=News, 24=Entertainment, etc. For Business often 25 or 27.
    const regionCode = searchParams.get('regionCode') || 'FR';

    try {
        const client = new YouTubeClient();
        const videos = await client.getMostPopular(regionCode, categoryId || undefined);

        // Store in DB?
        // Let's store them for tracking history
        const supabase = await createClient();

        // Upsert trends
        if (videos.length > 0) {
            const records = videos.map(v => ({
                video_id: v.id,
                title: v.snippet.title,
                description: v.snippet.description,
                thumbnail_url: v.snippet.thumbnails.medium.url,
                channel_title: v.snippet.channelTitle,
                view_count: parseInt(v.statistics.viewCount),
                like_count: parseInt(v.statistics.likeCount || '0'),
                comment_count: parseInt(v.statistics.commentCount || '0'),
                published_at: v.snippet.publishedAt,
                category_id: v.snippet.categoryId,
                trend_type: categoryId ? `category_${categoryId}` : 'general'
            }));

            const { error } = await supabase.from('youtube_trends' as any).upsert(records, { onConflict: 'video_id', ignoreDuplicates: true }); // Ideally we want to track snapshots over time, but for now simple upsert or insert-only. 
            // If we want snapshots, we shouldn't use video_id as unique primary key, or use a separate snapshots table.
            // Given the schema: id is uuid, video_id is text. Upsert on id? No.
            // Let's just insert new records for "history" or update existing ones?
            // User wants "veille", so seeing evolution is good. BUT avoiding clutter.
            // Let's just return live data for now and save it for AI analysis.
        }

        return NextResponse.json({ videos });
    } catch (error: any) {
        console.error("Trends API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
