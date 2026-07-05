# Universe → Realm → Game audit

Companion to the Universe/Realm/Game architecture introduced alongside this
doc (`lib/universes.ts`, `lib/realms.ts`, `lib/games.ts`,
`components/active-universe-provider.tsx`, `components/realm-switcher.tsx`).
This is a survey of every existing surface that references a game/system
concept today, and a call on whether it should become realm-aware — not a
todo list that has to be cleared before this lands.

Legend: **Wired** = already backfilled with `universeKey`/`realmKey`/`gameKey`
in this PR. **Candidate** = should become realm-aware, not done here.
**Skip** = out of scope for the Warhammer-only MVP or not game-shaped.

## Wired in this PR

- **`lib/game-systems.ts`** (`GameSystemKey`/`GAME_SYSTEMS`) — the registry
  behind Find Your World and Find Your Banner. Every key that also names a
  canonical `Game` (`warhammer-40k`, `age-of-sigmar`, `kill-team`, `warcry`,
  `the-old-world`, `horus-heresy`) is backfilled with `universeKey`/
  `realmKey` from `lib/games.ts`. Non-Warhammer systems (Infinity,
  BattleTech, Malifaux, …) are left without hierarchy — the hierarchy only
  models Warhammer for the MVP.
- **`lib/game-data.ts`** (`GameSystem`/`GAME_SYSTEMS`, profile faction
  picklists) — entries whose `name` matches a canonical Game (by exact
  string, via `findGameByName`) are backfilled with `gameKey`. Covers
  Warhammer 40,000, Age of Sigmar, The Old World, Horus Heresy, Kill Team,
  Warcry, Necromunda, Battlefleet Gothic.
- **`lib/chronicle/types.ts`** — added `bannerHierarchy(banner)`, a lookup
  (not a stored field) that resolves a `Banner`'s `universeKey`/`realmKey`
  when its `gameSystemKey` matches a canonical Game. Lets Find Your Banner
  filter/prioritize by the active realm without touching the ~40 banner
  literals in `lib/chronicle/banners.ts`.

## Candidates for future realm-aware work

- **Hall of Banners** (`app/(marketing)/chronicles/banners/page.tsx`,
  `components/chronicle/chronicle-experience.tsx`, `lib/chronicle/*`) — Find
  Your Banner already filters by a `systems=` query param
  (`lib/game-systems.ts#filterByGameSystems`). Natural next step: default
  that filter from `ActiveUniverseState.realmKey` (via `bannerHierarchy`)
  instead of requiring an explicit query param, while still allowing an
  unfiltered "take it as-is" path like Find Your World already offers.
- **Find Your World** (`lib/world-quiz.ts`,
  `components/world/world-experience.tsx`) — recommends across the entire
  hobby, not just Warhammer, by design (it's the "which game should I even
  play" quiz). Leave as-is; it's explicitly cross-universe. Once other
  universes are enabled, its `WorldOption.systems` weighting would need
  entries for their games too.
- **Venues** (`lib/venues.ts`, `app/(app)/venues/*`) — `Venue.
  supported_game_systems: string[]` is a free-text array (backed by a
  Supabase column, not the `GameSystemKey` enum). Realm-aware filtering
  ("show me stores that run Age of Sigmar") would need either a migration
  to store `GameKey`s or a display-time mapping via `findGameByName`-style
  matching. Not attempted here — touches the DB schema and venue
  import/geocoding pipeline (`lib/venues/import.ts`).
- **Discord** (`components/discord-auth-button.tsx`,
  `components/discord-cta.tsx`, venue Discord linking in `lib/venues.ts`) —
  no game/system coupling today; Discord is an identity/community feature.
  Becomes realm-aware only if/when per-realm Discord servers or channels are
  introduced (e.g. a "Horus Heresy" community server distinct from
  "Warhammer 40,000").
- **Events** — no dedicated Events feature exists yet (closest today are
  `app/(app)/battles/*` and `app/(app)/campaigns/*`, both currently
  unimplemented beyond routing). When built, battles/campaigns should carry
  a `gameKey` (and derive `realmKey`/`universeKey` from it) so history and
  campaigns can be scoped to a realm.
- **Chronicles** — see Hall of Banners above; Find Your World and Find Your
  Banner are the two chronicles that exist today.
- **Future Army imports** (`app/api/army-lists/route.ts`,
  `lib/army-lists/{types,parser,fallback-parser}.ts`,
  `app/(app)/profile/army-lists/import/import-army-list-client.tsx`,
  `app/(app)/armies/muster/muster-army-client.tsx`) — `gameSystem` is a
  free-text string supplied by the user or inferred from pasted roster text
  (`inferGameSystem` in `fallback-parser.ts`). Realm-aware storage would
  mean resolving that free text to a `GameKey` (best-effort, since rosters
  mention many non-Warhammer systems too) and defaulting the picker/hint
  from `ActiveUniverseState`. Left as free text here since the parser needs
  to keep accepting anything a user pastes.
- **Future Campaigns** — not yet built; see Events above.
- **Profile setup** (`components/profile-form.tsx`) — the "preferred game
  systems" picker reads `lib/game-data.ts#GAME_SYSTEMS`, now carrying
  `gameKey` where applicable. A realm-aware profile could default this
  picker's visible options to games in the active realm, with an "all
  systems" escape hatch — not done here.
- **Community / nearby** (`app/(app)/community/*`) — no game/system
  coupling today.

## Not modeled by the hierarchy (by design, for the MVP)

Everything in `lib/game-systems.ts` and `lib/game-data.ts` outside the
Warhammer family (Infinity, BattleTech, Malifaux, Star Wars: Legion, Bolt
Action, Kings of War, Conquest, Frostgrave, Trench Crusade, Middle-earth
SBG, Marvel: Crisis Protocol, Blood Bowl, A Song of Ice and Fire, Warmachine,
One Page Rules, Star Wars: Shatterpoint) has no `universeKey`/`realmKey`/
`gameKey` — the ticket scopes the MVP hierarchy to Warhammer only. Adding a
future universe means adding entries to `lib/universes.ts`, `lib/realms.ts`,
and `lib/games.ts`; the existing hobby-wide registries can be backfilled the
same way `warhammer-40k`/`age-of-sigmar`/etc. were here.
