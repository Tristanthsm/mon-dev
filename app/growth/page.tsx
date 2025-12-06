'use client';

import React, { useMemo, useState } from 'react';
import { listAgents } from '@/lib/growth/dispatcher';
import GrowthSidebar, { GrowthPlatform } from '@/components/growth/GrowthSidebar';
import GrowthChatWindow from '@/components/growth/GrowthChatWindow';
import GrowthSuggestions from '@/components/growth/GrowthSuggestions';
import PlatformStats from '@/components/growth/PlatformStats';

const suggestions = [
    { title: 'Écris un thread 7 tweets sur notre nouveau SaaS', description: 'Hook + preuves + CTA demo', platform: 'Twitter' },
    { title: 'Génère 10 hooks TikTok pour tester un MVP en 48h', description: 'Formats 6-15s', platform: 'TikTok' },
    { title: 'Prépare un post Reddit value-first pour r/indiehackers', description: 'Story + apprentissage', platform: 'Reddit' },
    { title: 'Plan LinkedIn 30 jours pour passer de 1k à 10k', description: 'Storytelling + carrousels', platform: 'LinkedIn' },
    { title: 'Script YouTube Short 30s sur notre feature phare', description: 'Hook visuel + CTA soft', platform: 'YouTube' },
];

export default function GrowthPage() {
    const platforms: GrowthPlatform[] = useMemo(
        () =>
            listAgents().map((agent) => ({
                id: agent.platform,
                title: agent.title,
                description: agent.description,
            })),
        []
    );

    const [active, setActive] = useState(platforms[0]?.id ?? 'twitter');
    const [queuedPrompt, setQueuedPrompt] = useState<string | undefined>(undefined);

    const handleSend = async ({ platform, message }: { platform: string; message: string }) => {
        const res = await fetch('/api/growth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, message }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Erreur de l’agent');
        }
        const data = await res.json();
        return data.content as string;
    };

    const activePlatform = platforms.find((p) => p.id === active) || platforms[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:grid-cols-[280px,1fr]">
                <div className="lg:sticky lg:top-4 lg:self-start">
                    {activePlatform && (
                        <GrowthSidebar platforms={platforms} activeId={activePlatform.id} onSelect={setActive} />
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Growth OS</p>
                            <h1 className="text-3xl font-bold text-white">Agents IA par plateforme</h1>
                            <p className="mt-2 max-w-2xl text-slate-400">
                                Sélectionne une plateforme pour ouvrir son agent : contenu, hooks, scripts vidéo, planning, tendances, analyse concurrents.
                                Compliance stricte : tout passe par APIs officielles + n8n, jamais par automatisation “web”.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href="/"
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:border-white/20"
                            >
                                ← Retour Accueil
                            </a>
                            <a
                                href="/auth"
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:border-white/20"
                            >
                                Connexion
                            </a>
                        </div>
                    </div>

                    {activePlatform && (
                        <GrowthChatWindow
                            platform={activePlatform}
                            onSend={handleSend}
                            queuedMessage={queuedPrompt}
                            onQueuedHandled={() => setQueuedPrompt(undefined)}
                        />
                    )}

                    <GrowthSuggestions items={suggestions} onSelect={(text) => setQueuedPrompt(text)} />

                    <PlatformStats />
                </div>
            </div>
        </div>
    );
}
