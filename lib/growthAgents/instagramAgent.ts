import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'instagram',
    title: 'Instagram',
    description: 'Carrousels, reels, collaborations et calendrier éditorial.',
    capabilities: ['content', 'hooks', 'schedule', 'analytics', 'trends'],
    async run({ message, action }) {
        return [
            `📸 Instagram — ${action ?? 'carrousel/reel'}`,
            `• Idée: ${message}`,
            '• Reel: hook <2s, 3 scènes, CTA en overlay',
            '• Carrousel: 8 slides, hook slide 1, preuves 2-6, CTA 7-8',
            '⚠️ Poster via Instagram Graph API, jamais par automatisation web.',
        ].join('\n');
    },
};
