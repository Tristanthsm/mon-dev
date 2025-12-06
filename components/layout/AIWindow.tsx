'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AIChatModeSelector, { AIMode } from '@/components/ai/AIChatModeSelector';

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
    const [selectedMode, setSelectedMode] = useState<AIMode>('general');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Salut ! 👋 Je suis ton assistant IA. Choisis un mode et pose-moi tes questions !",
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

            // Use the unified AI endpoint with mode support
            const endpoint = '/api/ai/chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history,
                    mode: selectedMode, // Pass the selected mode
                    allowAdvancedAI: true
                }),
            });

            if (!response.ok || !response.body) {
                let errorMsg = 'Unknown error';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    errorMsg = text || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: data.content } : m));

        } catch (error) {
            console.error('Error getting response:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}.`,
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

                <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-160px)] border border-white/10">

                    {/* Mode Selector */}
                    <div className="border-b border-white/10 bg-slate-900/50 p-2">
                        <AIChatModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-6 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-br-none'
                                        : 'bg-white/5 text-slate-100 rounded-bl-none border border-white/10'
                                    }`}>
                                    <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    <span className="text-[10px] opacity-60 block mt-2 text-right">
                                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none border border-white/10">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 space-y-3 bg-slate-900/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
                                placeholder="Pose ta question..."
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !input.trim()}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
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
                                            className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
                                        >
                                            <span>{s.icon}</span>
                                            <span>{s.text}</span>
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
