'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, Loader, X } from 'lucide-react';
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

export default function AISidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState<AIMode>('general');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Salut ! 👋 Je suis ton assistant IA. Choisis un mode et pose-moi tes questions !',
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

            // Use the unified AI endpoint with mode support
            const endpoint = '/api/ai/chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history,
                    mode: selectedMode, // Pass the selected mode
                    allowAdvancedAI: true // Default to true for this standalone version
                }),
            });

            if (!response.ok || !response.body) {
                // Try to parse error message
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

            // Handle streaming response if the API supports it, or JSON if not
            // The current /api/ai/chat returns JSON, not a stream. 
            // We'll adapt to handle the JSON response.
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

    const handleQuickSuggestion = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-600 hover:to-violet-600 transition-all shadow-lg shadow-cyan-500/20"
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

            {/* Mode Selector */}
            <div className="border-b border-white/10 bg-slate-900/50">
                <AIChatModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-4 py-2 rounded-2xl ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-br-none'
                                    : 'bg-white/10 border border-white/20 text-slate-100 rounded-bl-none'
                                }`}
                        >
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                            <span className="text-[10px] opacity-60 mt-1 block text-right">
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
                        <div className="bg-white/10 border border-white/20 rounded-2xl rounded-bl-none px-4 py-3">
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

            {/* Quick Suggestions */}
            {!isLoading && messages.length <= 1 && (
                <div className="px-4 py-3 border-t border-white/10 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Suggestions rapides :</p>
                    <div className="space-y-2">
                        {QUICK_SUGGESTIONS.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickSuggestion(suggestion.text)}
                                className="w-full px-3 py-2 text-left text-sm rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 transition-colors truncate flex items-center gap-2"
                            >
                                <span>{suggestion.icon}</span>
                                <span>{suggestion.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 space-y-3 bg-slate-900/50">
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
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:from-cyan-600 hover:to-violet-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-cyan-500/20"
                    >
                        {isLoading ? (
                            <Loader size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
