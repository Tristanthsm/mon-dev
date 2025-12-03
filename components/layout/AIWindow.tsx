'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_SUGGESTIONS = [
    { icon: '🌿', text: 'Créer une branche' },
    { icon: '📚', text: 'Lister mes repos' },
    { icon: '💡', text: 'Expliquer ce code' },
];

export default function AIWindow() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Salut ! 👋 Je suis ton assistant IA. Ici en fenêtre complète.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (messageContent?: string) => {
        const userMessage = messageContent || input.trim();
        if (!userMessage) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();
        const placeholder: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, placeholder]);

        try {
            const history = messages.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', parts: [{ text: msg.content }] }));
            const endpoint = '/api/openrouter/chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history }),
            });

            if (!response.ok || !response.body) {
                const text = await response.text();
                throw new Error(text || 'OpenRouter error');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = !!doneReading;
                if (value) {
                    const chunk = decoder.decode(value);
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
                }
            }
        } catch (error) {
            console.error('Error getting response:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Erreur avec OpenRouter: ${error instanceof Error ? error.message : 'Erreur inconnue'}.`,
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSuggestion = (suggestion: string) => handleSendMessage(suggestion);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/">
                        <a className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                            <ChevronLeft />
                        </a>
                    </Link>
                    <h1 className="text-2xl font-bold">Assistant IA — Fenêtre</h1>
                </div>

                <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 h-[60vh] overflow-y-auto space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white'}`}>
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <span className="text-xs opacity-60 block mt-1">
                                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-2 rounded-lg">
                                    <Loader className="animate-spin text-cyan-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
                                placeholder="Pose ta question..."
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white placeholder-slate-400 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !input.trim()}
                                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
                            >
                                {isLoading ? <Loader className="animate-spin" /> : <Send />}
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {QUICK_SUGGESTIONS.map((s, i) => (
                                <button key={i} onClick={() => handleQuickSuggestion(s.text)} className="px-3 py-1 bg-white/5 rounded-lg">{s.icon} {s.text}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
