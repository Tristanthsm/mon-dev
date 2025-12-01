'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StatsCard from '@/components/dashboard/StatsCard';
import AISidebar from '@/components/layout/AISidebar';
import { Github, Database, Activity, LogOut, ArrowRight, Code2, Zap, Shield } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export default function HomePage() {
    const router = useRouter();
    const supabase = createClient();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    setUser(session.user);
                    setUserName(session.user.email?.split('@')[0] || 'User');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Chargement...</div>
            </div>
        );
    }

    // Si connecté, afficher le dashboard simplifié
    if (session) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {/* Background effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl opacity-50" />
                </div>

                {/* AI Sidebar */}
                <AISidebar />

                {/* Main Dashboard */}
                <div className="relative z-10 min-h-screen pb-20">
                    <div className="ml-[350px] lg:ml-[350px] p-8">
                        <div className="max-w-6xl">
                            {/* Header with Logout */}
                            <FadeIn className="mb-16 flex justify-between items-start">
                                <div>
                                    <div className="inline-flex items-center space-x-2 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase">
                                            v2.0.0 Beta
                                        </span>
                                    </div>
                                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
                                        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                            Welcome back,
                                        </span>
                                        <br />
                                        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x">
                                            {userName}
                                        </span>
                                        <span className="inline-block ml-4 animate-float">🚀</span>
                                    </h1>
                                    <p className="text-lg text-slate-400">
                                        Votre cockpit de développement nouvelle génération.
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="text-sm">Déconnexion</span>
                                </button>
                            </FadeIn>

                            {/* Stats Grid - Centered and Simplified */}
                            <StaggerContainer className="mt-16">
                                <StaggerItem>
                                    <div className="grid gap-8 md:grid-cols-3 max-w-4xl">
                                        <StatsCard
                                            title="GitHub Repos"
                                            value="—"
                                            icon={Github}
                                            description="À configurer"
                                            gradient="bg-cyan-500"
                                            delay={0.1}
                                        />
                                        <StatsCard
                                            title="Supabase"
                                            value="Connecté"
                                            icon={Database}
                                            description="Authentification active"
                                            gradient="bg-violet-500"
                                            delay={0.2}
                                        />
                                        <StatsCard
                                            title="Utilisateur"
                                            value={user?.email || 'N/A'}
                                            icon={Activity}
                                            description="Connecté en tant que"
                                            gradient="bg-fuchsia-500"
                                            delay={0.3}
                                        />
                                    </div>
                                </StaggerItem>
                            </StaggerContainer>

                            {/* Hint for AI Sidebar */}
                            <StaggerItem>
                                <div className="mt-24 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center">
                                    <p className="text-slate-300 mb-2">
                                        💡 <strong>Astuce :</strong> Utilisez l'assistant IA sur la gauche pour poser vos questions
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Demandez des explications sur le code, des commandes Git, ou toute autre question de développement
                                    </p>
                                </div>
                            </StaggerItem>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Si non-connecté, afficher la landing page
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
                            Avec un assistant IA intégré pour vous aider.
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
                                <h3 className="text-xl font-bold text-white mb-2">Assistant IA</h3>
                                <p className="text-slate-400 text-sm">
                                    Un assistant IA toujours disponible pour répondre à vos questions de développement.
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


export default function HomePage() {
    const router = useRouter();
    const supabase = createClient();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    setUser(session.user);
                    setUserName(session.user.email?.split('@')[0] || 'User');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Chargement...</div>
            </div>
        );
    }

    // Si connecté, afficher le dashboard
    if (session) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">

                    {/* Header Section */}
                    <FadeIn className="mb-16 text-center md:text-left flex justify-between items-start">
                        <div>
                            <div className="inline-flex items-center justify-center md:justify-start space-x-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium tracking-wider uppercase">
                                    v2.0.0 Beta
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                    Welcome back,
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x">
                                    {userName}
                                </span>
                                <span className="inline-block ml-4 animate-float">🚀</span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                                Votre cockpit de développement nouvelle génération.
                                Gérez vos projets, terminaux et déploiements depuis une interface unifiée.
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm">Déconnexion</span>
                        </button>
                    </FadeIn>

                    <StaggerContainer className="space-y-16">

                        {/* Stats Grid */}
                        <StaggerItem>
                            <div className="grid gap-8 md:grid-cols-3">
                                <StatsCard
                                    title="GitHub Repos"
                                    value="—"
                                    icon={Github}
                                    description="À configurer"
                                    gradient="bg-cyan-500"
                                    delay={0.1}
                                />
                                <StatsCard
                                    title="Supabase"
                                    value="Connecté"
                                    icon={Database}
                                    description="Authentification active"
                                    gradient="bg-violet-500"
                                    delay={0.2}
                                />
                                <StatsCard
                                    title="Utilisateur"
                                    value={user?.email || 'N/A'}
                                    icon={Activity}
                                    description="Connecté en tant que"
                                    gradient="bg-fuchsia-500"
                                    delay={0.3}
                                />
                            </div>
                        </StaggerItem>

                        {/* Quick Actions */}
                        <StaggerItem>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                    <span className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                                    Actions Rapides
                                </h2>
                                <QuickActions />
                            </div>
                        </StaggerItem>

                        {/* Activity Feed */}
                        <StaggerItem>
                            <div className="grid gap-8 lg:grid-cols-4">
                                <ActivityList />

                                {/* Side Widget */}
                                <div className="hidden lg:block col-span-1 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl">
                                    <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Authentification</span>
                                            <span className="text-emerald-400 font-mono">✓ Actif</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full" />
                                        </div>

                                        <div className="flex items-center justify-between text-sm mt-6">
                                            <span className="text-slate-400">Supabase</span>
                                            <span className="text-emerald-400 font-mono">✓ Connecté</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>
        );
    }

    // Si non-connecté, afficher la landing page
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


