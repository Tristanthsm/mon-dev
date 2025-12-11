
import { NextResponse } from 'next/server';
import { analyzeYouTubeTrends } from '@/lib/ai/youtube-analysis';

export async function POST(req: Request) {
    try {
        const { videos } = await req.json();

        if (!videos || !Array.isArray(videos)) {
            return NextResponse.json({ error: "Invalid videos data." }, { status: 400 });
        }

        // Simplify data for AI to save tokens
        const simplifiedVideos = videos.slice(0, 20).map((v: any) => ({
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            views: v.statistics.viewCount
        }));

        const analysis = await analyzeYouTubeTrends(simplifiedVideos);

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
