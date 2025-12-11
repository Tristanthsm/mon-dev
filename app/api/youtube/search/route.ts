
import { NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const order = (searchParams.get('order') as any) || 'relevance';

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        const client = new YouTubeClient();
        const videos = await client.searchVideos(query, 10, order);
        return NextResponse.json({ videos });
    } catch (error: any) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
