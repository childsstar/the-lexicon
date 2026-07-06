-- The Lexicon — profiles schema v0.1 (auth foundation)
--
-- Run this in the Supabase SQL editor BEFORE using sign-up in the app.
-- It is not applied automatically.
--
-- This file is the authoritative definition of public.profiles and
-- SUPERSEDES the profiles table sketched in schema_v0_1.sql. If you already
-- ran that earlier draft, drop its version first:
--
--   -- drop table if exists public.profiles cascade;
--
-- (Safe on a fresh project with no data; the other draft tables reference
-- profiles, so cascade removes their foreign keys too — re-run their file
-- afterwards if needed.)

create extension if not exists pgcrypto;

-- Shared updated_at trigger helper (same function schema_v0_1.sql uses).
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
-- profiles — one row per user, keyed to auth.users.
--
-- Designed as the identity foundation for future matchmaking, community
-- discovery, Muster recommendations, venue/event discovery, and battle
-- history. Not created automatically on sign-up: the app routes new users
-- through /profile/setup, which inserts this row.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  username               text not null unique
                           check (username ~ '^[a-z0-9_]{3,32}$'),
  display_name           text,
  bio                    text,
  experience_level       text
                           check (experience_level is null or experience_level in
                             ('new', 'casual', 'experienced', 'competitive')),
  availability           text not null default '',
  preferred_play_style   text
                           check (preferred_play_style is null or preferred_play_style in
                             ('casual', 'narrative', 'competitive', 'mixed')),
  preferred_game_systems text[] not null default '{}',
  primary_factions       text[] not null default '{}',
  faction_interests      text[] not null default '{}',
  -- One or more cities/ZIP codes so a player can anchor to several local
  -- communities; geocoding happens later, store what the player typed.
  home_locations         text[] not null default '{}',
  -- Plain uuid for now; becomes a foreign key once venues ships for real.
  home_venue_id          uuid,
  -- Contact handle only. Discord OAuth sign-in is a planned follow-up —
  -- Supabase supports it natively (enable the Discord provider in the
  -- dashboard; no credentials belong in this repo).
  discord_username       text,
  avatar_url             text,
  -- Snapshot of ActiveUniverseState at last profile save (see
  -- supabase/migrations/20260705000000_add_active_context_to_profiles.sql
  -- for why there's no fixed-list check constraint here).
  preferred_universe_key text,
  preferred_realm_key    text,
  preferred_game_key     text,
  -- Onboarding passport fields (see
  -- supabase/migrations/20260706000000_add_passport_fields_to_profiles.sql).
  -- Which chronicle banner (lib/chronicle/banners.ts) a traveler chose
  -- during onboarding, if any — plain id, not a foreign key: banners are
  -- static data, not a table.
  banner_id              text,
  travel_radius_miles    integer
                           check (travel_radius_miles is null or
                             (travel_radius_miles > 0 and travel_radius_miles <= 500)),
  profile_completed_at   timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- v0.1 keeps profiles private to their owner. When community discovery
-- ships, add a deliberate public-read policy exposing only the fields
-- matchmaking needs — don't expose everything by default.
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
