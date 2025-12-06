'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, LayoutDashboard, MessageSquare, ShieldCheck, Sparkles, PlugZap, Rocket, UserRound } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { createClient } from '@/lib/supabase/client';

const NAV_TABS = [
    { href: '/', label: 'Accueil' },
    { href: '/growth', label: 'GrowthHacking' },
    { href: '/blocnode', label: 'BlocNode' },
];

const FEATURES = [
    { title: 'Cockpit clair', description: 'Une vue unique pour vos projets, actions rapides et suivi en direct.', icon: LayoutDashboard },
    { title: 'Assistant intégré', description: 'Posez vos questions, forcez un agent ou laissez l’IA choisir.', icon: MessageSquare },
    { title: 'Sécurité prête', description: 'Authentification Supabase, session et statut en un clin d’œil.', icon: ShieldCheck },
];

const STEPS = [
    'Créez un compte ou connectez-vous.',
    'Accédez au tableau de bord pour vos actions clés.',
    'Ouvrez l’assistant IA dès que vous avez une question.',
];

const GROWTH_APPS = [
    { name: 'Twitter / X', hint: 'Threads, hooks, scheduling' },
    { name: 'Reddit', hint: 'Subreddits ciblés, AMAs, UGC' },
    { name: 'YouTube', hint: 'Tutoriels courts, playlists, Shorts' },
    { name: 'TikTok', hint: 'Trames virales, duo, CTA vers landing' },
    { name: 'Instagram', hint: 'Carrousels, reels, collaborations' },
];

export default function HomePage() {
    const supabase = createClient();
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSessionEmail(session?.user?.email ?? null);
        };
        getSession();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/20">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute -left-10 top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold shadow-lg shadow-cyan-500/20">
                            MD
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Mon Dev</p>
                            <p className="text-base font-semibold text-white">Cockpit & IA</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_TABS.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {sessionEmail ? (
                            <Link
                                href="/auth"
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-white/20"
                                title={sessionEmail}
                            >
                                <UserRound className="h-4 w-4" />
                                Compte
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white md:inline-block"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth"
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
                                >
                                    S'inscrire
                                    <ArrowRight size={16} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                <section id="hero" className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
                    <FadeIn className="space-y-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                            <Sparkles size={14} />
                            Parcours simplifié
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                    Votre atelier dev, clair et direct.
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-slate-400">
                                Atterrissez sur une page lisible, retrouvez vos onglets en un coup d’œil et lancez
                                l’assistant IA ou le tableau de bord sans vous perdre.
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                            <Link
                                href="/signup"
                                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
                            >
                                Commencer maintenant
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/ai"
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                            >
                                Essayer l'assistant
                                <MessageSquare size={16} />
                            </Link>
                        </div>
                        <div className="grid gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 shadow-xl backdrop-blur md:grid-cols-3">
                            {FEATURES.map((item) => (
                                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/60 p-4">
                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-200">
                                        <item.icon size={18} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-sm font-semibold text-white">{item.title}</p>
                                        <p className="text-sm text-slate-400">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </section>

                <section id="growth" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Growth</p>
                                <h3 className="text-3xl font-bold text-white">Onglet Growth Hacking</h3>
                                <p className="mt-2 max-w-2xl text-slate-400">
                                    Centralisez vos leviers d’acquisition. Choisissez une plateforme, notez vos campagnes et connectez l’assistant pour rédiger, optimiser ou planifier.
                                </p>
                            </div>
                            <div className="rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                                Experiments ready
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {GROWTH_APPS.map((app) => (
                                <div key={app.name} className="flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-5 transition hover:border-amber-400/30 hover:bg-slate-900">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{app.name}</p>
                                        <p className="mt-2 text-sm text-slate-400">{app.hint}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                        Ajouter une campagne
                                    </div>
                                </div>
                            ))}
                            <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-5 text-center">
                                <p className="text-sm font-semibold text-white">Autre plateforme</p>
                                <p className="mt-2 text-sm text-slate-400">Ajoutez une nouvelle source (newsletter, blog, partenaire...)</p>
                                <div className="mt-4 inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white">
                                    + Ajouter
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <StaggerContainer className="space-y-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Structure</p>
                                <h2 className="text-3xl font-bold text-white">Tout est rangé par onglets</h2>
                                <p className="mt-2 max-w-xl text-slate-400">
                                    La barre supérieure pointe vers chaque section clé. Pas de dédale : vous savez où cliquer pour l’IA, le tableau de bord ou les réglages.
                                </p>
                            </div>
                            <Link href="/growth" className="group inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                                Aller au GrowthHacking
                                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {FEATURES.map((feature, index) => (
                                <StaggerItem key={feature.title} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-200">
                                        <feature.icon size={20} />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                                    <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                        Onglet {index + 1}
                                    </div>
                                </StaggerItem>
                            ))}
                        </div>
                    </StaggerContainer>
                </section>

                <section id="ia" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-10 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40 p-8 shadow-2xl backdrop-blur md:grid-cols-2">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300/80">Assistant</p>
                            <h3 className="text-3xl font-bold text-white">Un onglet IA dédié, sans détour</h3>
                            <p className="text-slate-400">
                                Cliquez sur « Assistant IA » et vous arrivez directement dans la fenêtre de chat. Sélectionnez un agent si besoin,
                                ou laissez le système répondre. Simple, rapide, prêt à coder.
                            </p>
                            <div className="space-y-3">
                                {STEPS.map((step, index) => (
                                    <div key={step} className="flex items-start gap-3 text-sm text-slate-300">
                                        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">{index + 1}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/ai"
                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    Ouvrir l’assistant
                                    <MessageSquare size={16} />
                                </Link>
                                <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    En ligne
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 text-center text-lg font-bold leading-9 text-white">
                                            IA
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fenêtre</p>
                                            <p className="text-sm font-semibold text-white">Assistant IA</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Mode multi-agents</span>
                                </div>
                                <div className="mt-6 space-y-3 text-sm text-slate-200">
                                    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                                        <div>
                                            <p className="font-semibold text-white">Toi :</p>
                                            <p className="text-slate-300">« Explique-moi la structure du projet. »</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-400" />
                                        <div>
                                            <p className="font-semibold text-white">Assistant :</p>
                                            <p className="text-slate-200">« Onglets en haut, sections claires : accueil, IA, Growth, BlocNode. »</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-fuchsia-400" />
                                        <div>
                                            <p className="font-semibold text-white">Dolphin :</p>
                                            <p className="text-slate-300">« Besoin de code ? Je génère et j’explique. »</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-200">
                                        <PlugZap size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Intégration fluide</p>
                                        <p className="text-xs text-slate-400">L’IA est pensée comme un onglet, pas un labyrinthe.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="cta" className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-600/30 via-violet-600/20 to-fuchsia-600/20 p-10 text-center shadow-2xl backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">Prêt</p>
                        <h3 className="mt-3 text-3xl font-bold text-white">On simplifie votre arrivée</h3>
                        <p className="mt-3 text-slate-200">
                            Accueil clair, barre d’onglets en haut, sections rangées. Commencez en douceur, puis ouvrez l’IA ou Growth/BlocNode quand vous voulez.
                        </p>
                        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                            <Link
                                href="/signup"
                                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                Créer mon compte
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30"
                            >
                                J'ai déjà un compte
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
