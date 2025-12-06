'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Bot, Zap, Code2, Layers } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agentId?: string;
    timestamp: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeAgents, setActiveAgents] = useState<string[]>([]);
    const [manualAgentId, setManualAgentId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setActiveAgents([]); // Reset active agents

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    forcedAgentId: manualAgentId // Pass manual selection
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            // Add agent responses
            if (data.responses && Array.isArray(data.responses)) {
                const newMessages: Message[] = data.responses.map((res: any, index: number) => ({
                    id: `${Date.now()}-${index}`,
                    role: 'assistant',
                    content: res.content,
                    agentId: res.agentId,
                    timestamp: new Date(),
                }));

                setMessages(prev => [...prev, ...newMessages]);
                setActiveAgents(data.responses.map((r: any) => r.agentId));
            }
        } catch (error) {
            console.error('Chat error:', error);
            // Add error message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error processing your request.",
                agentId: 'general',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAgent = (agentId: string) => {
        setManualAgentId(prev => prev === agentId ? null : agentId);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-fadeIn">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                                <Layers size={80} className="relative text-cyan-400 opacity-80" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
                                    Dev Cockpit AI
                                </h2>
                                <p className="text-slate-400 max-w-md mx-auto text-lg">
                                    Orchestrating multiple intelligences to solve your toughest challenges.
                                </p>
                                <p className="text-slate-500 text-sm mt-2">
                                    Select an agent to force a specific perspective, or let the system decide.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                                <button
                                    onClick={() => toggleAgent('general')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${manualAgentId === 'general'
                                            ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <Bot className={manualAgentId === 'general' ? "text-blue-400" : "text-blue-500"} size={32} />
                                    <span className={`font-bold ${manualAgentId === 'general' ? "text-blue-300" : "text-blue-400"}`}>Nexus</span>
                                    <span className="text-xs text-slate-500">General Assistant</span>
                                </button>

                                <button
                                    onClick={() => toggleAgent('specialist')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${manualAgentId === 'specialist'
                                            ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <Code2 className={manualAgentId === 'specialist' ? "text-emerald-400" : "text-emerald-500"} size={32} />
                                    <span className={`font-bold ${manualAgentId === 'specialist' ? "text-emerald-300" : "text-emerald-400"}`}>TechCore</span>
                                    <span className="text-xs text-slate-500">Code Expert</span>
                                </button>

                                <button
                                    onClick={() => toggleAgent('dolphin')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${manualAgentId === 'dolphin'
                                            ? 'bg-fuchsia-500/20 border-fuchsia-500 shadow-lg shadow-fuchsia-500/20 scale-105'
                                            : 'bg-slate-900/50 border-slate-800 hover:border-fuchsia-500/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <Zap className={manualAgentId === 'dolphin' ? "text-fuchsia-400" : "text-fuchsia-500"} size={32} />
                                    <span className={`font-bold ${manualAgentId === 'dolphin' ? "text-fuchsia-300" : "text-fuchsia-400"}`}>Dolphin</span>
                                    <span className="text-xs text-slate-500">Uncensored</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <MessageBubble
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                                agentId={msg.agentId}
                                timestamp={msg.timestamp}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
}
