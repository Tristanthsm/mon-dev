'use client';

import Link from 'next/link';
import { Bot, Layers, TrendingUp, ArrowRight, Activity, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user);
        };
        getUser();
    }, [supabase]);

    const CARDS = [
        {
            title: 'Agent IA',
            description: 'Votre assistant intelligent polyvalent.',
            icon: Bot,
            href: '/ai',
            color: 'from-blue-600 to-cyan-500'
        },
        {
            title: 'Notes',
            description: 'Second cerveau & prise de notes rapide.',
            icon: Layers,
            href: '/notes',
            color: 'from-emerald-600 to-teal-500'
        },
        {
            title: 'Growth',
            description: 'Automatisations & bots sociaux.',
            icon: TrendingUp,
            href: '/growth',
            color: 'from-violet-600 to-purple-500'
        },
    ];

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto h-full flex flex-col justify-center">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Bonjour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.email?.split('@')[0] || 'Voyageur'}</span>.
                </h1>
                <p className="text-xl text-slate-400">Votre cockpit de développement est prêt.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {CARDS.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="group relative overflow-hidden bg-slate-900/50 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all hover:transform hover:-translate-y-1"
                    >
                        <div className={`absolute top-0 right-0 p-32 opacity-5 bg-gradient-to-br ${card.color} blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3 group-hover:opacity-10 transition-opacity`} />

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                                <card.icon size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
                            <p className="text-slate-400 mb-6 min-h-[3rem]">{card.description}</p>

                            <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                                <span>Ouvrir</span>
                                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Status / Recent Activity Placeholder */}
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase tracking-wider font-semibold">
                        <Activity size={14} />
                        <span>État du Système</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Base de données</span>
                            <span className="text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connecté</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">API IA</span>
                            <span className="text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Opérationnel</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase tracking-wider font-semibold">
                        <Clock size={14} />
                        <span>Récemment</span>
                    </div>
                    <div className="text-sm text-slate-500 italic">
                        Aucune activité récente enregistrée.
                    </div>
                </div>
            </div>
        </div>
    );
}
