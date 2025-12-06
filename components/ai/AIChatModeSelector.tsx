'use client';

import React from 'react';
import { Bot, Code2, Terminal, PenTool, Bug } from 'lucide-react';

export type AIMode = 'general' | 'expert' | 'architect' | 'debug';

interface AIChatModeSelectorProps {
    selectedMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
}

const MODES = [
    { id: 'general', label: 'General', icon: Bot, description: 'Helpful assistant' },
    { id: 'expert', label: 'Code Expert', icon: Code2, description: 'Optimization & Best Practices' },
    { id: 'architect', label: 'Architect', icon: PenTool, description: 'System Design & Patterns' },
    { id: 'debug', label: 'Debugger', icon: Bug, description: 'Error Analysis & Fixes' },
] as const;

export default function AIChatModeSelector({ selectedMode, onSelectMode }: AIChatModeSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-2 p-2">
            {MODES.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id as AIMode)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${selectedMode === mode.id
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    <mode.icon size={20} className="mb-2" />
                    <span className="text-xs font-medium">{mode.label}</span>
                </button>
            ))}
        </div>
    );
}
