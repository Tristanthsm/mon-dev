import { NextResponse } from 'next/server';
import { dispatchGrowth, listAgents } from '@/lib/growth/dispatcher';
import type { GrowthAction } from '@/lib/growthAgents/types';

export const runtime = 'edge';

export async function GET() {
    return NextResponse.json({ agents: listAgents().map((a) => ({ platform: a.platform, title: a.title })) });
}

export async function POST(req: Request) {
    try {
        const { platform, message, action } = await req.json();
        if (!platform || !message) {
            return NextResponse.json({ error: 'platform et message sont requis' }, { status: 400 });
        }
        const result = await dispatchGrowth({ platform, message, action: action as GrowthAction | undefined });
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message ?? 'Erreur inconnue' }, { status: 500 });
    }
}
