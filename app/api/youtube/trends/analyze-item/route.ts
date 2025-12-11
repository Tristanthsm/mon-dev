
import { NextResponse } from 'next/server';
import { analyzeVideoStrategy, analyzeNicheOpportunity } from '@/lib/ai/youtube-analysis';

export async function POST(req: Request) {
    try {
        const { type, data } = await req.json();

        if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 });

        let result;

        if (type === 'video') {
            // data should be { title, channel, views, description }
            result = await analyzeVideoStrategy(data);
        } else if (type === 'keyword') {
            // data should be { keyword, topVideos: [] }
            result = await analyzeNicheOpportunity(data.keyword, data.topVideos || []);
        } else {
            return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
        }

        if (!result) return NextResponse.json({ error: "AI failed to generate response" }, { status: 500 });

        return NextResponse.json({ result });

    } catch (error: any) {
        console.error("Analyze Item API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
