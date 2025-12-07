'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, ChevronDown, Plus, Folder, MessageSquare, ChevronRight, Hash, MoreHorizontal, Settings2, Sparkles, FolderPlus, Edit2, Trash2, Box, BrainCircuit, Mic, Zap, X, Save, FileText, User as UserIcon, Bot } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AIMode } from '@/components/ai/AIChatModeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const MODES: { id: AIMode; label: string; icon: any; color: string }[] = [
    { id: 'general', label: 'General', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'expert', label: 'Code Expert', icon: Hash, color: 'text-emerald-400' },
    { id: 'architect', label: 'Architect', icon: Folder, color: 'text-violet-400' },
    { id: 'debug', label: 'Debugger', icon: Settings2, color: 'text-amber-400' },
];

export default function AgentChat() {
    const supabase = createClient();
    const [selectedMode, setSelectedMode] = useState<AIMode>('general');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // History & Folders State
    const [folders, setFolders] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // New State for UI Actions
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [plusMenuOpen, setPlusMenuOpen] = useState(false);
    const [plusMenuTab, setPlusMenuTab] = useState<'modes' | 'models'>('modes');

    // Voice State
    const [isListening, setIsListening] = useState(false);

    // Drag & Drop State
    const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

    // Quick Actions State
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const [quickActionMode, setQuickActionMode] = useState<'menu' | 'note'>('menu');
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                refreshData(user.id);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const refreshData = async (uid: string) => {
        const { data: foldersData } = await supabase.from('ai_folders').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        const { data: sessionsData } = await supabase.from('ai_sessions').select('*').eq('user_id', uid).order('updated_at', { ascending: false });

        if (foldersData) setFolders(foldersData);
        if (sessionsData) setSessions(sessionsData);
    };

    // Load messages for a session
    const loadSessionMessages = async (sessionId: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error(error);
            setIsLoading(false);
            return;
        }

        if (data) {
            // Transform DB messages to UI format
            const loadedMessages: Message[] = [];
            data.forEach((row: any) => {
                // User message
                loadedMessages.push({
                    id: row.id + '_user',
                    role: 'user',
                    content: row.message,
                    timestamp: new Date(row.created_at)
                });
                // Assistant response
                loadedMessages.push({
                    id: row.id + '_ai',
                    role: 'assistant',
                    content: row.response,
                    timestamp: new Date(row.created_at)
                });
            });
            setMessages(loadedMessages);
        }
        setIsLoading(false);
    };

    // Selecting a session
    const selectSession = async (sessionId: string) => {
        if (currentSessionId === sessionId) return;
        setCurrentSessionId(sessionId);
        await loadSessionMessages(sessionId);
    };

    const handleSendMessage = async () => {
        const userMessage = input.trim();
        if (!userMessage) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const assistantId = (Date.now() + 1).toString();
        // Placeholder for streaming or waiting
        const placeholder: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() };
        setMessages(prev => [...prev, placeholder]);

        try {
            // Simplified history for API - keeping context
            const history = messages.slice(-10).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                parts: [{ text: msg.content }]
            }));

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history, // This might need adjustment based on route expectation
                    mode: selectedMode,
                    userId,
                    sessionId: currentSessionId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erreur ${response.status}: ${data.error}`);
            }

            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: data.content } : m));

            if (!currentSessionId && data.sessionId) {
                setCurrentSessionId(data.sessionId);
                if (userId) refreshData(userId);
            } else if (currentSessionId && userId) {
                // Update the last updated time in the specific session object locally if needed, or just refresh
                refreshData(userId);
            }

        } catch (error: any) {
            console.error(error);
            const errorMessage = error.message || "Erreur de connexion.";
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `⚠️ **Erreur**: ${errorMessage}\n\nVérifiez votre connexion ou la configuration API.` } : m));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.start();
    };


    // ... (Keep existing Folder/Session Logic - simplified for brevity in this replace, ensuring logic is preserved)
    const createFolder = async () => {
        if (!newFolderName.trim() || !userId) return;
        await supabase.from('ai_folders').insert({ user_id: userId, name: newFolderName });
        setNewFolderName('');
        setIsCreatingFolder(false);
        refreshData(userId);
    };

    const handleDragStart = (e: React.DragEvent, sessionId: string) => {
        setDraggedSessionId(sessionId);
    };

    const handleDragOver = (e: React.DragEvent, folderId: string) => {
        e.preventDefault();
        setDragOverFolderId(folderId);
    };

    const handleDrop = async (e: React.DragEvent, folderId: string | null) => { // folderId null = root
        e.preventDefault();
        if (!draggedSessionId || !userId) return;

        await supabase.from('ai_sessions').update({ folder_id: folderId }).eq('id', draggedSessionId);

        setDraggedSessionId(null);
        setDragOverFolderId(null);
        refreshData(userId);
    };

    const deleteFolder = async (folderId: string) => {
        if (!confirm('Supprimer ce dossier ? Les conversations seront déplacées à la racine.')) return;

        // 1. Unlink sessions
        await supabase.from('ai_sessions').update({ folder_id: null }).eq('folder_id', folderId);

        // 2. Delete folder
        const { error } = await supabase.from('ai_folders').delete().eq('id', folderId);
        if (error) {
            alert("Erreur lors de la suppression du dossier");
            return;
        }
        if (userId) refreshData(userId);
    };

    // ... inside AgentChat

    const handleAutoGenerateNote = async () => {
        if (messages.length === 0) {
            alert("Aucune conversation à résumer.");
            return;
        }
        if (!userId) return;

        setIsSavingNote(true);
        try {
            // 1. Generate Summary via AI
            const summaryPrompt = `
                Analyse la conversation ci-dessus et génère une note de synthèse structurée. 
                Tu DOIS répondre UNIQUEMENT au format JSON valide suivant, sans rien d'autre (pas de markdown, pas de texte avant/après) :
                {
                    "title": "Un titre court et pertinent résumant le sujet",
                    "content": "Un résumé détaillé des points clés, solutions techniques ou décisions prises, formaté en Markdown."
                }
            `;

            // Simplified history for API
            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                parts: [{ text: msg.content }]
            }));

            // Append specific prompt for this 'hidden' request
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: summaryPrompt,
                    history: history,
                    mode: 'expert', // Use expert mode for better technical summaries
                    userId,
                    sessionId: currentSessionId
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la génération");

            const data = await response.json();
            let aiText = data.content;

            // Clean up code blocks if the AI wraps JSON in ```json ... ```
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

            let noteData;
            try {
                noteData = JSON.parse(aiText);
            } catch (e) {
                console.error("JSON Parse Error", e);
                // Fallback if JSON fails
                noteData = {
                    title: "Note Automatique",
                    content: aiText
                };
            }

            // 2. Save to Supabase
            const { error } = await supabase.from('blocnode_notes').insert({
                user_id: userId,
                title: noteData.title,
                content: noteData.content,
                tag: 'AI Summary'
            });

            if (error) throw error;

            alert("Note créée avec succès !");
            setQuickActionsOpen(false);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création de la note.");
        } finally {
            setIsSavingNote(false);
        }
    };

    // Render Helper: Chat Bubbles
    const renderMessage = (msg: Message) => {
        const isUser = msg.role === 'user';
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 mt-1 shrink-0 border border-slate-700">
                        <Bot size={16} className="text-cyan-400" />
                    </div>
                )}

                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${isUser
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                    }`}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-code:text-cyan-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return match ? (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="bg-slate-700/50 px-1 py-0.5 rounded text-cyan-200" {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center ml-3 mt-1 shrink-0 border border-indigo-500/30">
                        <UserIcon size={16} className="text-indigo-400" />
                    </div>
                )}
            </motion.div>
        );
    };

    const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (!confirm('Supprimer cette conversation ?')) return;

        const { error } = await supabase.from('ai_sessions').delete().eq('id', sessionId);
        if (error) {
            alert("Erreur lors de la suppression");
            return;
        }

        if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
            setMessages([]);
        }
        if (userId) refreshData(userId);
    };

    if (!mounted) return null;

    // ... (inside AgentChat component)

    // Layout Fix: Use h-dvh for mobile browsers
    return (
        <div className="flex h-screen h-dvh bg-[#0F172A] text-slate-200 overflow-hidden font-sans relative">
            {/* Sidebar */}
            <div className="w-[300px] border-r border-slate-800 flex flex-col bg-[#0F172A] shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <button
                        onClick={() => {
                            setCurrentSessionId(null);
                            setMessages([]);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={18} />
                        <span>Nouvelle conversation</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {/* Folders & Sessions List (Unchanged) */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dossiers</span>
                            <button onClick={() => setIsCreatingFolder(true)} className="text-slate-500 hover:text-white transition-colors">
                                <FolderPlus size={14} />
                            </button>
                        </div>

                        {isCreatingFolder && (
                            <div className="px-2 mb-2">
                                <input
                                    autoFocus
                                    className="w-full bg-slate-800 text-sm px-2 py-1 rounded border border-slate-700 outline-none focus:border-cyan-500"
                                    placeholder="Nom du dossier..."
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                                    onBlur={() => setIsCreatingFolder(false)}
                                />
                            </div>
                        )}

                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onDragOver={(e) => handleDragOver(e, folder.id)}
                                onDrop={(e) => handleDrop(e, folder.id)}
                                className={`rounded-lg transition-colors ${dragOverFolderId === folder.id ? 'bg-slate-800/80 border border-dashed border-cyan-500' : ''}`}
                            >
                                <div
                                    className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg group cursor-pointer"
                                    onClick={() => {
                                        const newSet = new Set(expandedFolders);
                                        if (newSet.has(folder.id)) newSet.delete(folder.id);
                                        else newSet.add(folder.id);
                                        setExpandedFolders(newSet);
                                    }}
                                >
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <ChevronRight size={14} className={`transition-transform duration-200 ${expandedFolders.has(folder.id) ? 'rotate-90' : ''}`} />
                                        <Folder size={14} className="text-cyan-500" />
                                        <span className="font-medium">{folder.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                        title="Supprimer le dossier"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {expandedFolders.has(folder.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-4 pl-2 border-l border-slate-700 space-y-0.5"
                                        >
                                            {sessions.filter(s => s.folder_id === folder.id).map(session => (
                                                <div
                                                    key={session.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, session.id)}
                                                    onClick={() => {
                                                        selectSession(session.id);
                                                    }}
                                                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-all ${currentSessionId === session.id ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <MessageSquare size={14} />
                                                        <span className="truncate">{session.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteSession(e, session.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {sessions.filter(s => s.folder_id === folder.id).length === 0 && (
                                                <div className="p-2 text-xs text-slate-600 italic">Vide</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1 mt-6" onDragOver={(e) => handleDragOver(e, 'root')} onDrop={(e) => handleDrop(e, null)}>
                        <div className="px-2 mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Récents</span>
                        </div>
                        {sessions.filter(s => !s.folder_id).map(session => (
                            <div
                                key={session.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, session.id)}
                                onClick={() => selectSession(session.id)}
                                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all ${currentSessionId === session.id ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <MessageSquare size={14} />
                                    <span className="truncate">{session.title}</span>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-[#0F172A] min-h-0">
                {/* Header */}
                <div className="h-16 shrink-0 border-b border-slate-700/50 flex items-center justify-between px-6 bg-[#0F172A]/80 backdrop-blur-md z-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="font-semibold text-slate-200 tracking-tight">Agent IA</span>
                        <span className="text-slate-600 text-sm px-2 py-0.5 bg-slate-800 rounded border border-slate-700">{MODES.find(m => m.id === selectedMode)?.label}</span>
                    </div>
                </div>

                {/* Content Area - Flex Col for centering input when empty */}
                <div className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 pb-32 animate-[fadeIn_0.5s_ease-out_forwards]">
                            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-900/10 border border-slate-700">
                                <Sparkles size={40} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Bonjour, Tristan.</h2>
                            <p className="text-slate-400 max-w-md text-center mb-8">
                                Je suis prêt à vous aider ({MODES.find(m => m.id === selectedMode)?.label}).
                            </p>

                            {/* Centered Input for New Chat */}
                            <div className="w-full max-w-2xl relative z-10">
                                <div className="relative bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-300 focus-within:shadow-cyan-900/20 focus-within:border-cyan-500/30">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={`Envoyer un message à l'agent (${MODES.find(m => m.id === selectedMode)?.label})...`}
                                        className="w-full bg-transparent text-slate-200 p-4 pl-6 pr-24 min-h-[60px] max-h-[200px] outline-none resize-none custom-scrollbar rounded-2xl text-base"
                                        rows={1}
                                        autoFocus
                                    />
                                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                        <button
                                            onClick={toggleVoiceInput}
                                            className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                        >
                                            <Mic size={20} />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isLoading || !input.trim()}
                                            className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center mt-4 flex gap-4 justify-center">
                                    <button onClick={() => { setPlusMenuOpen(true) }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        <Zap size={14} />
                                        <span>Modèles & Modes</span>
                                    </button>
                                </div>

                                {/* Plus Menu (Centered Context) */}
                                <AnimatePresence>
                                    {plusMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-72 bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50 mx-auto right-0"
                                        >
                                            <div className="flex border-b border-slate-700/50">
                                                <button
                                                    onClick={() => setPlusMenuTab('modes')}
                                                    className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${plusMenuTab === 'modes' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    Modes
                                                </button>
                                                <button
                                                    onClick={() => setPlusMenuTab('models')}
                                                    className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${plusMenuTab === 'models' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    Modèles
                                                </button>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {plusMenuTab === 'modes' ? (
                                                    MODES.map(mode => (
                                                        <button
                                                            key={mode.id}
                                                            onClick={() => { setSelectedMode(mode.id); setPlusMenuOpen(false); }}
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${selectedMode === mode.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                                        >
                                                            <mode.icon size={18} />
                                                            <span className="text-sm font-medium">{mode.label}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-center text-slate-500 text-sm italic">
                                                        DeepSeek Actif
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 px-4 md:px-8 pt-6 pb-2 space-y-6">
                                <div className="max-w-4xl mx-auto w-full">
                                    {messages.map(renderMessage)}
                                    {isLoading && (
                                        <div className="flex justify-start mb-6 animate-pulse">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 mt-1 shrink-0 border border-slate-700">
                                                <Loader size={16} className="text-cyan-400 animate-spin" />
                                            </div>
                                            <div className="bg-slate-800/50 rounded-2xl px-5 py-3.5 border border-slate-700/50">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Bottom Input Area (Standard) */}
                            <div className="shrink-0 p-6 pb-8 bg-gradient-to-t from-[#0F172A] to-[#0F172A]/80 z-10 w-full max-w-5xl mx-auto">
                                <div className="relative bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-lg transition-all duration-300 focus-within:shadow-cyan-900/20 focus-within:border-cyan-500/30">
                                    <div className="absolute left-2 bottom-3 z-20">
                                        <button
                                            onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                                            className={`p-2 rounded-full transition-all duration-300 ${plusMenuOpen ? 'bg-cyan-500 rotate-45 text-white' : 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700'}`}
                                        >
                                            <Plus size={20} />
                                        </button>
                                        <AnimatePresence>
                                            {plusMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    className="absolute bottom-12 left-0 mb-2 w-72 bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                                                >
                                                    <div className="flex border-b border-slate-700/50">
                                                        <button
                                                            onClick={() => setPlusMenuTab('modes')}
                                                            className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${plusMenuTab === 'modes' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            Modes
                                                        </button>
                                                        <button
                                                            onClick={() => setPlusMenuTab('models')}
                                                            className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${plusMenuTab === 'models' ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            Modèles
                                                        </button>
                                                    </div>
                                                    <div className="p-2 space-y-1">
                                                        {plusMenuTab === 'modes' ? (
                                                            MODES.map(mode => (
                                                                <button
                                                                    key={mode.id}
                                                                    onClick={() => { setSelectedMode(mode.id); setPlusMenuOpen(false); }}
                                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${selectedMode === mode.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                                                >
                                                                    <mode.icon size={18} />
                                                                    <span className="text-sm font-medium">{mode.label}</span>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-center text-slate-500 text-sm italic">
                                                                DeepSeek Actif
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={`Message...`}
                                        className="w-full bg-transparent text-slate-200 p-4 pl-14 pr-24 min-h-[60px] max-h-[200px] outline-none resize-none custom-scrollbar rounded-2xl text-base"
                                        rows={1}
                                        autoFocus
                                    />

                                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                        <button
                                            onClick={toggleVoiceInput}
                                            className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                        >
                                            <Mic size={20} />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isLoading || !input.trim()}
                                            className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Actions Side Panel Trigger (Right Side) */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${quickActionsOpen ? 'translate-x-full' : 'translate-x-0'}`}>
                <button
                    onClick={() => setQuickActionsOpen(true)}
                    className="flex flex-col items-center gap-2 py-4 px-1.5 bg-slate-800/90 backdrop-blur border-l border-y border-slate-700 rounded-l-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-700 shadow-xl transition-all"
                    title="Outils"
                >
                    <Zap size={20} />
                    <span className="vertical-text text-[10px] font-bold tracking-widest uppercase opacity-70">Outils</span>
                </button>
            </div>

            {/* Side Panel Drawer */}
            <AnimatePresence>
                {quickActionsOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQuickActionsOpen(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-[#1E293B]/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                                    <Zap size={18} className="text-amber-400" />
                                    Boîte à Outils
                                </h3>
                                <button onClick={() => setQuickActionsOpen(false)} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Create Note Tool - AUTOMATIC */}
                                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-500">
                                        <Sparkles size={16} />
                                        Génération Magique
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Créez instantanément une note structurée résumant les points clés de cette conversation.
                                    </p>

                                    <button
                                        onClick={handleAutoGenerateNote}
                                        disabled={isSavingNote || messages.length === 0}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${isSavingNote
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-br from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-white shadow-orange-900/20'
                                            }`}
                                    >
                                        {isSavingNote ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                <span className="animate-pulse">Analyse...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bot size={18} />
                                                Générer la Note
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Placeholder for other tools */}
                                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 opacity-50">
                                    <div className="flex items-center gap-2 text-sm font-medium text-purple-400 mb-2">
                                        <BrainCircuit size={16} />
                                        Analyse Code (Soon)
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Extraction automatique de snippets et TODOs.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
            `}</style>
        </div>
    );
}
