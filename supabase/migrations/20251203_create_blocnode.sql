-- BlocNode: notes et tags simples, liées à l'utilisateur

create table if not exists public.blocnode_notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade,
    title text default '',
    content text default '',
    tag text default '',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists blocnode_notes_user_idx on public.blocnode_notes (user_id);
create index if not exists blocnode_notes_tag_idx on public.blocnode_notes (tag);

alter table public.blocnode_notes enable row level security;

create policy "blocnode_notes_select_own"
    on public.blocnode_notes
    for select
    using (auth.uid() = user_id);

create policy "blocnode_notes_insert_own"
    on public.blocnode_notes
    for insert
    with check (auth.uid() = user_id);

create policy "blocnode_notes_update_own"
    on public.blocnode_notes
    for update
    using (auth.uid() = user_id);

create policy "blocnode_notes_delete_own"
    on public.blocnode_notes
    for delete
    using (auth.uid() = user_id);

-- Trigger to maintain updated_at
create or replace function public.blocnode_notes_set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists blocnode_notes_updated_at on public.blocnode_notes;
create trigger blocnode_notes_updated_at
    before update on public.blocnode_notes
    for each row execute function public.blocnode_notes_set_updated_at();
