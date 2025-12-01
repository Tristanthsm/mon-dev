'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, Loader, X } from 'lucide-react';

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

export default function AISidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<'openrouter' | 'gemini'>('openrouter');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Salut ! 👋 Je suis ton assistant IA. Je peux t\'aider avec des questions sur le développement, les commandes Git, et bien plus !',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (messageContent?: string) => {
        const userMessage = messageContent || input.trim();
        if (!userMessage) return;

        // Ajouter le message utilisateur
        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        // Add a placeholder assistant message which we'll update as chunks arrive
        const assistantId = (Date.now() + 1).toString();
        const placeholder: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, placeholder]);

        try {
            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                parts: [{ text: msg.content }],
            }));

            // Use selected provider
            const endpoint = selectedProvider === 'openrouter' ? '/api/openrouter/chat' : '/api/gemini/chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history }),
            });

            if (!response.ok || !response.body) {
                const text = await response.text();
                throw new Error(text || `${selectedProvider} error`);
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
                content: `Erreur avec ${selectedProvider}: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez vérifier votre clé API ou réessayer.`,
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSuggestion = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-600 hover:to-violet-600 transition-all"
                title="Ouvrir l'assistant IA"
            >
                <ChevronRight size={24} />
            </button>
        );
    }

    return (
        <div className="fixed left-0 top-0 h-screen w-[350px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/10 backdrop-blur-xl z-40 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                        Assistant IA
                    </h2>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Fermer la sidebar"
                >
                    <ChevronLeft size={20} className="text-slate-400" />
                </button>
            </div>

            {/* Model Selector */}
            <div className="p-4 border-b border-white/10 space-y-2">
                <p className="text-xs text-slate-400 font-medium">Choisir le modèle :</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedProvider('openrouter')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedProvider === 'openrouter'
                                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                                : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
                        }`}
                    >
                        🚀 OpenRouter
                    </button>
                    <button
                        onClick={() => setSelectedProvider('gemini')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedProvider === 'gemini'
                                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                                : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
                        }`}
                    >
                        ✨ Gemini
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.role === 'user'
                                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                                    : 'bg-white/10 border border-white/20 text-slate-100'
                            }`}
                        >
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                            <span className="text-xs opacity-60 mt-1 block">
                                {message.timestamp.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2">
                            <Loader size={20} className="animate-spin text-cyan-400" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {!isLoading && messages.length <= 1 && (
                <div className="px-4 py-3 border-t border-white/10 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Suggestions rapides :</p>
                    <div className="space-y-2">
                        {QUICK_SUGGESTIONS.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickSuggestion(suggestion.text)}
                                className="w-full px-3 py-2 text-left text-sm rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 transition-colors truncate"
                            >
                                {suggestion.icon} {suggestion.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isLoading) {
                                handleSendMessage();
                            }
                        }}
                        placeholder="Demande quelque chose..."
                        className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-600 hover:to-violet-600 disabled:from-slate-600 disabled:to-slate-600 transition-all disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                    Appuyez sur Entrée pour envoyer
                </p>
            </div>
        </div>
    );
}
