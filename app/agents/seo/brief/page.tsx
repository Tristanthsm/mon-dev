'use client';

import React, { useState } from 'react';
import { FileText, ArrowLeft, Loader, CheckCircle, Copy, FileJson, Hash, Users, Target, Youtube, Layout } from 'lucide-react';
import Link from 'next/link';

interface ContentBrief {
    // Re-defining interface loosely for UI, matching valid backend response
    keyword: string;
    language: string;
    contentType: 'blog' | 'landing' | 'youtube';
    searchIntent: string;
    personaCible: string;
    anglePrincipal: string;
    h1Propose: string;
    titresAlternatifs: string[];
    plan: {
        h2: string;
        h3?: string[];
        notes?: string;
    }[];
    motsClesSecondaires: string[];
    questionsLiees: string[];
    faq: { question: string; reponseSynthetique: string }[];
    metaTitle: string;
    metaDescription: string;
    longueurCibleMots: number;
    recommandationsStrategiques: string;
}

export default function ContentBriefPage() {
    // Form State
    const [keyword, setKeyword] = useState('');
    const [contentType, setContentType] = useState<'blog' | 'landing' | 'youtube'>('blog');
    const [language, setLanguage] = useState<'fr' | 'en'>('fr');

    // Request State
    const [isLoading, setIsLoading] = useState(false);
    const [brief, setBrief] = useState<ContentBrief | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!keyword.trim()) return;
        setIsLoading(true);
        setError(null);
        setBrief(null);

        try {
            const response = await fetch('/api/seo/brief', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, contentType, language })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Generation failed');
            }

            const data = await response.json();
            setBrief(data.brief);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const generateMarkdown = () => {
        if (!brief) return '';

        let md = `# Brief SEO : ${brief.keyword}\n\n`;
        md += `**Type**: ${brief.contentType} | **Langue**: ${brief.language} | **Mots cibles**: ${brief.longueurCibleMots}\n\n`;

        md += `## 🎯 Stratégie\n`;
        md += `- **Intention**: ${brief.searchIntent}\n`;
        md += `- **Persona**: ${brief.personaCible}\n`;
        md += `- **Angle**: ${brief.anglePrincipal}\n\n`;

        md += `## 🏷️ Titres & Meta\n`;
        md += `- **H1 Recommandé**: ${brief.h1Propose}\n`;
        md += `- **Meta Title**: ${brief.metaTitle}\n`;
        md += `- **Meta Description**: ${brief.metaDescription}\n\n`;

        md += `## 📝 Plan de Contenu\n`;
        brief.plan.forEach((section, idx) => {
            md += `### ${idx + 1}. ${section.h2}\n`;
            if (section.notes) md += `> Note: ${section.notes}\n`;
            if (section.h3 && section.h3.length > 0) {
                section.h3.forEach(sub => md += `- ${sub}\n`);
            }
            md += '\n';
        });

        md += `## 🔑 Mots-clés Secondaires\n`;
        md += brief.motsClesSecondaires.join(', ') + '\n\n';

        md += `## ❓ FAQ\n`;
        brief.faq.forEach(item => {
            md += `**Q: ${item.question}**\n${item.reponseSynthetique}\n\n`;
        });

        return md;
    };

    const handleCopyMarkdown = () => {
        const md = generateMarkdown();
        navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-full bg-slate-950 p-6 md:p-12 text-slate-200">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/agents/seo" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="text-blue-400" /> Content Brief AI
                        </h1>
                        <p className="text-slate-400">Générez des briefs de contenu parfaits en un clic.</p>
                    </div>
                </div>

                {/* Main Input Form */}
                <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mot-clé principal</label>
                            <input
                                type="text"
                                placeholder="ex: outil IA pour freelance"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type de contenu</label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="blog">Article de Blog</option>
                                <option value="landing">Landing Page</option>
                                <option value="youtube">Script YouTube</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Langue</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !keyword}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                            ${isLoading || !keyword ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                        `}
                    >
                        {isLoading ? <Loader className="animate-spin" size={24} /> : <FileText size={24} />}
                        {isLoading ? 'L\'IA rédige votre brief...' : 'Générer le Brief'}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Brief Result */}
                {brief && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

                        {/* Summary Block */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl md:col-span-2">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-blue-400" /> Stratégie & Angle</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs uppercase text-slate-500 font-bold">Intention</span>
                                        <p className="text-slate-200">{brief.searchIntent}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase text-slate-500 font-bold">Persona</span>
                                        <p className="text-slate-200">{brief.personaCible}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase text-slate-500 font-bold">Angle Principal</span>
                                        <p className="text-slate-200 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 mt-1">{brief.anglePrincipal}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Hash size={18} className="text-purple-400" /> SEO Specs</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Mots:</span>
                                            <span className="text-white font-mono">{brief.longueurCibleMots}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Mots-clés sec.:</span>
                                            <span className="text-white font-mono">{brief.motsClesSecondaires.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Questions:</span>
                                            <span className="text-white font-mono">{brief.faq.length}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyMarkdown}
                                    className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                                >
                                    {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copied ? 'Markdown Copié !' : 'Copier en Markdown'}
                                </button>
                            </div>
                        </div>

                        {/* Title & Plan */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 bg-slate-950/30 border-b border-white/5">
                                <h3 className="font-bold text-white mb-2">Structure du Contenu</h3>
                                <div className="text-xl md:text-2xl font-bold text-blue-400 font-serif">
                                    {brief.h1Propose}
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {brief.plan.map((section, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-slate-800">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                                        <h4 className="text-lg font-bold text-slate-200 mb-2">{section.h2}</h4>
                                        {section.notes && (
                                            <p className="text-sm text-slate-400 italic mb-3 bg-slate-950/50 p-2 rounded">
                                                💡 {section.notes}
                                            </p>
                                        )}
                                        {section.h3 && section.h3.length > 0 && (
                                            <ul className="space-y-1">
                                                {section.h3.map((sub, sIdx) => (
                                                    <li key={sIdx} className="text-sm text-slate-400 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> {sub}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Keywords & FAQ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                                <h3 className="font-bold text-white mb-4">Mots-clés Secondaires</h3>
                                <div className="flex flex-wrap gap-2">
                                    {brief.motsClesSecondaires.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-950 border border-white/10 rounded-full text-xs text-slate-300">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="font-bold text-white mt-6 mb-4">Questions Liées (PAA)</h3>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    {brief.questionsLiees.map((q, i) => (
                                        <li key={i}>• {q}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
                                <h3 className="font-bold text-white mb-4">FAQ Recommandée</h3>
                                <div className="space-y-4">
                                    {brief.faq.map((item, i) => (
                                        <div key={i}>
                                            <p className="font-bold text-slate-300 text-sm mb-1">{item.question}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.reponseSynthetique}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SEO Strategy Advice */}
                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 p-6 rounded-2xl">
                            <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2"><Users size={18} /> Recommandation Concurrentielle</h3>
                            <p className="text-slate-300 leading-relaxed">
                                {brief.recommandationsStrategiques}
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
