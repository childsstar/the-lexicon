-- Backfill venue_categories / supported_game_systems on the seeded NYC
-- venues so they carry the tags the simplified Atlas filter mapping
-- (lib/venues.ts: venueMatchesPrimaryFilter) checks for. Every update below
-- merges new values into the existing arrays via array(select distinct
-- unnest(...)) — nothing already present is overwritten or removed, and
-- rerunning this migration is a no-op after the first run.

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['warhammer_store', 'game_shop', 'retail'])
    ),
    supported_game_systems = array(
      select distinct unnest(
        supported_game_systems || array['warhammer', 'warhammer_40000', 'age_of_sigmar', 'horus_heresy', 'the_old_world']
      )
    )
where name = 'Warhammer - 8th Street';

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['game_shop', 'hobby_shop', 'retail'])
    )
where name in (
  'The Brooklyn Strategist',
  'Twenty Sided Store',
  'Last Place on Earth',
  'Brooklyn Game Knight',
  'Gamestoria',
  'The Compleat Strategist'
);

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['board_game_cafe', 'cafe'])
    )
where name in (
  'Sip & Play',
  'Hex & Co. West Side',
  'Hex & Co. Upper East Side',
  'Hex & Co. Union Square',
  'The Uncommons',
  'Squarrel Cafe'
);

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['library', 'community_space'])
    )
where venue_type = 'library';

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['community_space', 'casual_play_space'])
    )
where name = 'Whole Foods Market Tribeca Community Seating';

update public.venues
set venue_categories = array(
      select distinct unnest(venue_categories || array['club', 'private_table'])
    )
where name = 'Carcosa Club';
