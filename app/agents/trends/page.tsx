'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Search, BarChart2, Video, Key, Settings, Loader, RefreshCw, AlertCircle,
    Filter, Clock, ThumbsUp, Eye, ArrowUpRight, Zap, Play, Plus, BookOpen, Users,
    Calendar, MoreHorizontal, Sparkles
} from 'lucide-react';
import Link from 'next/link';

// --- TYPES ---

interface VideoData {
    id: string;
    snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: { medium: { url: string }, high: { url: string } };
        categoryId: string;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
    // Enhanced fields (mocked for now, future calculation)
    growthBadge?: 'Explose' | 'En croissance' | 'Stable';
    growthRate?: string;
    categoryLabel?: string;
}

interface KeywordData {
    keyword: string;
    opportunityScore: number; // 0-100
    searchVolume: string;
    competition: 'Faible' | 'Moyenne' | 'Élevée';
    topVideos: { title: string, thumbnail: string }[];
    aiSuggestions: string[];
    trendData: number[]; // For sparkline
}

interface ChannelData {
    id: string;
    title: string;
    avatarUrl: string;
    subscribers: string;
    videos: string;
    growth: string;
    frequency: string;
    topTags: string[];
}

// --- MOCK DATA GENERATORS ---

const MOCK_KEYWORDS: KeywordData[] = [
    {
        keyword: "Business en ligne 2025",
        opportunityScore: 89,
        searchVolume: "45K",
        competition: "Moyenne",
        topVideos: [
            { title: "Comment devenir riche en 2025 ?", thumbnail: "https://i.ytimg.com/vi/bX7j-RjFq5s/mqdefault.jpg" },
            { title: "3 Business à lancer maintenant", thumbnail: "https://i.ytimg.com/vi/aC4b5D6e7F8/mqdefault.jpg" }
        ],
        aiSuggestions: ["Tutoriel complet sans visage", "Étude de cas : De 0 à 10k€", "Comparatif outils IA marketing"],
        trendData: [20, 35, 45, 60, 55, 78, 90, 85, 95]
    },
    {
        keyword: "IA Productivité",
        opportunityScore: 94,
        searchVolume: "120K",
        competition: "Élevée",
        topVideos: [],
        aiSuggestions: ["Automatiser son travail avec GPT-5", "Nouveaux outils secrets", "Workflow productivité ultime"],
        trendData: [40, 50, 60, 85, 90, 95, 100, 98, 92]
    },
    {
        keyword: "Investissement Débutant",
        opportunityScore: 72,
        searchVolume: "60K",
        competition: "Élevée",
        topVideos: [],
        aiSuggestions: ["PEA vs Compte Titres 2025", "Investir 50€ par mois", "Erreurs de débutant à éviter"],
        trendData: [60, 62, 65, 63, 68, 70, 72, 75, 74]
    }
];

const MOCK_CHANNELS: ChannelData[] = [
    {
        id: "1",
        title: "Empire Builder",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Empire",
        subscribers: "145K",
        growth: "+5.2%",
        videos: "124",
        frequency: "2 / semaine",
        topTags: ["Business", "Marketing", "SaaS"]
    },
    {
        id: "2",
        title: "Crypto Future",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Crypto",
        subscribers: "89K",
        growth: "+12.8%",
        videos: "208",
        frequency: "Daily",
        topTags: ["Crypto", "Bitcoin", "Finance"]
    },
    {
        id: "3",
        title: "Productivity Master",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prod",
        subscribers: "320K",
        growth: "+1.5%",
        videos: "56",
        frequency: "1 / semaine",
        topTags: ["Notion", "Organisation", "Deep Work"]
    }
];

// --- COMPONENTS ---

export default function YouTubeTrendsPage() {
    const [activeTab, setActiveTab] = useState<'trends' | 'keywords' | 'channels'>('trends');
    const [scrolled, setScrolled] = useState(false);

    // Main Data State
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [timeFilter, setTimeFilter] = useState('24h');
    const [sortFilter, setSortFilter] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch Initial Trends
        fetchTrends();
    }, []);

    const fetchTrends = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetching real data from our API
            // For demo purposes, if API fails (no key), we might want to fallback or just show error.
            // But let's assume it works or returns empty.
            // We use categoryId logic or default chart.
            const res = await fetch('/api/youtube/trends?regionCode=FR');
            const data = await res.json();

            if (data.error) {
                // If error (likely no API key), we can throw specific error
                throw new Error(data.error);
            }

            // Enhance with mock fields for UI demo
            const enhancedVideos = (data.videos || []).map((v: any, idx: number) => ({
                ...v,
                growthBadge: idx < 2 ? 'Explose' : (idx < 5 ? 'En croissance' : 'Stable'),
                growthRate: idx < 2 ? '+450%' : (idx < 5 ? '+120%' : '+15%'),
                categoryLabel: 'Business / Éducation'
            }));

            setVideos(enhancedVideos);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // AI Item Analysis State
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [videoAnalysis, setVideoAnalysis] = useState<Record<string, any>>({}); // Map videoID -> AnalysisData

    const handleAnalyzeVideoStrategy = async (video: VideoData) => {
        if (videoAnalysis[video.id]) return; // Already analyzed

        setAnalyzingId(video.id);
        try {
            const res = await fetch('/api/youtube/trends/analyze-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'video',
                    data: {
                        title: video.snippet.title,
                        channel: video.snippet.channelTitle,
                        views: video.statistics.viewCount,
                        description: "" // we don't have description in list sometimes, or pass it if available
                    }
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setVideoAnalysis(prev => ({ ...prev, [video.id]: data.result }));
        } catch (err: any) {
            console.error(err);
            // Optionally show toast error
        } finally {
            setAnalyzingId(null);
        }
    };

    // Helper for Engagement Rate
    const getEngagementRate = (likes: string, views: string) => {
        const rate = (parseInt(likes) / parseInt(views)) * 100;
        return rate.toFixed(1) + '%';
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white font-sans overflow-hidden">

            {/* --- HEADER --- */}
            <div className={`shrink-0 z-20 border-b border-white/5 transition-all bg-slate-900/50 backdrop-blur-md`}>
                <div className="px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-500">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Creator Intelligence Hub</h1>
                            <p className="text-xs text-slate-400 font-medium">Analysez. Comprenez. Créez.</p>
                        </div>
                    </div>

                    {/* Main Navigation Tabs */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('trends')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'trends' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <TrendingUp size={16} /> Tendances
                        </button>
                        <button
                            onClick={() => setActiveTab('keywords')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'keywords' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Key size={16} /> Opportunités (Niches)
                        </button>
                        <button
                            onClick={() => setActiveTab('channels')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'channels' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Users size={16} /> Concurrents & Modèles
                        </button>
                    </div>

                    <div className="w-40">
                        {/* Placeholder for right side actions or just empty spacing */}
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">

                {/* --- TAB 1: TRENDS --- */}
                {activeTab === 'trends' && (
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">

                        {/* Filter Bar */}
                        <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <div className="flex items-center gap-2 flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-red-500 transition-colors">
                                <Search size={18} className="text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans les tendances (ex: IA, Business, Crypto)..."
                                    className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
                                    <Clock size={16} className="text-slate-400" />
                                    <select
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="bg-transparent border-none text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                                    >
                                        <option value="24h">Dernières 24h</option>
                                        <option value="7j">7 Jours</option>
                                        <option value="30j">30 Jours</option>
                                    </select>
                                </div>
                                <button
                                    onClick={fetchTrends}
                                    className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg shadow-red-900/20"
                                >
                                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                                </button>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-200">
                                <AlertCircle size={32} />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Erreur de connexion API</h3>
                                    <p className="text-sm opacity-80">{error}</p>
                                    <p className="text-xs mt-2 bg-red-900/30 px-2 py-1 rounded inline-block">Vérifiez votre clé API dans .env.local</p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && !videos.length && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-slate-900 h-80 rounded-2xl animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && videos.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                <Video size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Aucune vidéo trouvée pour les filtres actuels.</p>
                            </div>
                        )}

                        {/* Video Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video) => {
                                const analysis = videoAnalysis[video.id];
                                return (
                                    <div key={video.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-2xl hover:shadow-black/50 transition-all flex flex-col h-full">
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-slate-950 overflow-hidden">
                                            <img
                                                src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}
                                                alt={video.snippet.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />

                                            {/* Badges Overlay */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                {/* Logic for Mock Badges or calculated ones would go here */}
                                                <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-sm flex items-center gap-1">
                                                    {getEngagementRate(video.statistics.likeCount, video.statistics.viewCount)} Eng.
                                                </span>
                                            </div>

                                            {/* Duration Overlay (Mock) */}
                                            <div className="absolute bottom-3 right-3 bg-black/80 px-1.5 py-0.5 rounded textxs text-white font-mono text-[10px]">
                                                12:45
                                            </div>

                                            {/* Play Button Overlay */}
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                                target="_blank"
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <div className="bg-red-600 p-4 rounded-full text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                                    <Play size={24} fill="currentColor" />
                                                </div>
                                            </a>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">

                                            <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
                                                {video.snippet.title}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xs text-slate-400 font-medium truncate">{video.snippet.channelTitle}</span>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2 mt-auto bg-slate-950/50 p-3 rounded-xl border border-slate-800 mb-4">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-slate-500 uppercase mb-0.5">Vues</div>
                                                    <div className="font-bold text-xs text-slate-200">
                                                        {parseInt(video.statistics.viewCount) > 1000000
                                                            ? (parseInt(video.statistics.viewCount) / 1000000).toFixed(1) + 'M'
                                                            : (parseInt(video.statistics.viewCount) / 1000).toFixed(0) + 'k'}
                                                    </div>
                                                </div>
                                                <div className="text-center border-l border-slate-800">
                                                    <div className="text-[10px] text-slate-500 uppercase mb-0.5">Likes</div>
                                                    <div className="font-bold text-xs text-slate-200">
                                                        {parseInt(video.statistics.likeCount || '0') > 1000
                                                            ? (parseInt(video.statistics.likeCount) / 1000).toFixed(1) + 'k'
                                                            : video.statistics.likeCount}
                                                    </div>
                                                </div>
                                                <div className="text-center border-l border-slate-800">
                                                    <div className="text-[10px] text-slate-500 uppercase mb-0.5">Date</div>
                                                    <div className="font-bold text-xs text-slate-200">
                                                        {new Date(video.snippet.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Analysis Result (if available) */}
                                            {analysis && (
                                                <div className="mb-4 bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg text-xs space-y-2 animate-in fade-in zoom-in-95">
                                                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase mb-1">
                                                        <Sparkles size={12} /> Secrets de la vidéo
                                                    </div>
                                                    <p className="text-slate-300"><span className="text-white font-semibold">Pourquoi ça marche :</span> {analysis.summary}</p>
                                                    <div>
                                                        <span className="text-white font-semibold">Hooks à copier :</span>
                                                        <ul className="list-disc list-inside text-slate-400 mt-1 pl-1">
                                                            {analysis.hooks_to_model?.slice(0, 2).map((h: string, i: number) => <li key={i}>{h}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAnalyzeVideoStrategy(video)}
                                                    disabled={analyzingId === video.id || !!analysis}
                                                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all border 
                                                    ${analysis
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default'
                                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700 hover:border-slate-500'}`}
                                                >
                                                    {analyzingId === video.id ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                                                    {analysis ? 'Analysé' : 'Décrypter le succès'}
                                                </button>

                                                <Link
                                                    href={`/agents/youtube?url=https://www.youtube.com/watch?v=${video.id}`}
                                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                                                    title="Générer des clips / Repurposing"
                                                >
                                                    <ArrowUpRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}


                {/* --- TAB 2: KEYWORDS --- */}
                {activeTab === 'keywords' && (
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Niches & Mots-clés Opportunistes</h2>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                <Plus size={16} /> Ajouter un mot-clé
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {MOCK_KEYWORDS.map((kw, idx) => (
                                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                                    <div className="flex flex-col md:flex-row gap-6">

                                        {/* Left Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-white">{kw.keyword}</h3>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${kw.opportunityScore > 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    Score: {kw.opportunityScore}/100
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Search size={14} /> Vol: <span className="text-white font-medium">{kw.searchVolume}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BarChart2 size={14} /> Conc: <span className={`${kw.competition === 'Élevée' ? 'text-red-400' : 'text-emerald-400'} font-medium`}>{kw.competition}</span>
                                                </div>
                                            </div>

                                            {/* AI Tips */}
                                            <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                                    <Sparkles size={12} /> Suggestions IA
                                                </div>
                                                <div className="space-y-1">
                                                    {kw.aiSuggestions.map((sugg, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                            {sugg}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Chart & Top */}
                                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                                            <div className="h-24 flex items-end gap-1 bg-slate-950/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                                                <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-bold uppercase">Tendance 30j</div>
                                                {kw.trendData.map((val, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                                        style={{ height: `${val}%` }}
                                                    ></div>
                                                ))}
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Top Vidéo</p>
                                                {kw.topVideos.slice(0, 1).map((v, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                                                        <img src={v.thumbnail} className="w-10 h-6 rounded object-cover" />
                                                        <div className="text-xs text-slate-300 font-medium truncate">{v.title}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- TAB 3: CHANNELS --- */}
                {activeTab === 'channels' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Chaînes à Surveiller</h2>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700">
                                <Plus size={16} /> Ajouter une chaîne
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_CHANNELS.map((channel) => (
                                <div key={channel.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700">
                                            <img src={channel.avatarUrl} alt={channel.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{channel.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Users size={14} /> {channel.subscribers}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                            <div className="text-[10px] text-slate-500 uppercase">Croissance</div>
                                            <div className="text-emerald-400 font-bold">{channel.growth}</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                            <div className="text-[10px] text-slate-500 uppercase">Fréquence</div>
                                            <div className="text-blue-400 font-bold">{channel.frequency}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Sujets Dominants</p>
                                        <div className="flex flex-wrap gap-2">
                                            {channel.topTags.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-white border border-slate-700 transition-colors">
                                        Voir l'analyse détaillée
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Custom Scrollbar Styles */}
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
