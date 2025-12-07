'use client';

import React from 'react';
import { Twitter, Youtube, Share2, MessageCircle, TrendingUp, Settings } from 'lucide-react';

const AGENTS = [
    { title: 'Twitter / X', icon: Twitter, description: 'Génération de threads & hooks viraux.', status: 'Active' },
    { title: 'Reddit', icon: Share2, description: 'Rédaction de posts value-first pour subreddits.', status: 'Ready' },
    { title: 'YouTube', icon: Youtube, description: 'Scripting de Shorts & analyse de rétention.', status: 'Beta' },
    { title: 'TikTok', icon: MessageCircle, description: 'Tendances & scripts vidéo dynamiques.', status: 'Coming Soon' },
    { title: 'Cold Outreach', icon: TrendingUp, description: 'Automatisation de la prospection LinkedIn.', status: 'Planned' },
];

export default function GrowthPage() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Growth Agents</h1>
                <p className="text-slate-400">Déployez des agents spécialisés pour automatiser votre acquisition.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AGENTS.map((agent) => (
                    <div key={agent.title} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-cyan-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition-colors">
                                <agent.icon size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider 
                                ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                                    agent.status === 'Beta' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                {agent.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{agent.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            {agent.description}
                        </p>

                        <div className="flex items-center gap-3 mt-auto">
                            <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                                Ouvrir
                            </button>
                            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Agent Placeholder */}
                <div className="border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 mb-4 transition-colors">
                        <span className="text-2xl font-light">+</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-300">Nouvel Agent</h3>
                    <p className="text-xs text-slate-500 mt-1">Configurer un custom bot</p>
                </div>
            </div>
        </div>
    );
}
