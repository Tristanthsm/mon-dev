'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Salut ! 👋 Je suis ton assistant IA. Comment puis-je t'aider ?",
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
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Retour"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Assistant IA</h1>
                </div>

                <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white'}`}>
                                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                    <span className="text-xs opacity-60 block mt-1">
                                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-2 rounded-lg">
                                    <Loader className="animate-spin text-cyan-400 w-5 h-5" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
                                placeholder="Pose ta question..."
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !input.trim()}
                                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                        {!isLoading && messages.length <= 1 && (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-400">Suggestions rapides :</p>
                                <div className="flex gap-2 flex-wrap">
                                    {QUICK_SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickSuggestion(s.text)}
                                            className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            {s.icon} {s.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
