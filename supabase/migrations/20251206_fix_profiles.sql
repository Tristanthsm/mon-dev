-- Recréation robuste de la table profiles (idempotent)
-- S’assure que la table existe, les colonnes/contraintes sont en place, et que le RLS est défini proprement.

-- Extensions nécessaires pour gen_random_uuid si utilisées ailleurs
create extension if not exists "pgcrypto";

-- Table
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    username text,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Contraintes uniques (insensibles à la casse) et index
create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create index if not exists profiles_created_at_idx on public.profiles (created_at);

-- Synchronisation de updated_at
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

-- RLS
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

create policy profiles_select_own
    on public.profiles
    for select
    using (auth.uid() = id);

create policy profiles_insert_own
    on public.profiles
    for insert
    with check (auth.uid() = id);

create policy profiles_update_own
    on public.profiles
    for update
    using (auth.uid() = id);

create policy profiles_delete_own
    on public.profiles
    for delete
    using (auth.uid() = id);
