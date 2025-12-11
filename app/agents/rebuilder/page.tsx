'use client';

import React, { useState } from 'react';
import { Layers, Zap, ArrowRight, Loader2, Link as LinkIcon, Code } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export default function RebuilderPage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const supabase = createClient();

    React.useEffect(() => {
        const fetchProjects = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('rebuild_projects' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(6);

            if (!error && data) {
                setRecentProjects(data);
            }
            setIsLoadingProjects(false);
        };

        fetchProjects();
    }, []);

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
        <div className="min-h-full bg-slate-950 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Zap className="text-indigo-500" /> Website Rebuilder
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Clonez et modernisez n'importe quelle page web en React/Tailwind grâce à l'IA.
                        </p>
                    </div>
                </div>

                {/* New Project Input */}
                <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

                    <h2 className="text-lg font-bold text-white mb-6">Démarrer un nouveau projet</h2>

                    <form onSubmit={handleAnalyze} className="max-w-3xl flex gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-indigo-500 transition-colors">
                                <LinkIcon className="text-slate-500 mr-3" size={20} />
                                <input
                                    type="url"
                                    placeholder="Collez l'URL à reconstruire (ex: https://landing.page)"
                                    className="flex-1 bg-transparent border-none text-white placeholder-slate-600 focus:outline-none focus:ring-0 py-4"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isAnalyzing}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                            {isAnalyzing ? 'Analyse...' : 'Reconstruire'}
                        </button>
                    </form>
                </section>

                {/* Recent Projects */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-slate-500" size={20} /> Historique
                        </h2>
                    </div>

                    {isLoadingProjects ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5"></div>
                            ))}
                        </div>
                    ) : recentProjects.length === 0 ? (
                        <div className="text-center py-24 bg-slate-900/30 border border-dashed border-white/5 rounded-2xl">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                <Code size={32} />
                            </div>
                            <h3 className="text-slate-300 font-medium mb-1">Aucun projet</h3>
                            <p className="text-slate-500 text-sm">Lancez votre première reconstruction ci-dessus.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentProjects.map((project) => (
                                <Link
                                    href={`/agents/rebuilder/${project.id}`}
                                    key={project.id}
                                    className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300"
                                >
                                    <div className="h-40 bg-slate-950 relative border-b border-white/5 p-6 flex flex-col justify-center items-center">
                                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all mb-3 text-slate-400 group-hover:text-indigo-400">
                                            <Code size={24} />
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono truncate max-w-full px-4 text-center opacity-70">
                                            {project.target_url}
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white truncate pr-4 text-lg">
                                                {new URL(project.target_url).hostname.replace('www.', '')}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {project.status === 'completed' ? 'Terminé' : 'En cours'}
                                            </span>
                                            <span className="text-xs text-indigo-400 font-medium flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                Voir le code <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
