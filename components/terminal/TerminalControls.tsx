"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Wifi, Maximize2, Minus, X } from 'lucide-react';

const TerminalControls = () => {
    return (
        <div className="flex items-center justify-between border-b border-white/5 bg-[#1a1b26] px-4 py-3">
            <div className="flex items-center space-x-2">
                <div className="flex space-x-2 mr-4">
                    <div className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
                    <div className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
                </div>
                <div className="flex items-center space-x-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500 border border-green-500/20">
                    <Wifi className="mr-1 h-3 w-3" />
                    Connecté
                </div>
            </div>
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/5 hover:text-white">
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white/5 hover:text-white">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default TerminalControls;
