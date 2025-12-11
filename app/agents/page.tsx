'use client';

import React from 'react';
import { Youtube, TrendingUp, Settings, Video, Search, Zap, Layers, MousePointerClick } from 'lucide-react';
import Link from 'next/link';

const AGENTS = [
    {
        id: 'youtube-trends',
        name: 'YouTube Trends Bot',
        description: 'Analysez les tendances business pour détecter les topics viraux avant tout le monde.',
        icon: <TrendingUp size={24} className="text-red-500" />,
        color: 'border-red-500/20 bg-red-500/10',
        status: 'ACTIVE',
        href: '/agents/trends'
    },
    {
        id: 'seo-command',
        name: 'SEO Command Center',
        description: 'Audit technique, content strategy et monitoring de positions Google.',
        icon: <Search size={24} className="text-emerald-500" />,
        color: 'border-emerald-500/20 bg-emerald-500/10',
        status: 'NEW',
        href: '/agents/seo'
    },
    {
        id: 'website-rebuilder',
        name: 'Website Rebuilder',
        description: 'Clonez et modernisez n\'importe quel site web en code React propre.',
        icon: <Zap size={24} className="text-indigo-500" />,
        color: 'border-indigo-500/20 bg-indigo-500/10',
        status: 'NEW',
        href: '/agents/rebuilder'
    },
    {
        id: 'youtube-repurposer',
        name: 'YouTube Repurposer',
        description: 'Transformez vos longues vidéos en Shorts viraux avec sous-titres dynamiques.',
        icon: <Video size={24} className="text-amber-500" />,
        color: 'border-amber-500/20 bg-amber-500/10',
        status: 'BETA',
        href: '/agents/youtube'
    },

];

export default function AgentsHubPage() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header with Brain/AI Vibe */}
            <div className="mb-10 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight flex items-center gap-3">
                    <span className="text-3xl">🧠</span> Agents IA
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl">
                    Votre équipe d'assistants autonomes. Déployez des agents spécialisés pour analyser, créer et optimiser votre croissance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AGENTS.map((agent) => (
                    <Link
                        href={agent.href}
                        key={agent.id}
                        className={`bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-slate-900 transition-all group relative overflow-hidden flex flex-col`}
                    >
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${agent.color} transition-colors group-hover:scale-105 duration-300`}>
                                {agent.icon}
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider 
                                ${agent.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                    agent.status === 'NEW' ? 'bg-indigo-500/10 text-indigo-400' :
                                        agent.status === 'BETA' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                {agent.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{agent.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                            {agent.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-white transition-colors mt-auto border-t border-white/5 pt-4">
                            Ouvrir l'agent <MousePointerClick size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}

                {/* Add New Agent Placeholder */}
                <div className="border border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-not-allowed group min-h-[250px] opacity-60 hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 mb-4 transition-colors">
                        <span className="text-2xl font-light">+</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-300">Custom Agent</h3>
                    <p className="text-xs text-slate-500 mt-1">Bientôt disponible</p>
                </div>
            </div>
        </div>
    );
}
