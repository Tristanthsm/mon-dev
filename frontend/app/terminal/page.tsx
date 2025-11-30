"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import TerminalControls from '@/components/terminal/TerminalControls';

const TerminalComponent = dynamic(() => import('@/components/terminal/Terminal'), {
    ssr: false,
});

export default function TerminalPage() {
    return (
        <div className="container flex h-[calc(100vh-3.5rem)] flex-col py-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Terminal</h1>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm">
                <TerminalControls />
                <div className="flex-1 overflow-hidden rounded-md border border-border">
                    <TerminalComponent />
                </div>
            </div>
        </div>
    );
}
