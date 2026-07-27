-- Production repair: the API writes army_lists.game_key, but some projects
-- were deployed without the migration that introduced it. Keep this migration
-- independently repeatable so it is safe both on those projects and on ones
-- that already ran 20260716000000/20260717000000.
alter table public.army_lists
  add column if not exists game_key text;

-- Only fill missing keys. Combine the legacy display value, parser snapshot,
-- and original roster so an unrecognised game_system does not hide stronger
-- metadata in another source. Existing non-null keys are never overwritten.
update public.army_lists
set game_key = case
  when lower(concat_ws(' ', game_system, parsed_json->>'game_system', raw_text)) like '%old world%'
    then 'the-old-world'
  when lower(concat_ws(' ', game_system, parsed_json->>'game_system', raw_text)) like '%age of sigmar%'
    then 'age-of-sigmar'
  when lower(concat_ws(' ', game_system, parsed_json->>'game_system', raw_text)) ~ 'warhammer\s*40,?000|\m40k\M'
    then 'warhammer-40k'
  when lower(concat_ws(' ', game_system, parsed_json->>'game_system', raw_text)) like '%kill team%'
    then 'kill-team'
  when lower(concat_ws(' ', game_system, parsed_json->>'game_system', raw_text)) like '%horus heresy%'
    then 'horus-heresy'
  else game_key
end
where game_key is null;

-- A few legacy schemas stored a canonical game/realm value directly. Dynamic
-- SQL is required because realm_key is not part of every installation.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'army_lists' and column_name = 'realm_key'
  ) then
    execute $sql$
      update public.army_lists
      set game_key = realm_key
      where game_key is null
        and realm_key in ('warhammer-40k', 'horus-heresy', 'age-of-sigmar', 'the-old-world')
    $sql$;
  end if;
end
$$;

alter table public.army_lists drop constraint if exists army_lists_game_key_check;
alter table public.army_lists add constraint army_lists_game_key_check check (
  game_key is null or game_key in (
    'warhammer-40k', 'kill-team', 'necromunda', 'battlefleet-gothic',
    'horus-heresy', 'legions-imperialis', 'adeptus-titanicus',
    'age-of-sigmar', 'warcry', 'the-old-world'
  )
);

create index if not exists army_lists_user_game_idx
  on public.army_lists (user_id, game_key, updated_at desc);

-- Supabase listens for this notification and refreshes PostgREST metadata.
notify pgrst, 'reload schema';
