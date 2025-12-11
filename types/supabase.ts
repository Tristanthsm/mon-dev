export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            ai_conversations: {
                Row: {
                    created_at: string | null
                    id: string
                    is_uncensored: boolean
                    message: string
                    model_used: string
                    response: string
                    session_id: string | null
                    tokens_completion: number | null
                    tokens_prompt: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_uncensored?: boolean
                    message: string
                    model_used: string
                    response: string
                    session_id?: string | null
                    tokens_completion?: number | null
                    tokens_prompt?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_uncensored?: boolean
                    message?: string
                    model_used?: string
                    response?: string
                    session_id?: string | null
                    tokens_completion?: number | null
                    tokens_prompt?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_conversations_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "ai_sessions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ai_folders: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            ai_sessions: {
                Row: {
                    created_at: string | null
                    folder_id: string | null
                    id: string
                    title: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    folder_id?: string | null
                    id?: string
                    title?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    folder_id?: string | null
                    id?: string
                    title?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_sessions_folder_id_fkey"
                        columns: ["folder_id"]
                        isOneToOne: false
                        referencedRelation: "ai_folders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            blocnode_notes: {
                Row: {
                    content: string | null
                    created_at: string
                    id: string
                    tag: string | null
                    title: string | null
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    tag?: string | null
                    title?: string | null
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    tag?: string | null
                    title?: string | null
                    updated_at?: string
                    user_id?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    display_name: string | null
                    email: string | null
                    id: string
                    location: string | null
                    username: string | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    display_name?: string | null
                    email?: string | null
                    id: string
                    location?: string | null
                    username?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    display_name?: string | null
                    email?: string | null
                    id?: string
                    location?: string | null
                    username?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_plan: ["free", "premium"]
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
