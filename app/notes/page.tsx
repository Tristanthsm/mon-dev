'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Save, Trash2, FileText, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Note {
    id: string;
    title: string;
    content: string;
    updated_at: string; // Supabase returns string dates
}

export default function NotesPage() {
    const supabase = createClient();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch User and Notes on Mount
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                const { data, error } = await supabase
                    .from('blocnode_notes')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (data) setNotes(data as any); // Type cast for simplicity
            }
            setIsLoading(false);
        };
        init();
    }, [supabase]);

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    // Auto-save logic: Triggered by user manually or could be debounced
    const saveNote = async (note: Note) => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('blocnode_notes')
                .upsert({
                    id: note.id,
                    user_id: userId,
                    title: note.title,
                    content: note.content,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        } catch (e) {
            console.error('Error saving note:', e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateNote = async () => {
        if (!userId) return;
        const newNote = {
            user_id: userId,
            title: 'Nouvelle note',
            content: '',
        };

        // Optimistic update
        const tempId = crypto.randomUUID();
        const optimisticNote: Note = { ...newNote, id: tempId, updated_at: new Date().toISOString() };

        setNotes([optimisticNote, ...notes]);
        setSelectedNoteId(tempId);

        // Real insert
        const { data, error } = await supabase
            .from('blocnode_notes')
            .insert(newNote)
            .select()
            .single();

        if (data) {
            // Replace optimistic note with real one
            setNotes(prev => prev.map(n => n.id === tempId ? { ...n, ...data } : n));
            setSelectedNoteId(data.id);
        } else {
            // Revert on error
            setNotes(prev => prev.filter(n => n.id !== tempId));
            if (selectedNoteId === tempId) setSelectedNoteId(null);
        }
    };

    const handleUpdateNote = (id: string, field: Partial<Note>) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...field, updated_at: new Date().toISOString() } : n));
    };

    const handleBlur = () => {
        if (selectedNote) saveNote(selectedNote);
    };

    const handleDeleteNote = async (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
        if (selectedNoteId === id) setSelectedNoteId(null);

        await supabase.from('blocnode_notes').delete().eq('id', id);
    };

    const filteredNotes = notes.filter(n =>
        (n.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (n.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full bg-slate-950 text-slate-200">
            {/* Sidebar List */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">Notes</h2>
                        <button
                            onClick={handleCreateNote}
                            disabled={!userId}
                            className="p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-50"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-500" /></div>
                    ) : filteredNotes.map(note => (
                        <button
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            className={`w-full text-left p-3 rounded-lg transition-colors group ${selectedNoteId === note.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'
                                }`}
                        >
                            <div className="font-medium text-sm truncate">{note.title || 'Sans titre'}</div>
                            <div className="text-[10px] opacity-60 mt-1 truncate">{note.content || 'Pas de contenu'}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-slate-950">
                {selectedNote ? (
                    <>
                        <div className="flex-none p-6 border-b border-white/5 flex items-start justify-between">
                            <input
                                type="text"
                                value={selectedNote.title}
                                onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                                onBlur={handleBlur}
                                className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full placeholder-slate-600"
                                placeholder="Titre de la note"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDeleteNote(selectedNote.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => saveNote(selectedNote)}
                                    className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-6">
                            <textarea
                                value={selectedNote.content}
                                onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })}
                                onBlur={handleBlur}
                                className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-300 leading-relaxed custom-scrollbar"
                                placeholder="Commencez à écrire..."
                            />
                        </div>
                        <div className="flex-none px-6 py-2 border-t border-white/5 text-[10px] text-slate-600 flex justify-between">
                            <span>ID: {selectedNote.id}</span>
                            <span>
                                {isSaving ? 'Enregistrement...' : `Mis à jour: ${new Date(selectedNote.updated_at).toLocaleTimeString()}`}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>Sélectionnez une note ou créez-en une nouvelle.</p>
                        {!userId && <p className="text-xs text-red-400 mt-2">Connectez-vous pour sauvegarder.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
