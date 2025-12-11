'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Youtube, Loader, Play, Download, ExternalLink, Scissors, CheckCircle, FileText, ListVideo, Subtitles, Activity, AlignLeft, Copy, Check, Settings2, Sparkles } from 'lucide-react';

// Types
interface Segment {
    id: number;
    start: number;
    end: number;
    text: string;
}

interface MetaClip {
    title: string;
    start: number;
    end: number;
    reason: string;
    score: number;
}

interface Clip {
    file: string;
    metadata: MetaClip;
}

interface AnalysisResult {
    video_title: string;
    transcription_excerpt: string;
    transcription_segments: Segment[];
    srt_content: string;
    clips: Clip[];
    summary: string | null;
    session_id: string;
}

export default function YouTubeAgentPage() {
    // Input State
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);

    // Options State
    const [generateClips, setGenerateClips] = useState(true);
    const [summaryType, setSummaryType] = useState<'short' | 'long' | 'none'>('none');

    // Result Options State (Subtitle now locally controlled here)
    const [subtitleStyle, setSubtitleStyle] = useState<'none' | 'Karaoke_Green' | 'Karaoke_Yellow' | 'Clean'>('Karaoke_Green');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>('En attente...');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'moments' | 'summary' | 'transcription' | 'srt'>('moments');
    const [copiedSummary, setCopiedSummary] = useState(false);

    // Rendering State
    const [downloadingClips, setDownloadingClips] = useState<{ [key: number]: boolean }>({});

    // YouTube Player ref
    const playerRef = useRef<any>(null);

    // Extract video ID when URL changes
    useEffect(() => {
        const extractVideoId = (inputUrl: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = inputUrl.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };
        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
        }
    }, [url]);

    // Check for query param URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const queryUrl = params.get('url');
            if (queryUrl) {
                setUrl(queryUrl);
            }
        }
    }, []);

    // Load YouTube Iframe API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // Initialize/Update Player when videoId changes
    useEffect(() => {
        if (videoId && window.YT && window.YT.Player) {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) { }
            }

            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1
                }
            });
        }
    }, [videoId]);


    const handleSeek = (seconds: number) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seconds, true);
            playerRef.current.playVideo();
        }
    };

    const handleAnalyze = async () => {
        if (!url.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        setStatus('Initialisation...');

        const progressInterval = setInterval(() => {
            setStatus((prev) => {
                if (prev === 'Initialisation...') return 'Téléchargement de la vidéo (yt-dlp)...';
                if (prev === 'Téléchargement de la vidéo (yt-dlp)...') return 'Extraction & Transcription (Whisper)...';
                if (prev === 'Extraction & Transcription (Whisper)...') return 'Analyse intelligente (DeepSeek)...';
                return prev;
            });
        }, 5000);

        try {
            const response = await fetch('/api/growth/youtube/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    generateClips,
                    summaryType: summaryType === 'none' ? undefined : summaryType
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || data.details || 'Erreur inconnue');
            }

            const data = await response.json();
            setResult(data);

            // Set intelligent default tab
            if (data.clips && data.clips.length > 0) setActiveTab('moments');
            else if (data.summary) setActiveTab('summary');
            else setActiveTab('transcription');

            setStatus('Terminé !');
        } catch (err: any) {
            clearInterval(progressInterval);
            setError(err.message);
            setStatus('Erreur');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRender = async (clip: Clip, index: number) => {
        if (!result?.session_id) return;

        setDownloadingClips(prev => ({ ...prev, [index]: true }));

        try {
            const response = await fetch('/api/growth/youtube/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: result.session_id,
                    clipStart: clip.metadata.start,
                    clipEnd: clip.metadata.end,
                    subtitleStyle: subtitleStyle,
                    outputFilename: `clip_${index + 1}_${subtitleStyle}.mp4`
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Render failed');
            }

            const data = await response.json();

            // Trigger download
            const a = document.createElement('a');
            a.href = data.file_url;
            a.download = `clip_${index + 1}_${subtitleStyle}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error: any) {
            console.error("Render error:", error);
            alert(`Erreur de génération : ${error.message}`);
        } finally {
            setDownloadingClips(prev => ({ ...prev, [index]: false }));
        }
    };

    const copySummary = () => {
        if (result?.summary) {
            navigator.clipboard.writeText(result.summary);
            setCopiedSummary(true);
            setTimeout(() => setCopiedSummary(false), 2000);
        }
    };

    const downloadSRT = () => {
        if (!result) return;
        const blob = new Blob([result.srt_content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.video_title}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-950 text-slate-200 font-sans">

            {/* SIDEBAR: Controls */}
            <div className="w-[350px] md:w-[400px] flex flex-col border-r border-white/5 bg-slate-900/50 shrink-0 h-full z-20 shadow-2xl">

                {/* Header/Logo */}
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg text-red-500">
                        <Youtube size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-white">YouTube Analyzer</h1>
                </div>

                {/* Scrollable Configuration */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* URL Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vidéo Source</label>
                        <input
                            type="text"
                            placeholder="https://youtube.com/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                        />
                    </div>

                    {/* Analysis Options */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings2 size={16} className="text-slate-400" />
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Configuration</label>
                        </div>

                        {/* Best Moments Option */}
                        <div
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${generateClips ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                            onClick={() => setGenerateClips(!generateClips)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${generateClips ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    <Scissors size={18} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-sm ${generateClips ? 'text-white' : 'text-slate-400'}`}>Moments Viraux</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Clips courts (10-60s)</p>
                                </div>
                                {generateClips && <CheckCircle className="text-red-500" size={18} />}
                            </div>
                        </div>

                        {/* Summary Option */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSummaryType(summaryType === 'short' ? 'none' : 'short')}
                                className={`p-3 rounded-xl border text-left transition-all relative ${summaryType === 'short' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                            >
                                <div className={`text-sm font-bold mb-1 ${summaryType === 'short' ? 'text-cyan-400' : 'text-slate-300'}`}>Résumé Court</div>
                                <div className="text-xs text-slate-500">Concours, listes</div>
                                {summaryType === 'short' && <CheckCircle className="absolute top-2 right-2 text-cyan-500" size={14} />}
                            </button>
                            <button
                                onClick={() => setSummaryType(summaryType === 'long' ? 'none' : 'long')}
                                className={`p-3 rounded-xl border text-left transition-all relative ${summaryType === 'long' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                            >
                                <div className={`text-sm font-bold mb-1 ${summaryType === 'long' ? 'text-purple-400' : 'text-slate-300'}`}>Résumé Long</div>
                                <div className="text-xs text-slate-500">Détaillé</div>
                                {summaryType === 'long' && <CheckCircle className="absolute top-2 right-2 text-purple-500" size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/5 bg-slate-900 z-10">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || (!generateClips && summaryType === 'none') || !url.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                            ${(isLoading || (!generateClips && summaryType === 'none') || !url.trim())
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white shadow-red-900/20'}`}
                    >
                        {isLoading ? <Loader className="animate-spin" size={24} /> : <Activity size={24} />}
                        {isLoading ? status : 'Lancer l\'analyse'}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs text-center animate-shake">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-black relative">

                {/* 1. Video Player Section (Reduced Height 35vh) */}
                <div className="h-[35vh] w-full bg-black border-b border-white/5 relative shrink-0">
                    {videoId ? (
                        <div id="youtube-player" className="w-full h-full"></div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-8">
                            <Youtube size={64} className="mb-6 opacity-30" />
                            <p className="text-lg font-medium opacity-50">Aucune vidéo sélectionnée</p>
                        </div>
                    )}

                    {/* Floating Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                            <Loader className="animate-spin text-red-500 mb-6" size={56} />
                            <h3 className="text-2xl font-bold text-white mb-2">{status}</h3>
                            <p className="text-slate-400">Cela peut prendre quelques minutes...</p>
                            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-red-600 animate-progress w-full origin-left-right" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Results Dashboard */}
                <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
                    {result ? (
                        <>
                            {/* Tabs Header */}
                            <div className="flex border-b border-white/5 bg-slate-900/30 overflow-x-auto shrink-0 justify-between items-center px-4">
                                <div className="flex">
                                    {result.clips && result.clips.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('moments')}
                                            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                                                ${activeTab === 'moments' ? 'border-red-500 text-red-400 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                        >
                                            <ListVideo size={16} /> Moments Clés
                                        </button>
                                    )}
                                    {result.summary && (
                                        <button
                                            onClick={() => setActiveTab('summary')}
                                            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                                                ${activeTab === 'summary' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                        >
                                            <AlignLeft size={16} /> Résumé
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setActiveTab('transcription')}
                                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                                            ${activeTab === 'transcription' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        <FileText size={16} /> Transcription
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('srt')}
                                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                                            ${activeTab === 'srt' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        <Subtitles size={16} /> SRT
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 transition-all relative">
                                {/* BEST MOMENTS */}
                                {activeTab === 'moments' && result.clips && (
                                    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">

                                        {/* Subtitle Style Selector - NOW HERE */}
                                        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                                    <Sparkles size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white">Style des Sous-titres</h3>
                                                    <p className="text-xs text-slate-500">Appliqué lors du téléchargement</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'Karaoke_Green', label: 'Karaoke Vert', color: 'bg-emerald-500' },
                                                    { id: 'Karaoke_Yellow', label: 'Karaoke Jaune', color: 'bg-yellow-400' },
                                                    { id: 'Clean', label: 'Minimaliste', color: 'bg-white' },
                                                    { id: 'none', label: 'Aucun', color: 'bg-slate-500' },
                                                ].map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => setSubtitleStyle(style.id as any)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all
                                                            ${subtitleStyle === style.id
                                                                ? 'bg-slate-800 text-white border-slate-600 ring-2 ring-indigo-500/50'
                                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${style.color}`}></div>
                                                        {style.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.clips.map((clip, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-900/10 transition-all cursor-pointer group"
                                                    onClick={() => handleSeek(clip.metadata.start)}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex items-start gap-4 flex-1">
                                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0 mt-1">
                                                                <Play size={18} fill="currentColor" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-base text-slate-200 group-hover:text-white transition-colors line-clamp-2">{clip.metadata.title}</h4>
                                                                <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{clip.metadata.reason}</p>
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-1 rounded border border-slate-700 font-mono">
                                                                        {Math.floor(clip.metadata.start / 60)}:{(clip.metadata.start % 60).toFixed(0).padStart(2, '0')} - {Math.floor(clip.metadata.end / 60)}:{(clip.metadata.end % 60).toFixed(0).padStart(2, '0')}
                                                                    </span>
                                                                    <span className="text-xs font-bold text-emerald-500">Score: {clip.metadata.score}/10</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRender(clip, idx);
                                                                }}
                                                                disabled={downloadingClips[idx]}
                                                                className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors border
                                                                    ${downloadingClips[idx]
                                                                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-wait'
                                                                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
                                                            >
                                                                {downloadingClips[idx] ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
                                                                {downloadingClips[idx] ? '...' : 'Télécharger'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SUMMARY */}
                                {activeTab === 'summary' && result.summary && (
                                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={copySummary}
                                                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                                            >
                                                {copiedSummary ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                {copiedSummary ? 'Copié !' : 'Copier'}
                                            </button>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                                            <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-medium">
                                                {result.summary}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TRANSCRIPTION */}
                                {activeTab === 'transcription' && (
                                    <div className="max-w-4xl mx-auto space-y-1 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-xl flex items-center gap-3">
                                            <Activity size={20} className="text-cyan-400" />
                                            <p className="text-sm text-cyan-200">Cliquez sur n'importe quelle ligne pour sauter à ce moment dans la vidéo.</p>
                                        </div>
                                        {result.transcription_segments.map((seg: any) => (
                                            <div
                                                key={seg.id}
                                                className="group flex gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                                                onClick={() => handleSeek(seg.start)}
                                            >
                                                <span className="text-xs font-mono text-slate-500 mt-1 min-w-[50px] group-hover:text-cyan-400 transition-colors">
                                                    {Math.floor(seg.start / 60)}:{(seg.start % 60).toFixed(0).padStart(2, '0')}
                                                </span>
                                                <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white group-hover:underline decoration-slate-600 decoration-1">
                                                    {seg.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SRT */}
                                {activeTab === 'srt' && (
                                    <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={downloadSRT}
                                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <Download size={14} /> Télécharger .SRT
                                            </button>
                                        </div>
                                        <pre className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs font-mono text-slate-400 overflow-auto whitespace-pre-wrap select-all focus:outline-none focus:border-amber-500/50 transition-colors custom-scrollbar">
                                            {result.srt_content}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Empty State (Result Placeholder)
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-700 p-8 select-none bg-slate-950/50">
                            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                                <Activity size={32} className="opacity-20 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600 mb-2">Résultats de l'analyse</h3>
                            <p className="text-sm text-slate-700 max-w-xs text-center leading-relaxed">
                                Les clips, le résumé et la transcription apparaîtront ici après le traitement.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Styles for scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

// Add global declaration for YouTube API
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}
