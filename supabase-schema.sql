-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- profiles: one row per user
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  country_code char(2) not null default 'US',
  created_at timestamptz default now() not null
);

-- scores: one best score per user per game
create table public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  game_slug text not null,
  score integer not null,
  updated_at timestamptz default now() not null,
  constraint scores_user_game_unique unique (user_id, game_slug)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.scores enable row level security;

-- profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- scores policies
create policy "Scores are viewable by everyone"
  on public.scores for select using (true);

create policy "Users can insert their own scores"
  on public.scores for insert with check (auth.uid() = user_id);

create policy "Users can update their own scores"
  on public.scores for update using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Jangles Bucks: immutable transaction ledger
-- Run this block separately in Supabase SQL Editor after running the above
-- ─────────────────────────────────────────────────────────────────────────────

create table public.bucks_log (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  game_slug  text not null,
  action     text not null check (action in ('earn', 'spend')),
  amount     integer not null default 1,
  earn_date  date,
  created_at timestamptz default now() not null
);

-- Once per game per calendar day (server-enforced, can't be gamed from client)
create unique index bucks_log_daily_earn_idx
  on public.bucks_log (user_id, game_slug, earn_date)
  where action = 'earn';

-- Derived balance view — balance = sum(earns) - sum(spends)
create or replace view public.bucks_balance as
select
  user_id,
  sum(case when action = 'earn' then amount else -amount end) as balance
from public.bucks_log
group by user_id;

alter table public.bucks_log enable row level security;

create policy "read own bucks"
  on public.bucks_log for select using (auth.uid() = user_id);

create policy "insert own bucks"
  on public.bucks_log for insert with check (auth.uid() = user_id);
-- No update/delete policies = immutable ledger
