'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthStatus() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (loading) {
        return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
                <LogIn size={14} />
                <span>Connexion</span>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-slate-400">
                {user.email}
            </span>
            <div className="relative group">
                <button className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    <UserIcon size={16} />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                    <div className="p-3 border-b border-white/5">
                        <p className="text-xs font-medium text-white truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-xs text-red-400 hover:bg-white/5 transition-colors"
                    >
                        <LogOut size={14} />
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
