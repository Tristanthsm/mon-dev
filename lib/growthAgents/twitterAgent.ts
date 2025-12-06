import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'twitter',
    title: 'Twitter / X',
    description: 'Threads viraux, hooks courts, réponses ciblées, hashtags et calendrier éditorial.',
    capabilities: ['content', 'hooks', 'analytics', 'schedule', 'trends', 'responses'],
    async run({ message, action }) {
        return [
            `🎯 Twitter/X — objectif: ${action ?? 'contenu'}`,
            `• Angle: focus value + hook en 2 lignes`,
            `• Idée de thread: ${message}`,
            '• Checklist: hashtags niche + CTA clair + rythme 1/4/7',
            '⚠️ Pas de post auto sans API officielle.',
        ].join('\n');
    },
};
