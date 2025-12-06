import type { GrowthAgent } from './types';

export const growthAgent: GrowthAgent = {
    platform: 'youtube',
    title: 'YouTube',
    description: 'Tutoriels, Shorts, playlists, optimisation SEO et watch time.',
    capabilities: ['content', 'hooks', 'schedule', 'analytics', 'trends'],
    async run({ message, action }) {
        return [
            `▶️ YouTube — ${action ?? 'script/Short'}`,
            `• Angle: ${message}`,
            '• Hook 0-5s, chapitres courts, CTA soft',
            '• Shorts: 15-45s, 1 idée, rythme + sous-titres',
            '⚠️ Publication via API YouTube uniquement, pas d’automatisation web.',
        ].join('\n');
    },
};
