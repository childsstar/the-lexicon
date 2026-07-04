-- The Lexicon — draft schema v0.1
--
-- Initial draft of the core tables for the prototype. This file is a design
-- document as much as a migration: review it, then apply it manually via the
-- Supabase SQL editor (or wire it into supabase/migrations once the CLI is
-- set up). It is NOT applied automatically by the app or the build.
--
-- Conventions:
--   * UUID primary keys (gen_random_uuid()).
--   * created_at / updated_at on every table; updated_at maintained by
--     trigger.
--   * Row Level Security enabled on every table with owner-scoped policies.
--     Public/read-sharing policies can be layered on later.

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — DEFINED IN schema_v0_1_profiles.sql
--
-- The profiles table moved to its own file when auth shipped; run
-- schema_v0_1_profiles.sql FIRST, then this file. The tables below
-- reference public.profiles (id).
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- armies — forces a user fields
-- ---------------------------------------------------------------------------
create table if not exists public.armies (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  name          text not null,
  faction       text not null,
  game_system   text not null,
  points_value  integer,          -- optional headline size; no rules data
  paint_status  text,             -- e.g. unbuilt, built, painted
  lore          text,             -- the story behind the force
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists armies_user_id_idx on public.armies (user_id);

create trigger armies_set_updated_at
  before update on public.armies
  for each row execute function public.set_updated_at();

alter table public.armies enable row level security;

create policy "Users can view their own armies"
  on public.armies for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can manage their own armies"
  on public.armies for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- venues — places where games happen (community-curated)
-- ---------------------------------------------------------------------------
create table if not exists public.venues (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid references public.profiles (id) on delete set null,
  name          text not null,
  venue_type    text not null,    -- e.g. game_store, club, private, event_space
  website       text,             -- optional
  region        text,             -- coarse location; precise address later
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

alter table public.venues enable row level security;

create policy "Venues are viewable by authenticated users"
  on public.venues for select
  to authenticated
  using (true);

create policy "Users can add venues"
  on public.venues for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "Creators can update their venues"
  on public.venues for update
  to authenticated
  using ((select auth.uid()) = created_by);

-- ---------------------------------------------------------------------------
-- campaigns — long-running narratives spanning many battles
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid references public.profiles (id) on delete set null,
  title         text not null,
  description   text,
  game_system   text,
  status        text not null default 'active', -- active, completed, abandoned
  started_on    date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

alter table public.campaigns enable row level security;

create policy "Campaigns are viewable by authenticated users"
  on public.campaigns for select
  to authenticated
  using (true);

create policy "Users can create campaigns"
  on public.campaigns for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "Creators can update their campaigns"
  on public.campaigns for update
  to authenticated
  using ((select auth.uid()) = created_by);

-- ---------------------------------------------------------------------------
-- battles — a single logged engagement
-- ---------------------------------------------------------------------------
create table if not exists public.battles (
  id             uuid primary key default gen_random_uuid(),
  logged_by      uuid not null references public.profiles (id) on delete cascade,
  date           date not null,
  name           text,             -- optional battle name, e.g. "Siege of Emberfall"
  army_id        uuid references public.armies (id) on delete set null,
  opponent_id    uuid references public.profiles (id) on delete set null,
  opponent_name  text,             -- free text when the opponent isn't on the platform
  venue_id       uuid references public.venues (id) on delete set null,
  campaign_id    uuid references public.campaigns (id) on delete set null,
  outcome        text,             -- e.g. victory, defeat, draw
  report         text,             -- narrative battle report
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists battles_logged_by_idx on public.battles (logged_by);
create index if not exists battles_campaign_id_idx on public.battles (campaign_id);

create trigger battles_set_updated_at
  before update on public.battles
  for each row execute function public.set_updated_at();

alter table public.battles enable row level security;

create policy "Users can view their own battles"
  on public.battles for select
  to authenticated
  using ((select auth.uid()) in (logged_by, opponent_id));

create policy "Users can manage battles they logged"
  on public.battles for all
  to authenticated
  using ((select auth.uid()) = logged_by)
  with check ((select auth.uid()) = logged_by);

-- ---------------------------------------------------------------------------
-- connections — player-to-player links (requested → accepted)
-- ---------------------------------------------------------------------------
create table if not exists public.connections (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles (id) on delete cascade,
  addressee_id  uuid not null references public.profiles (id) on delete cascade,
  status        text not null default 'pending', -- pending, accepted, declined, blocked
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint connections_no_self check (requester_id <> addressee_id),
  constraint connections_unique_pair unique (requester_id, addressee_id)
);

create index if not exists connections_addressee_idx on public.connections (addressee_id);

create trigger connections_set_updated_at
  before update on public.connections
  for each row execute function public.set_updated_at();

alter table public.connections enable row level security;

create policy "Users can view their own connections"
  on public.connections for select
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Users can request connections"
  on public.connections for insert
  to authenticated
  with check ((select auth.uid()) = requester_id);

create policy "Either side can update a connection"
  on public.connections for update
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
