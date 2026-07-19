-- Repair deployments where application code reached production before the
-- Old World game-key migration. This is additive, repeatable, and preserves rows.
alter table public.army_lists add column if not exists game_key text;

update public.army_lists
set game_key = case
  when lower(coalesce(game_system, parsed_json->>'game_system', '')) like '%old world%' then 'the-old-world'
  when lower(coalesce(game_system, parsed_json->>'game_system', '')) ~ '40,?000|40k' then 'warhammer-40k'
  when lower(coalesce(game_system, parsed_json->>'game_system', '')) like '%age of sigmar%' then 'age-of-sigmar'
  when lower(coalesce(game_system, parsed_json->>'game_system', '')) like '%kill team%' then 'kill-team'
  when lower(coalesce(game_system, parsed_json->>'game_system', '')) like '%horus heresy%' then 'horus-heresy'
  else game_key
end
where game_key is null;

-- Some legacy installations carried realm_key directly on army_lists.
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='army_lists' and column_name='realm_key') then
    execute $sql$update public.army_lists set game_key = case realm_key
      when 'the-old-world' then 'the-old-world' when 'warhammer-40k' then 'warhammer-40k'
      when 'age-of-sigmar' then 'age-of-sigmar' when 'horus-heresy' then 'horus-heresy'
      else game_key end where game_key is null$sql$;
  end if;
end $$;

alter table public.army_lists drop constraint if exists army_lists_game_key_check;
alter table public.army_lists add constraint army_lists_game_key_check check (game_key is null or game_key in (
  'warhammer-40k','kill-team','necromunda','battlefleet-gothic','horus-heresy',
  'legions-imperialis','adeptus-titanicus','age-of-sigmar','warcry','the-old-world'
));
create index if not exists army_lists_user_game_idx on public.army_lists(user_id, game_key, updated_at desc);
notify pgrst, 'reload schema';
