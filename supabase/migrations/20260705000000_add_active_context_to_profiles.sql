-- The Lexicon — Universe/Realm/Game active context on profiles
--
-- A snapshot of the profile owner's ActiveUniverseState
-- (components/active-universe-provider.tsx) at last save, so a future PR
-- can hydrate the active realm across devices instead of only from this
-- browser's localStorage. localStorage stays the source of truth for now —
-- these columns are written on profile save, not yet read back by the app.
--
-- No check constraint against a fixed list of keys: universe/realm/game
-- keys are meant to grow via lib/universes.ts, lib/realms.ts, lib/games.ts
-- registry entries (see docs/universe-realm-game-audit.md), and a SQL
-- enum would have to be edited in lockstep — exactly the hardcoded-list
-- pattern that architecture is meant to avoid.

alter table public.profiles
  add column if not exists preferred_universe_key text,
  add column if not exists preferred_realm_key text,
  add column if not exists preferred_game_key text;
