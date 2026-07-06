-- The Lexicon — passport onboarding fields on profiles
--
-- Supports the redesigned onboarding sequence (Choose Your Banner, Complete
-- Your Passport): a durable record of which chronicle banner a traveler
-- chose, and how far they're willing to travel for a game. Both are
-- optional — onboarding never blocks on missing data.

alter table public.profiles
  add column if not exists banner_id text,
  add column if not exists travel_radius_miles integer
    check (travel_radius_miles is null or (travel_radius_miles > 0 and travel_radius_miles <= 500));
