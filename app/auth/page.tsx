'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, CheckCircle2, AlertTriangle, Loader2, User, ArrowLeft, UserRound, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const authSchema = z.object({
    email: z.string().email({ message: 'Email invalide' }),
    password: z.string().min(8, { message: '8 caractères minimum' }),
    confirm: z.string().optional(),
    rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof authSchema>;
type Mode = 'signin' | 'signup';

export default function AuthPage() {
    const supabase = createClient();
    const [mode, setMode] = useState<Mode>('signin');
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSessionEmail(session?.user?.email ?? null);
        };
        loadSession();
    }, [supabase]);

    const form = useForm<FormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: { email: '', password: '', confirm: '', rememberMe: false },
    });

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        setMessage(null);
        try {
            if (mode === 'signup') {
                if (values.password !== values.confirm) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                const { error } = await supabase.auth.signUp({
                    email: values.email,
                    password: values.password,
                });
                if (error) throw error;
                setSessionEmail(values.email);
                setMessage({ type: 'success', text: 'Compte créé. Vérifie tes mails si la confirmation est activée.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                });
                if (error) throw error;
                setSessionEmail(values.email);
                setMessage({ type: 'success', text: 'Connexion réussie.' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.message ?? 'Erreur inattendue' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setSessionEmail(null);
        setMessage(null);
        setLoading(false);
    };

    const title = useMemo(() => (mode === 'signin' ? 'Connexion' : 'Créer un compte'), [mode]);
    const description = mode === 'signin'
        ? 'Accédez à vos espaces Growth et BlocNode.'
        : 'Rejoignez la plateforme pour lancer vos campagnes.';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className="relative flex min-h-screen w-full flex-col md:flex-row bg-slate-950 text-slate-100">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
            </div>

            {/* Left Panel */}
            <div className="flex w-full flex-col items-center justify-center p-8 md:w-1/2 lg:p-12">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <div className="flex items-center justify-between text-sm text-cyan-200">
                        <Link href="/" className="flex items-center gap-2 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            Accueil
                        </Link>
                        {sessionEmail && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:border-white/20"
                                disabled={loading}
                            >
                                <UserRound className="h-4 w-4" />
                                Déconnexion
                            </button>
                        )}
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-5"
                    >
                        <motion.div variants={itemVariants}>
                            <div className="mb-2 h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 text-center text-lg font-bold leading-10 text-white">
                                MD
                            </div>
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-sm text-slate-400">{description}</p>
                        </motion.div>

                        {message && (
                            <motion.div
                                variants={itemVariants}
                                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                                    message.type === 'success'
                                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                                        : 'border-amber-400/30 bg-amber-500/10 text-amber-100'
                                }`}
                            >
                                {message.type === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                                )}
                                {message.text}
                            </motion.div>
                        )}

                        {sessionEmail ? (
                            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                                        {sessionEmail[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{sessionEmail}</p>
                                        <p className="text-xs text-slate-400">Connecté</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    <Link href="/growth" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:border-white/20 text-center">
                                        GrowthHacking
                                    </Link>
                                    <Link href="/blocnode" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:border-white/20 text-center">
                                        BlocNode
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <Form
                                form={form}
                                onSubmit={handleSubmit}
                                mode={mode}
                                setMode={setMode}
                                loading={loading}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                showConfirm={showConfirm}
                                setShowConfirm={setShowConfirm}
                            />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="relative hidden w-full md:block md:w-1/2">
                <img
                    src="https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=1200&q=80"
                    alt="Workspace"
                    className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>
        </div>
    );
}

function Form({
    form,
    onSubmit,
    mode,
    setMode,
    loading,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
}: {
    form: ReturnType<typeof useForm<FormValues>>;
    onSubmit: (data: FormValues) => Promise<void>;
    mode: Mode;
    setMode: (m: Mode) => void;
    loading: boolean;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    showConfirm: boolean;
    setShowConfirm: (v: boolean) => void;
}) {
    const { handleSubmit, control, register, formState: { errors } } = form;
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                    {mode === 'signin' ? 'Connexion' : 'Création de compte'}
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'signin' ? 'default' : 'secondary'}
                        onClick={() => setMode('signin')}
                    >
                        Se connecter
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'signup' ? 'default' : 'secondary'}
                        onClick={() => setMode('signup')}
                    >
                        Créer un compte
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        type="email"
                        placeholder="email@example.com"
                        disabled={loading}
                        {...register('email')}
                        className="pl-10"
                    />
                </div>
                {errors.email && <p className="text-xs text-amber-300">{errors.email.message}</p>}
            </div>

            <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••"
                        disabled={loading}
                        {...register('password')}
                        className="pl-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-white"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-amber-300">{errors.password.message}</p>}
            </div>

            {mode === 'signup' && (
                <div className="space-y-3">
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Confirmer</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••••"
                            disabled={loading}
                            {...register('confirm')}
                            className="pl-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-white"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Checkbox
                        checked={!!form.watch('rememberMe')}
                        onCheckedChange={(v) => form.setValue('rememberMe', Boolean(v))}
                        disabled={loading}
                        id="rememberMe"
                    />
                    <label htmlFor="rememberMe">Se souvenir de moi</label>
                </div>
                <Link href="#" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                    Mot de passe oublié ?
                </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuer
            </Button>

            <p className="text-center text-xs text-slate-400">
                {mode === 'signin' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
                <button
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                    {mode === 'signin' ? 'Créer un compte' : 'Se connecter'}
                </button>
            </p>
        </form>
    );
}
