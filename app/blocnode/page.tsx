'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, StickyNote, Save, ArrowLeft } from 'lucide-react';

interface Draft {
    title: string;
    content: string;
    tag: string;
}

const initialDraft: Draft = { title: '', content: '', tag: '' };

export default function BlocNodePage() {
    const [draft, setDraft] = useState<Draft>(initialDraft);
    const [saved, setSaved] = useState<{ title: string; tag: string } | null>(null);

    const handleSave = () => {
        if (!draft.title.trim() && !draft.content.trim()) return;
        setSaved({ title: draft.title || 'Sans titre', tag: draft.tag });
        // Branche Supabase ici : insert into blocnode_notes
        setDraft(initialDraft);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
                <header className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">BlocNode</p>
                        <h1 className="text-3xl font-bold text-white">Carnet d’idées relié à Supabase</h1>
                        <p className="text-slate-400 text-sm">
                            Notes, idées, hooks ou scripts. Chaque entrée pourra être stockée dans Supabase (table blocnode_notes).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Accueil
                        </Link>
                        <Link
                            href="/growth"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
                        >
                            GrowthHacking
                        </Link>
                    </div>
                </header>

                <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <StickyNote className="h-4 w-4" />
                            Nouvelle note
                        </div>
                        <input
                            type="text"
                            value={draft.title}
                            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                            placeholder="Titre ou idée principale"
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={draft.tag}
                            onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
                            placeholder="Tag / contexte (ex: reddit, vidéo, produit)"
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
                        />
                        <textarea
                            value={draft.content}
                            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                            placeholder="Corps de la note, script, checklist..."
                            rows={10}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
                            >
                                <Save className="h-4 w-4" />
                                Enregistrer (via Supabase)
                            </button>
                            <button
                                onClick={() => setDraft(initialDraft)}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-white/20"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Réinitialiser
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            À brancher : insertion dans la table blocnode_notes (user_id, title, content, tag, created_at).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
                            <p className="text-sm font-semibold text-white">Organisation</p>
                            <ul className="mt-2 space-y-1 text-sm text-slate-300">
                                <li>• Notes versionnées (updated_at)</li>
                                <li>• Tag libre pour filtrer</li>
                                <li>• Liées à l’utilisateur (user_id)</li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
                            <p className="text-sm font-semibold text-white">Connexion IA</p>
                            <p className="mt-1 text-xs text-slate-400">
                                Vous pourrez appeler l’IA pour résumer une note, générer des hooks ou préparer un post Reddit/TikTok/LinkedIn.
                            </p>
                        </div>
                        {saved && (
                            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                                Note enregistrée (mock) : <strong>{saved.title}</strong> {saved.tag && `#${saved.tag}`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
