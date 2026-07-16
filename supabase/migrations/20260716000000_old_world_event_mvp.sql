-- Additive canonical game association for event-ready armies. Existing display
-- strings remain intact for compatibility; recognized rows are safely backfilled.
alter table public.army_lists
  add column if not exists game_key text,
  add column if not exists description text;

alter table public.army_lists drop constraint if exists army_lists_game_key_check;
alter table public.army_lists add constraint army_lists_game_key_check check (game_key is null or game_key in (
  'warhammer-40k','kill-team','necromunda','battlefleet-gothic','horus-heresy',
  'legions-imperialis','adeptus-titanicus','age-of-sigmar','warcry','the-old-world'
));

update public.army_lists set game_key = case game_system
  when 'Warhammer: The Old World' then 'the-old-world'
  when 'The Old World' then 'the-old-world'
  when 'Warhammer 40,000' then 'warhammer-40k'
  when 'Warhammer: Age of Sigmar' then 'age-of-sigmar'
  when 'Warhammer Age of Sigmar' then 'age-of-sigmar'
  when 'The Horus Heresy' then 'horus-heresy'
  when 'Horus Heresy' then 'horus-heresy'
  when 'Kill Team' then 'kill-team'
  else game_key end
where game_key is null;

create index if not exists army_lists_user_game_idx on public.army_lists(user_id, game_key, updated_at desc);

-- Direct table access previously exposed both snapshot JSON columns to either
-- participant. Server routes use this function to receive a viewer-redacted row.
-- This is an extension point for fully moving matchup reads/writes behind RPCs.
comment on column public.army_matchups.creator_snapshot is
  'Immutable creator snapshot. Never expose to the opponent before revealed_at; use server-side redaction.';
comment on column public.army_matchups.opponent_snapshot is
  'Immutable opponent snapshot. Never expose to the creator before revealed_at; use server-side redaction.';
