'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Code, Eye, Monitor, Smartphone, Moon, Sun, Copy, Check, Download } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Shell to render the component in an Iframe
const generateIframeHtml = (reactCode: string) => {
    // Basic HACK to render the component. 
    // Since we can't easily compile JSX in browser without heavy libs (babel-standalone), 
    // We will strip the component definition and simpler render it if it was HTML, 
    // OR we assume the AI outputs pure HTML/Tailwind if specifically asked.
    // BUT the prompt asked for React Component.
    // To support React Preview properly, we'd need Sandpack.
    // For now, let's try to ask the user to view the code, OR we use a simple Tailwind HTML display if we change the prompt.
    // HOWEVER, for this specific request, I will display the CODE in a nice editor view, 
    // and if I want a preview, *the prompt* should probably act as a "Single File Pure HTML/Tailwind" generator for the preview iframe.
    // For this step, I will stick to showing the code and a "Mock" preview that might just be the HTML structure if I can fallback.

    // UPDATE: To satisfy "Live Preview", I will wrap the code in a simple HTML shell that uses babel-standalone to render it.
    // This is "heavy" but works for demos.

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://unpkg.com/lucide-react@latest"></script>
        <style>body { background: #0f172a; color: white; }</style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect } = React;
          const { Check, Menu, X, ArrowRight, Star, User, Mail } = LucideReact; 
          // Note: Lucide icons need to be available globally or mocked. 
          // Provide basic mocks for common icons if LucideReact fails
          
          ${reactCode.replace('export default function', 'function').replace('import', '// import')}
          
          const App = () => <RebuiltSite />;
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(<App />);
        </script>
      </body>
    </html>
    `;
};

export default function RebuilderResultPage() {
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('rebuild_projects' as any)
                .select('*')
                .eq('id', id)
                .single();

            if (data) setProject(data);
            setLoading(false);
        };
        fetchProject();
    }, [id]);

    const handleCopy = () => {
        if (project?.generated_code) {
            navigator.clipboard.writeText(project.generated_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!project?.generated_code) return;
        const blob = new Blob([project.generated_code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rebuilt-site-${id}.tsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin mr-2" /> Chargement du projet...</div>;
    if (!project) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Projet introuvable</div>;

    const analysis = project.analysis_json || {};
    const iframeSrc = generateIframeHtml(project.generated_code || '');

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-slate-900 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link href="/agents/rebuilder" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-white text-sm">Projet Rebuilder</h1>
                        <p className="text-xs text-slate-500 truncate max-w-[300px]">{project.target_url}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        {project.status}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Eye size={14} /> Aperçu
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Code size={14} /> Code
                        </button>
                    </div>

                    {activeTab === 'preview' && (
                        <div className="flex bg-slate-800 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setDevice('desktop')}
                                className={`p-1.5 rounded transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                            >
                                <Monitor size={14} />
                            </button>
                            <button
                                onClick={() => setDevice('mobile')}
                                className={`p-1.5 rounded transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                    )}

                    <button className="btn-secondary text-xs flex gap-2" onClick={handleDownload}>
                        <Download size={14} /> Export
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">

                {/* Sidebar Analysis (Left) */}
                <aside className="w-80 border-r border-white/5 bg-slate-900/50 overflow-y-auto p-6 space-y-8 hidden lg:block">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Design System détecté</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 mb-2">Palette de couleurs</p>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.design_system?.colors?.map((c: any, i: number) => (
                                        <div key={i} className="group relative">
                                            <div
                                                className="w-8 h-8 rounded-full border border-white/10 shadow-sm cursor-pointer"
                                                style={{ backgroundColor: c.hex }}
                                            />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                                {c.name} ({c.hex})
                                            </span>
                                        </div>
                                    )) || <span className="text-xs text-slate-600">Aucune donnée</span>}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 mb-2">Typography & Vibe</p>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 text-xs text-slate-300">
                                    <p className="mb-2"><strong>Vibe:</strong> {analysis.design_system?.vibe || 'N/A'}</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {analysis.design_system?.fonts?.map((f: any, i: number) => (
                                            <li key={i}>{f.family} <span className="text-slate-500">({f.usage})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Structure identifiée</h3>
                        <div className="space-y-3">
                            {analysis.sections?.map((section: any, idx: number) => (
                                <div key={idx} className="bg-slate-800/50 border border-white/5 rounded-lg p-3 hover:border-indigo-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-indigo-400 uppercase">{section.type}</span>
                                    </div>
                                    <p className="text-xs font-medium text-white mb-1 line-clamp-1">{section.title}</p>
                                    <p className="text-[10px] text-slate-500 line-clamp-2">{section.content_summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main View Area */}
                <main className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-4">

                    {activeTab === 'preview' ? (
                        <div className={`transition-all duration-500 ease-in-out border border-white/10 shadow-2xl bg-white overflow-hidden ${device === 'mobile' ? 'w-[375px] h-[667px] rounded-[30px]' : 'w-full h-full rounded-xl'}`}>
                            <iframe
                                srcDoc={iframeSrc}
                                className="w-full h-full"
                                title="Preview"
                                sandbox="allow-scripts"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-900 rounded-xl border border-white/10 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-2 border-b border-white/5 bg-slate-800/50">
                                <span className="text-xs text-slate-400 px-2">GeneratedReactComponent.tsx</span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/10 text-xs text-slate-400 transition-colors"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    {copied ? 'Copié !' : 'Copier'}
                                </button>
                            </div>
                            <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-cyan-100/90 leading-relaxed selection:bg-indigo-500/30">
                                {project.generated_code}
                            </pre>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
