-- Create table for storing trending videos snapshots
create table if not exists youtube_trends (
  id uuid default gen_random_uuid() primary key,
  video_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  channel_title text,
  view_count bigint,
  like_count bigint,
  comment_count bigint,
  published_at timestamptz,
  tags text[],
  category_id text,
  fetched_at timestamptz default now() not null,
  trend_type text default 'general' -- 'general', 'business', 'tech', etc.
);

-- Create table for tracked searches (keywords)
create table if not exists youtube_searches (
  id uuid default gen_random_uuid() primary key,
  keyword text not null unique,
  last_fetched_at timestamptz,
  created_at timestamptz default now() not null
);

-- Create table for tracked channels
create table if not exists youtube_channels (
  id uuid default gen_random_uuid() primary key,
  channel_id text not null unique,
  title text not null,
  subscriber_count bigint,
  video_count bigint,
  view_count bigint,
  last_updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table youtube_trends enable row level security;
alter table youtube_searches enable row level security;
alter table youtube_channels enable row level security;

-- Policies (Open for now as it's internal tool, or restrict to authenticated)
create policy "Allow read access for authenticated users" on youtube_trends for select using (auth.role() = 'authenticated');
create policy "Allow insert access for authenticated users" on youtube_trends for insert with check (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on youtube_searches for select using (auth.role() = 'authenticated');
create policy "Allow all access for authenticated users" on youtube_searches for all using (auth.role() = 'authenticated');

create policy "Allow read access for authenticated users" on youtube_channels for select using (auth.role() = 'authenticated');
create policy "Allow all access for authenticated users" on youtube_channels for all using (auth.role() = 'authenticated');
