'use client';

import React from 'react';
import { AGENTS } from '@/lib/agents/registry';
import { User } from 'lucide-react';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    agentId?: string;
    timestamp: Date;
}

export default function MessageBubble({ role, content, agentId, timestamp }: MessageBubbleProps) {
    const isUser = role === 'user';
    const agent = agentId ? AGENTS[agentId] : null;

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isUser
                        ? 'bg-slate-700 text-slate-300'
                        : agent?.color || 'bg-gray-600'
                    }`}>
                    {isUser ? (
                        <User size={20} />
                    ) : (
                        agent?.icon ? <agent.icon size={20} className="text-white" /> : <span className="text-xs font-bold">AI</span>
                    )}
                </div>

                {/* Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-300">
                            {isUser ? 'You' : agent?.name || 'Unknown Agent'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className={`px-6 py-4 rounded-2xl shadow-md text-sm leading-relaxed whitespace-pre-wrap ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                        }`}>
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}
