"use client";

import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityList from '@/components/dashboard/ActivityList';
import { Github, Database, Activity } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export default function Dashboard() {
    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">

                {/* Header Section */}
                <FadeIn className="mb-16 text-center md:text-left">
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
                            Tristan
                        </span>
                        <span className="inline-block ml-4 animate-float">🚀</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                        Votre cockpit de développement nouvelle génération.
                        Gérez vos projets, terminaux et déploiements depuis une interface unifiée.
                    </p>
                </FadeIn>

                <StaggerContainer className="space-y-16">

                    {/* Stats Grid */}
                    <StaggerItem>
                        <div className="grid gap-8 md:grid-cols-3">
                            <StatsCard
                                title="GitHub Repos"
                                value="12"
                                icon={Github}
                                description="3 updates today"
                                gradient="bg-cyan-500"
                                delay={0.1}
                            />
                            <StatsCard
                                title="Supabase"
                                value="8"
                                icon={Database}
                                description="All systems operational"
                                gradient="bg-violet-500"
                                delay={0.2}
                            />
                            <StatsCard
                                title="Activity"
                                value="98%"
                                icon={Activity}
                                description="Productivity score"
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
                                        <span className="text-slate-400">CPU Usage</span>
                                        <span className="text-emerald-400 font-mono">12%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[12%]" />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Memory</span>
                                        <span className="text-blue-400 font-mono">4.2GB</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[45%]" />
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
