-- The Lexicon — post-deploy sanity check for the Muster/Armies schema.
--
-- Paste this into the Supabase SQL Editor after running:
--   1. supabase/migrations/20260704010000_create_army_lists.sql
--   2. supabase/migrations/20260706020000_army_identity_and_matchups.sql
--
-- Every row below should come back non-empty / true. If any query
-- returns no rows (or false), that migration step didn't take.

-- 1. Both tables exist in the schema PostgREST introspects.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('army_lists', 'army_matchups')
order by table_name;
-- expect: army_lists, army_matchups (2 rows)

-- 2. army_lists has every column the app writes/reads.
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'army_lists'
  and column_name in (
    'id', 'user_id', 'profile_id', 'name', 'game_system', 'game_key', 'faction',
    'subfaction', 'points_total', 'datasheet_count', 'model_count',
    'detachment_names', 'detachment_points', 'raw_text', 'parsed_json',
    'playstyle_tags', 'tactical_summary', 'parser_status', 'parser_error',
    'visibility', 'locked_at', 'visual_identity_json',
    'created_at', 'updated_at'
  )
order by column_name;
-- expect: all 23 column names listed above

-- 3. RLS is enabled on both tables.
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('army_lists', 'army_matchups');
-- expect: relrowsecurity = true for both rows

-- 4. Each table has its owner-scoped policies.
select tablename, policyname
from pg_policies
where schemaname = 'public' and tablename in ('army_lists', 'army_matchups')
order by tablename, policyname;
-- expect: 4 rows for army_lists, 4 rows for army_matchups

-- 5. PostgREST's schema cache actually knows about the new table. If
-- this errors with "relation does not exist" even though query #1
-- above found the table, the API layer's cache is stale — reload it
-- (see the notify below, or Dashboard → Settings → API → "Reload schema").
select count(*) as army_lists_row_count from public.army_lists;

-- If PostgREST still 404s/schema-cache-errors on /rest/v1/army_lists
-- after the migrations ran, ask it to reload its schema cache:
-- notify pgrst, 'reload schema';
