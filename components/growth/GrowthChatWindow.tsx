'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import type { GrowthPlatform } from './GrowthSidebar';

interface Message {
    role: 'user' | 'agent';
    content: string;
}

export default function GrowthChatWindow({
    platform,
    onSend,
    queuedMessage,
    onQueuedHandled,
}: {
    platform: GrowthPlatform;
    onSend: (payload: { platform: string; message: string }) => Promise<string>;
    queuedMessage?: string;
    onQueuedHandled?: () => void;
}) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'agent',
            content: `Bienvenue sur ${platform.title}. Pose ta demande : contenu, hooks, calendrier ou analyse.`,
        },
    ]);

    const sendMessage = async (message: string) => {
        if (!message || loading) return;
        setMessages((prev) => [...prev, { role: 'user', content: message }]);
        if (message === input) {
            setInput('');
        }
        setLoading(true);
        try {
            const response = await onSend({ platform: platform.id, message });
            setMessages((prev) => [...prev, { role: 'agent', content: response }]);
        } catch (error: any) {
            setMessages((prev) => [...prev, { role: 'agent', content: `Erreur: ${error?.message ?? 'inconnue'}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        const message = input.trim();
        await sendMessage(message);
    };

    useEffect(() => {
        if (queuedMessage) {
            sendMessage(queuedMessage);
            onQueuedHandled?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queuedMessage]);

    return (
        <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Agent</p>
                    <p className="text-sm font-semibold text-white">{platform.title}</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    En ligne
                </span>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-3xl whitespace-pre-wrap rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                                ? 'ml-auto border-cyan-500/30 bg-cyan-500/10 text-white'
                                : 'border-white/10 bg-slate-900/70 text-slate-200'
                        }`}
                    >
                        {msg.content}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        L’agent rédige...
                    </div>
                )}
            </div>
            <div className="border-t border-white/5 p-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                        placeholder="Demande : thread, script, hooks, analyse concurrent..."
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-500/40 focus:outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Envoyer
                    </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                    ⚠️ Pas de création de comptes ni d’automatisation hors API. Utilise n8n + APIs officielles pour publier/planifier.
                </p>
            </div>
        </div>
    );
}
