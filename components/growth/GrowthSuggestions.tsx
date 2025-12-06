'use client';

import React from 'react';

export default function GrowthSuggestions({
    items,
    onSelect,
}: {
    items: { title: string; description: string; platform?: string }[];
    onSelect: (text: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Suggestions rapides</p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">IA ready</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <button
                        key={item.title}
                        onClick={() => onSelect(item.title)}
                        className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-left text-sm text-slate-200 transition hover:border-amber-400/30 hover:bg-slate-900"
                    >
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                        {item.platform && <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-amber-200">{item.platform}</p>}
                    </button>
                ))}
            </div>
        </div>
    );
}
