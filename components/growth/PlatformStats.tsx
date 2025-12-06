import React from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function PlatformStats() {
    const stats = [
        { label: 'APIs officielles', value: 'Requises', icon: ShieldCheck, tone: 'text-emerald-300' },
        { label: 'Automations n8n', value: 'Planification / alertes', icon: Zap, tone: 'text-cyan-300' },
        { label: 'Risque ban', value: 'Élevé sans API', icon: Activity, tone: 'text-amber-300' },
    ];

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Statut & conformité</p>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Guidelines</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <div className="flex items-center gap-2">
                            <s.icon className={`h-4 w-4 ${s.tone}`} />
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-white">{s.value}</p>
                    </div>
                ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
                ⚠️ Interdit : création de comptes automatisée, posts via imitation navigateur, upvotes/follow/DM auto. Utilise toujours les APIs + n8n pour un workflow légal.
            </p>
        </div>
    );
}
