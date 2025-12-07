-- 1. Create AI Folders table
create table if not exists public.ai_folders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade not null,
    name text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Add folder_id to ai_sessions
alter table public.ai_sessions 
add column if not exists folder_id uuid references public.ai_folders (id) on delete set null;

-- 3. RLS for Folders
alter table public.ai_folders enable row level security;

create policy "Users can view own folders"
    on public.ai_folders for select
    using (auth.uid() = user_id);

create policy "Users can insert own folders"
    on public.ai_folders for insert
    with check (auth.uid() = user_id);

create policy "Users can update own folders"
    on public.ai_folders for update
    using (auth.uid() = user_id);

create policy "Users can delete own folders"
    on public.ai_folders for delete
    using (auth.uid() = user_id);

-- 4. Trigger to update updated_at (optional but good practice)
-- reusing existing pattern if available, or omitting for brevity/speed as not strictly critical for this feature
