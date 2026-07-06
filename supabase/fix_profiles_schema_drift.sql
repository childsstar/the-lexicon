-- The Lexicon — fix profiles schema drift
--
-- Symptom: profile saves fail with "The profiles table is out of date with
-- the app" (Postgres/PostgREST error PGRST204, "column missing from schema
-- cache"). That message's advice — drop the table and re-run
-- schema_v0_1_profiles.sql — throws away every existing profile row, which
-- is more than this actually needs.
--
-- The real cause: your profiles table was created before the Universe/
-- Realm/Game context (preferred_universe_key/realm_key/game_key) and the
-- passport onboarding fields (banner_id, travel_radius_miles) shipped, so
-- those columns were never added. This paste-and-run script adds exactly
-- those columns — no drop, no data loss. It's the same statements as
-- supabase/migrations/20260705000000_add_active_context_to_profiles.sql and
-- supabase/migrations/20260706000000_add_passport_fields_to_profiles.sql,
-- collected here so you don't have to hunt down both files.
--
-- Safe to re-run: every column add is guarded with "if not exists".

alter table public.profiles
  add column if not exists preferred_universe_key text,
  add column if not exists preferred_realm_key text,
  add column if not exists preferred_game_key text,
  add column if not exists banner_id text,
  add column if not exists travel_radius_miles integer
    check (travel_radius_miles is null or (travel_radius_miles > 0 and travel_radius_miles <= 500));
