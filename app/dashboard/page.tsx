"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityList from '@/components/dashboard/ActivityList';
import { Github, Database, Activity, LogOut } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { createClient } from '@/lib/supabase/client';

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }
                setUser(session.user);
                setUserName(session.user.email?.split('@')[0] || 'User');
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Chargement...</div>
            </div>
        );
    }

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

                            {/* Side Widget (Placeholder for now) */}
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
