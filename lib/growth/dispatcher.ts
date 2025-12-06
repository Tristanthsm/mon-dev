import { growthAgent as twitter } from '../growthAgents/twitterAgent';
import { growthAgent as tiktok } from '../growthAgents/tiktokAgent';
import { growthAgent as reddit } from '../growthAgents/redditAgent';
import { growthAgent as instagram } from '../growthAgents/instagramAgent';
import { growthAgent as youtube } from '../growthAgents/youtubeAgent';
import { growthAgent as linkedin } from '../growthAgents/linkedinAgent';
import type { GrowthAgent, GrowthAction } from '../growthAgents/types';

const agents: Record<string, GrowthAgent> = {
    twitter,
    tiktok,
    reddit,
    instagram,
    youtube,
    linkedin,
};

export function listAgents(): GrowthAgent[] {
    return Object.values(agents);
}

export async function dispatchGrowth({
    platform,
    message,
    action,
}: {
    platform: string;
    message: string;
    action?: GrowthAction;
}): Promise<{ content: string; platform: string }> {
    const agent = agents[platform];
    if (!agent) {
        throw new Error(`Aucun agent pour la plateforme "${platform}"`);
    }
    const content = await agent.run({ message, action });
    return { content, platform: agent.platform };
}
