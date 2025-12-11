'use client';

import React from 'react';
import { Search, FileText, Monitor, Youtube, Zap, ArrowRight, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

const SEO_AGENTS = [
    {
        id: 'tech-audit',
        title: 'SEO Tech Bot',
        description: 'Audit technique automatique : détection 404, balises, performance et score global.',
        icon: <Zap size={24} className="text-amber-400" />,
        color: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        href: '/agents/seo/audit',
        status: 'READY'
    },
    {
        id: 'content-brief',
        title: 'Content Brief AI',
        description: 'Générez des briefs de rédaction optimisés : plan, mots-clés, intention de recherche.',
        icon: <FileText size={24} className="text-blue-400" />,
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        href: '/agents/seo/brief',
        status: 'READY'
    },
    {
        id: 'programmatic',
        title: 'Programmatic SEO',
        description: 'Générez des milliers de pages optimisées à partir de vos données et templates.',
        icon: <LayoutTemplate size={24} className="text-purple-400" />,
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
        href: '/agents/seo/programmatic',
        status: 'IN_DEV'
    },
    {
        id: 'monitoring',
        title: 'SEO Monitoring',
        description: 'Suivi de positions Google, alertes de chute et nouveaux concurrents.',
        icon: <Monitor size={24} className="text-emerald-400" />,
        color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        href: '/agents/seo/monitor',
        status: 'IN_DEV'
    },
    {
        id: 'youtube-seo',
        title: 'YouTube SEO Command',
        description: 'Optimisation de chaîne et vidéos : tags, titres, fréquence et analyse concurrentielle.',
        icon: <Youtube size={24} className="text-red-500" />,
        color: 'bg-red-500/10 border-red-500/20 text-red-500',
        href: '/agents/trends', // Linking to existing module
        status: 'IN_DEV'
    }
];

export default function SEOPage() {
    return (
        <div className="min-h-full bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                            <Search size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">SEO Command Center</h1>
                            <p className="text-slate-400">Pilotez votre visibilité Google & YouTube avec 5 agents intelligents.</p>
                        </div>
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SEO_AGENTS.map((agent, index) => (
                        <Link
                            href={agent.href}
                            key={agent.id}
                            className={`group bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-slate-900 transition-all relative overflow-hidden flex flex-col ${agent.status === 'IN_DEV' ? 'opacity-75' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-xl ${agent.color} transition-colors`}>
                                    {agent.icon}
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider 
                                    ${agent.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400' :
                                        agent.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-slate-800 text-slate-500'}`}>
                                    {agent.status === 'IN_DEV' ? 'DEVELOPMENT' : agent.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{agent.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                                {agent.description}
                            </p>

                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-white transition-colors mt-auto">
                                Ouvrir l'agent <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}

                    {/* Coming Soon Placeholder */}
                    <div className="border border-dashed border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 hover:border-white/10 transition-all cursor-not-allowed min-h-[250px]">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                            <span className="text-2xl font-light">+</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-300">Custom Agent</h3>
                        <p className="text-xs text-slate-500 mt-1">Configurez vos propres règles SEO</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
