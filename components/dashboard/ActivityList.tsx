"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GitCommit, Terminal, Database, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';

const activities = [
    {
        id: 1,
        type: 'git',
        action: 'Git Push',
        desc: 'feat: added terminal component',
        time: '5 min ago',
        status: 'success',
        icon: GitCommit,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        id: 2,
        type: 'terminal',
        action: 'npm install',
        desc: 'installed shadcn/ui dependencies',
        time: '15 min ago',
        status: 'success',
        icon: Terminal,
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        id: 3,
        type: 'db',
        action: 'Migration',
        desc: 'created users table',
        time: '1 hour ago',
        status: 'warning',
        icon: Database,
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        id: 4,
        type: 'error',
        action: 'Build Failed',
        desc: 'TypeScript error in server.ts',
        time: '2 hours ago',
        status: 'error',
        icon: AlertCircle,
        gradient: 'from-red-500 to-rose-500',
    },
    {
        id: 5,
        type: 'git',
        action: 'Git Pull',
        desc: 'merged main branch',
        time: '3 hours ago',
        status: 'success',
        icon: CheckCircle2,
        gradient: 'from-violet-500 to-purple-500',
    },
];

const ActivityList = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-3 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    Activité Récente
                </h3>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-400 hover:bg-white/10">
                    Voir tout
                </Badge>
            </div>

            <StaggerContainer className="space-y-4">
                {activities.map((activity) => (
                    <StaggerItem
                        key={activity.id}
                        className="group flex items-center p-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${activity.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                            <activity.icon className="h-6 w-6 text-white" />
                        </div>

                        <div className="ml-5 space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                                    {activity.action}
                                </p>
                                {activity.status === 'error' && (
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </div>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                {activity.desc}
                            </p>
                        </div>

                        <div className="ml-auto font-medium">
                            <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                {activity.time}
                            </span>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </motion.div>
    );
};

export default ActivityList;
