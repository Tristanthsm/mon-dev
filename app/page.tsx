'use client';

import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { FadeIn } from '@/components/ui/motion';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white text-lg">AI</span>
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">
                            <span className="text-slate-100">Dev Cockpit</span>
                            <span className="mx-2 text-slate-600">/</span>
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                AI Edition
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-400">System Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Interface */}
            <main className="pt-16 h-screen">
                <ChatInterface />
            </main>
        </div>
    );
}
