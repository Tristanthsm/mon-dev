'use client';

import React from 'react';
import AISidebar from '@/components/layout/AISidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* AI Sidebar */}
            <AISidebar />

            {/* Main Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
