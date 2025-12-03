"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Github, Database, User, Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TopNav = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: null },
        { href: '/ai', label: 'Assistant IA', icon: MessageCircle },
        { href: '#', label: 'GitHub', icon: Github },
        { href: '#', label: 'Supabase', icon: Database },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F172A]/60"
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
                            <Terminal className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden font-bold text-lg tracking-tight sm:inline-block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Dev Cockpit
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-medium transition-colors hover:text-white rounded-lg",
                                        isActive ? "text-white" : "text-slate-400"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-lg bg-white/5 border border-white/5"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center space-x-2">
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.label}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs font-medium text-slate-300">System Online</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-white text-slate-400 transition-colors">
                        <div className="relative">
                            <User className="h-5 w-5" />
                            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-[#0F172A]" />
                        </div>
                    </Button>

                    <Button variant="ghost" size="icon" className="md:hidden text-slate-400">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </motion.nav>
    );
};

export default TopNav;
