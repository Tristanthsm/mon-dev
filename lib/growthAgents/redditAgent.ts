import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'reddit',
    title: 'Reddit',
    description: 'Posts et commentaires adaptés à chaque subreddit, karma growth safe.',
    capabilities: ['content', 'hooks', 'trends', 'analytics', 'responses'],
    async run({ message, action }) {
        return [
            `👽 Reddit — ${action ?? 'plan de post'}`,
            '• Subreddits: r/Entrepreneur, r/SaaS, r/SideProject, r/marketing, r/indiehackers',
            `• Angle: ${message}`,
            '• Règles: valeur > autopromo, CTA discret, ton communautaire.',
            '⚠️ Pas de bots de vote/follow/DM. Respect des CGU et API Reddit.',
        ].join('\n');
    },
};
