"use client";

import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityList from '@/components/dashboard/ActivityList';
import { Github, Database, Activity } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dev Cockpit 🚀</h1>
                <p className="text-muted-foreground">
                    Bienvenue sur ton espace de développement personnel.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Repos GitHub"
                    value="3"
                    icon={Github}
                    description="Projets actifs"
                    color="text-white"
                />
                <StatsCard
                    title="Tables Supabase"
                    value="8"
                    icon={Database}
                    description="En production"
                    color="text-green-500"
                />
                <StatsCard
                    title="Actions aujourd'hui"
                    value="12"
                    icon={Activity}
                    description="+4 depuis hier"
                    color="text-cyan-500"
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Actions Rapides</h2>
                <QuickActions />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                <ActivityList />
            </div>
        </div>
    );
}
