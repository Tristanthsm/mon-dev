
import { NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/youtube/client';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('id');

    if (!channelId) {
        return NextResponse.json({ error: "Channel ID is required" }, { status: 400 });
    }

    try {
        const client = new YouTubeClient();
        const channel = await client.getChannelStats(channelId);

        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        return NextResponse.json({ channel });
    } catch (error: any) {
        console.error("Channel API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
