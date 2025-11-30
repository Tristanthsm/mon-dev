"use client";

import React from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
    const { terminalRef } = useTerminal();

    return (
        <div className="h-full w-full bg-[#1a1b26] p-4 font-mono text-sm">
            <div ref={terminalRef} className="h-full w-full" />
        </div>
    );
};

export default TerminalComponent;
