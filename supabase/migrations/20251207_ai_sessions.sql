-- 1. Create AI Sessions table
create table if not exists public.ai_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade not null,
    title text default 'Nouvelle conversation',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Add session_id to existing conversations table
alter table public.ai_conversations 
add column if not exists session_id uuid references public.ai_sessions (id) on delete cascade;

-- 3. RLS for Sessions
alter table public.ai_sessions enable row level security;

create policy "Users can view own sessions"
    on public.ai_sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert own sessions"
    on public.ai_sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update own sessions"
    on public.ai_sessions for update
    using (auth.uid() = user_id);

create policy "Users can delete own sessions"
    on public.ai_sessions for delete
    using (auth.uid() = user_id);

-- 4. Index
create index if not exists idx_ai_sessions_user on public.ai_sessions(user_id, updated_at desc);
