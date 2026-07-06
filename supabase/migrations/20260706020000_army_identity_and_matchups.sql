-- The Lexicon — Muster an Army overhaul: army identity fields + the
-- foundation for sealed/locked matchup exchange.

-- ---------------------------------------------------------------------
-- army_lists: richer identity fields for the "musters as user-owned
-- army" reframe. Existing rows default to sensible empty values.
-- ---------------------------------------------------------------------

alter table public.army_lists
  add column if not exists subfaction text,
  add column if not exists datasheet_count integer,
  add column if not exists model_count integer,
  add column if not exists detachment_names text[] not null default '{}',
  add column if not exists detachment_points numeric,
  add column if not exists playstyle_tags text[] not null default '{}',
  add column if not exists tactical_summary jsonb,
  add column if not exists visibility text not null default 'private',
  add column if not exists locked_at timestamptz,
  add column if not exists visual_identity_json jsonb;

alter table public.army_lists
  drop constraint if exists army_lists_visibility_check;
alter table public.army_lists
  add constraint army_lists_visibility_check
  check (visibility in ('private', 'shareable', 'matched_only'));

comment on column public.army_lists.visibility is
  'private: only the owner can see it. shareable: owner has opted to let a readable overview be shared. matched_only: only visible to a locked matchup opponent (see army_matchups).';
comment on column public.army_lists.tactical_summary is
  'Deterministic "what this army can field" reading — broad role, strengths, weaknesses, threat groupings, and per-unit plain-English notes. See lib/army-lists/tactical-overview.ts.';
comment on column public.army_lists.visual_identity_json is
  'Deterministic sigil derived from faction + name + playstyle tags — motif/icon/accent/frame/texture/seed. See lib/armies/visual-identity.ts.';

-- ---------------------------------------------------------------------
-- army_matchups: the sealed/locked list exchange foundation. Two
-- players each pick an army; neither can see the other's list until
-- both have locked. Snapshots are taken at lock time so later edits to
-- the source army don't change an already-agreed matchup.
-- ---------------------------------------------------------------------

create table if not exists public.army_matchups (
  id                  uuid primary key default gen_random_uuid(),
  creator_user_id     uuid not null references auth.users (id) on delete cascade,
  opponent_user_id    uuid references auth.users (id) on delete set null,
  creator_army_id     uuid not null references public.army_lists (id) on delete cascade,
  opponent_army_id    uuid references public.army_lists (id) on delete cascade,
  creator_locked_at   timestamptz,
  opponent_locked_at  timestamptz,
  creator_snapshot    jsonb,
  opponent_snapshot   jsonb,
  revealed_at         timestamptz,
  status              text not null default 'pending'
                        check (status in ('pending', 'one_locked', 'revealed', 'cancelled')),
  invite_code         text not null unique
                        default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint army_matchups_distinct_sides check (
    opponent_user_id is null or opponent_user_id <> creator_user_id
  )
);

create index if not exists army_matchups_creator_idx
  on public.army_matchups (creator_user_id, created_at desc);

create index if not exists army_matchups_opponent_idx
  on public.army_matchups (opponent_user_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'army_matchups_set_updated_at'
      and tgrelid = 'public.army_matchups'::regclass
  ) then
    create trigger army_matchups_set_updated_at
      before update on public.army_matchups
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

alter table public.army_matchups enable row level security;

-- NOTE (fairness caveat — tracked as a follow-up): RLS here is row-level,
-- not column-level, so a participant's SELECT technically returns both
-- snapshot columns once the row is visible to them. The app never lets
-- either side read this table directly — app/api/matchups/[id]/route.ts
-- is the only sanctioned read path, and it redacts the opponent snapshot
-- (lib/matchups/reveal.ts) until both sides have locked. A future
-- migration should move the redaction into a SECURITY DEFINER function
-- so the guarantee holds even against direct REST/table queries.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'army_matchups'
      and policyname = 'Participants can read their own matchups'
  ) then
    create policy "Participants can read their own matchups"
      on public.army_matchups for select
      to authenticated
      using ((select auth.uid()) in (creator_user_id, opponent_user_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'army_matchups'
      and policyname = 'Creators can start a matchup with their own army'
  ) then
    create policy "Creators can start a matchup with their own army"
      on public.army_matchups for insert
      to authenticated
      with check (
        (select auth.uid()) = creator_user_id
        and exists (
          select 1 from public.army_lists
          where id = creator_army_id and user_id = (select auth.uid())
        )
      );
  end if;

  -- Updates are only ever performed through
  -- app/api/matchups/[id]/lock/route.ts, which derives which side is
  -- locking from the authenticated user and only ever writes that
  -- side's lock timestamp + snapshot (plus the recomputed
  -- status/revealed_at). The policy still restricts writes to
  -- participants as defense in depth.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'army_matchups'
      and policyname = 'Participants can lock their own side'
  ) then
    create policy "Participants can lock their own side"
      on public.army_matchups for update
      to authenticated
      using ((select auth.uid()) in (creator_user_id, opponent_user_id))
      with check ((select auth.uid()) in (creator_user_id, opponent_user_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'army_matchups'
      and policyname = 'An invited opponent can join by user id'
  ) then
    create policy "An invited opponent can join by user id"
      on public.army_matchups for update
      to authenticated
      using (opponent_user_id is null and (select auth.uid()) <> creator_user_id)
      with check (opponent_user_id = (select auth.uid()));
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Account deletion must also clear matchups the account participates in.
-- ---------------------------------------------------------------------

create or replace function public.delete_account_owned_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from target_user_id then
    raise exception 'Cannot delete another user account.' using errcode = '42501';
  end if;

  delete from public.army_matchups
    where creator_user_id = target_user_id or opponent_user_id = target_user_id;

  delete from public.army_lists where user_id = target_user_id;
  delete from public.armies where user_id = target_user_id;
  delete from public.battles where logged_by = target_user_id;
  delete from public.connections
    where requester_id = target_user_id or addressee_id = target_user_id;

  delete from public.venue_external_sources
    where venue_id in (
      select id from public.venues where created_by = target_user_id
    );
  delete from public.venues where created_by = target_user_id;
  delete from public.campaigns where created_by = target_user_id;

  update public.battles set opponent_id = null where opponent_id = target_user_id;
  update public.venues
    set claimed_by = null, claimed_at = null
    where claimed_by = target_user_id;

  delete from public.profiles where id = target_user_id;
end;
$$;

revoke all on function public.delete_account_owned_data(uuid) from public;
grant execute on function public.delete_account_owned_data(uuid) to authenticated;
