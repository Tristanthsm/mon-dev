import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'linkedin',
    title: 'LinkedIn',
    description: 'Posts pro, storytelling, plan 30 jours et analyse concurrents.',
    capabilities: ['content', 'hooks', 'analytics', 'schedule', 'trends'],
    async run({ message, action }) {
        return [
            `💼 LinkedIn — ${action ?? 'post/story'}`,
            `• Storyline: ${message}`,
            '• Cadre: hook → tension → pivot → leçon → CTA',
            '• Rythme: 3-4 posts/sem + 2 commentaires profonds/jour',
            '⚠️ Publication via API officielle. Pas d’automatisation de connection/follow/DM.',
        ].join('\n');
    },
};
