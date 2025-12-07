'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Layers, TrendingUp, User, LayoutDashboard } from 'lucide-react';
import AuthStatus from '@/components/layout/AuthStatus';

const TABS = [
    { name: 'Accueil', href: '/', icon: LayoutDashboard },
    { name: 'Agent IA', href: '/ai', icon: Bot },
    { name: 'Notes', href: '/notes', icon: Layers },
    { name: 'Growth', href: '/growth', icon: TrendingUp },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
            {/* Top Navigation Bar */}
            <header className="flex-none h-14 border-b border-white/5 bg-slate-900/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-slate-100 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-xs text-white">
                            MD
                        </div>
                        <span className="hidden sm:inline">Mon Dev</span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        {TABS.map((tab) => {
                            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                        ${isActive
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                    `}
                                >
                                    <tab.icon size={16} />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <AuthStatus />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
