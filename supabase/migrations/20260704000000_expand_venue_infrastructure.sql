-- Expand the shipped Venue Infrastructure schema onto databases that still have
-- the original minimal public.venues table. This migration is intentionally
-- additive and idempotent so it can be pasted into the Supabase SQL Editor and
-- safely rerun.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.venues
  add column if not exists slug text,
  add column if not exists status text not null default 'active',
  add column if not exists visibility text not null default 'public',
  add column if not exists canonical_source text not null default 'lexicon',
  add column if not exists source_of_truth text not null default 'lexicon',
  add column if not exists confidence real,
  add column if not exists verified_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists region_code text,
  add column if not exists postal_code text,
  add column if not exists country_code text,
  add column if not exists formatted_address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists geocoded_at timestamptz,
  add column if not exists geocoding_source text,
  add column if not exists geocoding_confidence real,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists discord_server_id text,
  add column if not exists discord_invite_url text,
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by uuid references public.profiles (id) on delete set null,
  add column if not exists owner_notes text,
  add column if not exists venue_categories text[] not null default '{}',
  add column if not exists supported_game_systems text[] not null default '{}',
  add column if not exists has_tables boolean,
  add column if not exists has_retail boolean,
  add column if not exists has_events boolean,
  add column if not exists import_batch_id text,
  add column if not exists source_payload jsonb;

create unique index if not exists venues_slug_uidx
  on public.venues (slug)
  where slug is not null;
create index if not exists venues_city_region_country_idx
  on public.venues (city, region_code, country_code);
create index if not exists venues_latitude_longitude_idx
  on public.venues (latitude, longitude);
create index if not exists venues_status_visibility_idx
  on public.venues (status, visibility);
create index if not exists venues_created_by_idx
  on public.venues (created_by);
create index if not exists venues_import_batch_id_idx
  on public.venues (import_batch_id)
  where import_batch_id is not null;
create index if not exists venues_last_seen_at_idx
  on public.venues (last_seen_at);

create table if not exists public.venue_external_sources (
  id                uuid primary key default gen_random_uuid(),
  venue_id          uuid not null references public.venues (id) on delete cascade,
  source            text not null,
  source_id         text,
  source_url        text,
  external_name     text,
  external_payload  jsonb,
  confidence        real,
  verified_at       timestamptz,
  last_seen_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists venue_external_sources_venue_id_idx
  on public.venue_external_sources (venue_id);
create index if not exists venue_external_sources_source_source_id_idx
  on public.venue_external_sources (source, source_id);
create unique index if not exists venue_external_sources_source_id_uidx
  on public.venue_external_sources (source, source_id)
  where source_id is not null;
create index if not exists venue_external_sources_source_source_url_idx
  on public.venue_external_sources (source, source_url)
  where source_url is not null;
create index if not exists venue_external_sources_last_seen_at_idx
  on public.venue_external_sources (last_seen_at);

alter table public.venues enable row level security;
alter table public.venue_external_sources enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'venues_set_updated_at'
      and tgrelid = 'public.venues'::regclass
  ) then
    create trigger venues_set_updated_at
      before update on public.venues
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'venue_external_sources_set_updated_at'
      and tgrelid = 'public.venue_external_sources'::regclass
  ) then
    create trigger venue_external_sources_set_updated_at
      before update on public.venue_external_sources
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'venues'
      and policyname = 'Venues are viewable by authenticated users'
  ) then
    create policy "Venues are viewable by authenticated users"
      on public.venues for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'venues'
      and policyname = 'Users can add venues'
  ) then
    create policy "Users can add venues"
      on public.venues for insert
      to authenticated
      with check ((select auth.uid()) = created_by);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'venues'
      and policyname = 'Creators can update their venues'
  ) then
    create policy "Creators can update their venues"
      on public.venues for update
      to authenticated
      using ((select auth.uid()) = created_by)
      with check ((select auth.uid()) = created_by);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'venue_external_sources'
      and policyname = 'Venue external sources are viewable with venues'
  ) then
    create policy "Venue external sources are viewable with venues"
      on public.venue_external_sources for select
      to authenticated
      using (exists (
        select 1 from public.venues v where v.id = venue_external_sources.venue_id
      ));
  end if;
end;
$$;
