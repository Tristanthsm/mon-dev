'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    return (
        <div className="relative max-w-4xl mx-auto w-full">
            <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything... (e.g., 'Write a React component' or 'How to bypass filters')"
                    className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-6 py-4 pr-16 resize-none focus:outline-none max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
                    rows={1}
                    disabled={isLoading}
                />

                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 bottom-3 p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                    {isLoading ? (
                        <Sparkles className="animate-spin" size={20} />
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </div>
            <p className="text-center text-xs text-slate-500 mt-3">
                Multi-Agent System Active • Dolphin (Uncensored) • Claude (Code) • GPT-4 (General)
            </p>
        </div>
    );
}
