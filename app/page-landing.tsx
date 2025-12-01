"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Code2, Zap, Shield } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export default function HomePage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.push('/dashboard');
                }
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                            Mon Dev
                        </span>
                    </h1>
                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/signup"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            S'inscrire
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <StaggerContainer className="text-center">
                    <StaggerItem>
                        <h2 className="text-6xl md:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                Votre Cockpit
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                de Développement
                            </span>
                        </h2>
                    </StaggerItem>

                    <StaggerItem>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                            Gérez vos projets, terminaux et déploiements depuis une interface unifiée et moderne.
                            Optimisez votre flux de développement dès maintenant.
                        </p>
                    </StaggerItem>

                    <StaggerItem>
                        <div className="flex gap-4 justify-center mb-16">
                            <Link
                                href="/signup"
                                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                Commencer
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-3 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-colors"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </StaggerItem>

                    {/* Features Grid */}
                    <StaggerItem>
                        <div className="grid md:grid-cols-3 gap-8 mt-24">
                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                                <div className="mb-4 inline-flex p-3 rounded-lg bg-cyan-500/10">
                                    <Code2 className="text-cyan-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Gestion de Projets</h3>
                                <p className="text-slate-400 text-sm">
                                    Organisez et suivez vos projets facilement avec notre interface intuitive.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                                <div className="mb-4 inline-flex p-3 rounded-lg bg-violet-500/10">
                                    <Zap className="text-violet-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Performance</h3>
                                <p className="text-slate-400 text-sm">
                                    Interface ultra-rapide et réactive pour un flux de travail sans interruption.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                                <div className="mb-4 inline-flex p-3 rounded-lg bg-fuchsia-500/10">
                                    <Shield className="text-fuchsia-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sécurité</h3>
                                <p className="text-slate-400 text-sm">
                                    Vos données sont protégées par l'authentification Supabase de confiance.
                                </p>
                            </div>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 backdrop-blur-xl mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2025 Mon Dev. Tous les droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}
