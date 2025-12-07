'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, ChevronDown } from 'lucide-react';
import AIChatModeSelector, { AIMode } from '@/components/ai/AIChatModeSelector';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const QUICK_SUGGESTIONS = [
    { text: 'Analyse mon projet actuel' },
    { text: 'Optimise la base de données' },
    { text: 'Génère un script de déploiement' },
];

export default function AgentChat() {
    const [selectedMode, setSelectedMode] = useState<AIMode>('general');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Bonjour. Je suis prêt. Quel est l'objectif ?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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

        // Placeholder for AI response
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

            // Using the existing API route
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history,
                    mode: selectedMode,
                    allowAdvancedAI: true
                }),
            });

            if (!response.ok) throw new Error('Erreur API');

            const data = await response.json();
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: data.content } : m));

        } catch (error) {
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "Je ne peux pas répondre pour le moment. Vérifiez la connexion API." } : m));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4 md:p-6 w-full">

            {/* Header / Mode Selector */}
            <div className="flex-none mb-4">
                <AIChatModeSelector selectedMode={selectedMode} onSelectMode={setSelectedMode} />
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2 custom-scrollbar">
                {mounted && messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`
                                max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg shadow-cyan-900/20'
                                    : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-bl-none shadow-sm'}
                            `}
                        >
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-cyan-100' : 'text-slate-500'}`}>
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/50 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none mt-4">
                {messages.length < 3 && !isLoading && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                        {QUICK_SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSendMessage(s.text)}
                                className="whitespace-nowrap px-3 py-1.5 text-xs bg-slate-800/50 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                {s.text}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder="Envoyer un message à l'agent..."
                        className="flex-1 bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="flex-none p-3.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
                    >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
