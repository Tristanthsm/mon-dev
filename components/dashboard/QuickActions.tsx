"use client";

import React from 'react';
import { Save, RefreshCw, GitBranch, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions = () => {
    const actions = [
        {
            id: 'save',
            label: 'Sauvegarder',
            sub: '& Push',
            desc: 'Commit changes',
            icon: Save,
            gradient: 'from-cyan-500 to-blue-600',
            delay: 0.1
        },
        {
            id: 'sync',
            label: 'Synchroniser',
            sub: '& Pull',
            desc: 'Update local',
            icon: RefreshCw,
            gradient: 'from-blue-500 to-violet-600',
            delay: 0.2
        },
        {
            id: 'branch',
            label: 'Nouvelle',
            sub: 'Branche',
            desc: 'Feature branch',
            icon: GitBranch,
            gradient: 'from-violet-500 to-fuchsia-600',
            delay: 0.3
        },
        {
            id: 'start',
            label: 'Lancer',
            sub: 'Projet',
            desc: 'Dev servers',
            icon: Play,
            gradient: 'from-emerald-500 to-teal-600',
            delay: 0.4
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
                <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: action.delay }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl"
                    onClick={() => console.log(action.label)}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-20`} />

                    <div className="flex items-start justify-between">
                        <div className={`rounded-2xl bg-gradient-to-br ${action.gradient} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                            <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                            <ArrowRight className="h-5 w-5 text-white/50" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white leading-tight">
                            {action.label} <span className="opacity-60 font-normal">{action.sub}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                            {action.desc}
                        </p>
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default QuickActions;
