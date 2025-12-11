'use client';

import React, { useState } from 'react';
import { Search, Activity, Zap, AlertTriangle, CheckCircle, BarChart, Server, Smartphone, FileText, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

interface AuditResult {
    data: any;
    issues: any[];
    score: number;
    ai: {
        summary: string;
        prioritized_advice: string[];
    };
}

export default function SeoAuditPage() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAudit = async () => {
        if (!url) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/seo/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Audit failed');
            }

            const data = await response.json();
            setResult(data.audit);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500 border-emerald-500';
        if (score >= 70) return 'text-lime-500 border-lime-500';
        if (score >= 50) return 'text-amber-500 border-amber-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <div className="min-h-full bg-slate-950 p-6 md:p-12 text-slate-200">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/agents/seo" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Zap className="text-amber-400" /> SEO Tech Bot
                        </h1>
                        <p className="text-slate-400">Audit technique instantané et recommandations IA.</p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8 shadow-xl">
                    <div className="flex gap-4">
                        <input
                            type="url"
                            placeholder="https://exemple.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                            onClick={handleAudit}
                            disabled={isLoading || !url}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
                                ${isLoading || !url ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-900/20'}
                            `}
                        >
                            {isLoading ? <Loader className="animate-spin" size={20} /> : <Activity size={20} />}
                            {isLoading ? 'Audit en cours...' : 'Lancer l\'audit'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                        {/* Score & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Score Card */}
                            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                <h3 className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-4">Score Global</h3>
                                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl font-bold mb-2 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${getScoreColor(result.score)} bg-slate-950`}>
                                    {result.score}
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-slate-500">Performance: {Math.round(result.data.timing)}ms</span>
                                </div>
                            </div>

                            {/* AI Summary Card */}
                            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <SparklesIcon size={64} />
                                </div>
                                <h3 className="text-indigo-400 uppercase tracking-wider text-xs font-bold mb-3 flex items-center gap-2">
                                    <span className="bg-indigo-500/10 p-1 rounded">IA</span> Analyse & Stratégie
                                </h3>
                                <p className="text-slate-300 leading-relaxed mb-4 text-sm">
                                    {result.ai.summary}
                                </p>
                                <div className="space-y-2">
                                    {result.ai.prioritized_advice.map((advice, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-indigo-200 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                                            <CheckCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                                            <span>{advice}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<FileText className="text-blue-400" />}
                                label="Contenu"
                                value={`${result.data.content.wordCount} mots`}
                                sub={`${result.data.headings.h1Count === 1 ? 'H1 OK' : 'H1 Erreur'}`}
                            />
                            <StatCard
                                icon={<Server className="text-purple-400" />}
                                label="Technique"
                                value={`${(result.data.htmlSize / 1024).toFixed(1)} KB`}
                                sub={`${result.data.resources.scripts} scripts`}
                            />
                            <StatCard
                                icon={<Smartphone className="text-green-400" />}
                                label="Mobile"
                                value={result.data.meta.viewport ? 'Optimisé' : 'Manquant'}
                                sub="Viewport"
                            />
                            <StatCard
                                icon={<BarChart className="text-orange-400" />}
                                label="Liens"
                                value={result.data.links.internal + result.data.links.external}
                                sub={`${result.data.links.internal} internes`}
                            />
                        </div>

                        {/* Issues List */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-white">Problèmes détectés ({result.issues.length})</h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {result.issues.map((issue) => (
                                    <div key={issue.id} className="p-6 hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <Badge severity={issue.severity} />
                                                <h4 className="font-bold text-slate-200">{issue.title}</h4>
                                            </div>
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider bg-slate-950 px-2 py-1 rounded">{issue.category}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-3 ml-2">{issue.description}</p>
                                        <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 text-sm text-amber-200/80 flex gap-2">
                                            <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                            {issue.recommendation}
                                        </div>
                                    </div>
                                ))}
                                {result.issues.length === 0 && (
                                    <div className="p-12 text-center text-slate-500">
                                        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/20" />
                                        <p>Aucun problème majeur détecté. Bravo !</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                {icon} {label}
            </div>
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500">{sub}</div>
        </div>
    );
}

function Badge({ severity }: { severity: 'high' | 'medium' | 'low' | 'info' }) {
    const styles = {
        high: 'bg-red-500 text-red-100',
        medium: 'bg-orange-500 text-orange-100',
        low: 'bg-yellow-500 text-yellow-100',
        info: 'bg-blue-500 text-blue-100',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[severity] || styles.info}`}>
            {severity}
        </span>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M3 9h4" /><path d="M3 5h4" /></svg>
    )
}
