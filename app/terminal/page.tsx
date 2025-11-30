"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TerminalControls from '@/components/terminal/TerminalControls';
import { FadeIn } from '@/components/ui/motion';

const TerminalComponent = dynamic(() => import('@/components/terminal/Terminal'), {
    ssr: false,
});

export default function TerminalPage() {
    return (
        <div className="min-h-screen pb-10 flex flex-col">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex-1 flex flex-col">

                <FadeIn className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                            Terminal
                        </h1>
                        <p className="text-slate-400">
                            Accès direct au shell système via WebSocket sécurisé.
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                            ● Connected
                        </span>
                    </div>
                </FadeIn>

                <FadeIn delay={0.2} className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1b26]/90 shadow-2xl shadow-black/50 backdrop-blur-sm ring-1 ring-white/5">
                    <TerminalControls />
                    <div className="flex-1 relative">
                        <TerminalComponent />
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
