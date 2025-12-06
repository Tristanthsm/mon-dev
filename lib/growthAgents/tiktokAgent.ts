import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'tiktok',
    title: 'TikTok',
    description: 'Scripts 6–15s, hooks CTR, cuts et pattern interruption.',
    capabilities: ['content', 'hooks', 'trends', 'schedule'],
    async run({ message, action }) {
        return [
            `🎬 TikTok — ${action ?? 'script court'}`,
            `• Hook x10: ${message}`,
            '• Structure: hook (0-2s) → preuve rapide → CTA',
            '• Pattern: jump cut + zoom + sous-titres auto',
            '⚠️ Publication via API uniquement. Pas de post auto par navigateur.',
        ].join('\n');
    },
};
