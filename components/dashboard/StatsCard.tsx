"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    gradient: string;
    delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, description, gradient, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/10"
        >
            {/* Background Glow */}
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40 ${gradient}`} />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">{title}</p>
                        <h3 className="text-5xl font-bold text-white tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                            {value}
                        </h3>
                    </div>

                    {description && (
                        <div className="flex items-center space-x-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-sm text-slate-400 font-medium">
                                {description}
                            </p>
                        </div>
                    )}
                </div>

                <div className={`rounded-2xl p-4 bg-white/5 ring-1 ring-white/10 backdrop-blur-md transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
