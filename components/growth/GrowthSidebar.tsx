'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GrowthPlatform {
    id: string;
    title: string;
    description: string;
}

export default function GrowthSidebar({
    platforms,
    activeId,
    onSelect,
}: {
    platforms: GrowthPlatform[];
    activeId: string;
    onSelect: (id: string) => void;
}) {
    return (
        <aside className="flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Growth marketing</p>
                <p className="text-sm text-slate-400">Choisis une plateforme pour ouvrir son agent dédié.</p>
            </div>
            <div className="flex flex-col gap-2">
                {platforms.map((platform) => (
                    <button
                        key={platform.id}
                        onClick={() => onSelect(platform.id)}
                        className={cn(
                            'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition',
                            activeId === platform.id
                                ? 'border-amber-400/40 bg-amber-500/10 text-white'
                                : 'border-white/5 bg-slate-900/60 text-slate-200 hover:border-white/10 hover:bg-slate-900'
                        )}
                    >
                        <span className="text-sm font-semibold">{platform.title}</span>
                        <span className="text-xs text-slate-400">{platform.description}</span>
                    </button>
                ))}
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3 text-xs text-slate-400">
                ⚠️ Pas de création de comptes ni de posts automatiques hors API officielles. Utilise les connecteurs/API + n8n pour rester compliant.
            </div>
        </aside>
    );
}
