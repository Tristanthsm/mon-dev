-- Profiles liés à l'auth Supabase

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text unique,
    username text,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
    on public.profiles
    for select
    using (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles
    for update
    using (auth.uid() = id);

create policy "profiles_insert_own"
    on public.profiles
    for insert
    with check (auth.uid() = id);

-- Trigger updated_at
create or replace function public.profiles_set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
    before update on public.profiles
    for each row execute function public.profiles_set_updated_at();
