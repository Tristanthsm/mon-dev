'use client';

import React, { useState } from 'react';
import { Layers, Zap, ArrowRight, Loader2, Link as LinkIcon, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RebuilderPage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setIsAnalyzing(true);

        try {
            const response = await fetch('/api/rebuilder/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            router.push(`/agents/rebuilder/${data.projectId}`);
        } catch (error) {
            console.error(error);
            setIsAnalyzing(false);
            alert("Erreur lors de l'analyse. Vérifiez l'url.");
        }
    };

    return (
        <div className="min-h-full bg-slate-950 p-6 md:p-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl mx-auto text-center mt-10 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Zap size={14} /> AI Website Rebuilder
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Recréez n'importe quel site <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">en Code React Propre.</span>
                </h1>

                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Copiez une URL. L'IA analyse le design, la structure et les styles, puis génère une version moderne, légale et optimisée en Next.js & Tailwind.
                </p>

                {/* Input Form */}
                <form onSubmit={handleAnalyze} className="relative max-w-xl mx-auto group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                    <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 shadow-2xl">
                        <div className="pl-4 text-slate-500">
                            <LinkIcon size={20} />
                        </div>
                        <input
                            type="url"
                            placeholder="https://exemple.com"
                            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 px-4 py-3"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isAnalyzing}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                            {isAnalyzing ? 'Analyse...' : 'Reconstruire'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Rebuilds Grid (Mock for now) */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Layers size={18} className="text-slate-400" /> Vos Projets Récents
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Empty State / Placeholder Project */}
                    <div className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                        <div className="h-40 bg-slate-900 flex items-center justify-center border-b border-white/5 relative">
                            <div className="absolute inset-0 bg-slate-800/50 group-hover:bg-slate-800/30 transition-colors flex items-center justify-center">
                                <Code size={32} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white truncate">Landing Page SaaS</h3>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase">Terminé</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 truncate">https://stripe.com/en-fr</p>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/5 transition-all flex items-center justify-center gap-2">
                                Voir le code <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
