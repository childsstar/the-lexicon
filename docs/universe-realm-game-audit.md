# Universe → Realm → Game audit

Companion to the Universe/Realm/Game architecture (`lib/universes.ts`,
`lib/realms.ts`, `lib/games.ts`, `components/active-universe-provider.tsx`,
`components/realm-switcher.tsx`). This is a survey of every surface that
references a game/system concept, and a call on whether it's realm-aware yet
— not a todo list that has to be cleared before anything lands.

Legend: **Wired** = reads/updates `ActiveUniverseState` today. **Candidate**
= should become realm-aware, not done yet. **Skip** = out of scope for the
Warhammer-only MVP or not game-shaped.

## Wired (architecture PR)

- **`lib/game-systems.ts`** (`GameSystemKey`/`GAME_SYSTEMS`) — the registry
  behind Find Your World and Find Your Banner. Every key that also names a
  canonical `Game` (`warhammer-40k`, `age-of-sigmar`, `kill-team`, `warcry`,
  `the-old-world`, `horus-heresy`) is backfilled with `universeKey`/
  `realmKey` from `lib/games.ts`. Non-Warhammer systems (Infinity,
  BattleTech, Malifaux, …) are left without hierarchy — the hierarchy only
  models Warhammer for the MVP.
- **`lib/game-data.ts`** (`GameSystem`/`GAME_SYSTEMS`, profile faction
  picklists) — entries whose `name` matches a canonical Game are backfilled
  with `gameKey` via `findGameByName`.
- **`lib/chronicle/types.ts`** — `bannerHierarchy(banner)` resolves a
  `Banner`'s `universeKey`/`realmKey` when its `gameSystemKey` matches a
  canonical Game, as a lookup rather than a stored field.

## Wired (this PR)

- **`lib/active-context-matching.ts`** — new canonical matching layer:
  `matchesActiveUniverseContext` (generic core), `venueMatchesActiveContext`
  / `venueContextRelevance` / `venuePreferredRealmKey` (resolves free-text
  `supported_game_systems` tags via name/alias lookup — `"40k"`, `"aos"`,
  `"Warhammer Age of Sigmar"` without the colon, etc.), and
  `eventMatchesActiveContext` (same generic matcher, ready for whenever
  Events/Campaigns carries a `gameKey`). Philosophy throughout: the active
  context is a lens, not a gate — unmapped items are treated as unknown and
  included by default, never silently hidden.
- **`lib/active-universe-state.ts`** — the pure state transitions behind
  `ActiveUniverseContext` (`applyRealmSelection`, `applyGameSelection`,
  `parseActiveUniverseState`), split out of the provider so they're
  unit-testable without React/DOM (see `scripts/validate-active-context.mjs`).
  Selecting a game now also pins its realm (`applyGameSelection`); selecting
  a realm clears the specific game. Neither ever fires on its own — only in
  response to an explicit selection or quiz completion — so the active realm
  is never silently reset.
- **Hall of Banners** (`app/(marketing)/chronicles/banners/page.tsx` +
  `components/chronicle/hall-of-banners-filter.tsx`) — scoped to the active
  realm/game via `filterBannersForActiveContext`, with a contextual heading
  ("Hall of Banners — Age of Sigmar") and a graceful fallback note + full
  list when a realm has no banners mapped yet (true today for Horus Heresy
  and The Old World — all 40 existing banners are 40k/AoS only). The banner
  cards themselves stay server-rendered exactly as before; the client
  component only decides which of the already-rendered cards to keep (see
  the hydration note below).
- **Find Your Banner** (`components/chronicle/chronicle-experience.tsx`) —
  with no explicit `?systems=` hand-off from Find Your World, now defaults
  the banner pool to the active realm/game (same matcher, same graceful
  fallback + note). On reveal, the answering banner's game updates
  `ActiveUniverseContext` (via `setGame`) when it maps to a canonical game —
  exploring alternates afterward doesn't re-trigger this; only the initial
  reveal counts as "the verdict."
- **Find Your World** (`lib/world-quiz.ts` +
  `components/world/world-experience.tsx`) — the active realm is now a
  *soft* weighting signal (`recommendWorlds(answers, { preferredRealmKey })`
  adds a small flat bonus to in-realm systems) — a nudge, never a filter, so
  a strongly-scored cross-realm or non-Warhammer system still wins. On
  reveal, the recommendation updates `ActiveUniverseContext` only when the
  primary world maps to a canonical game; an unmapped recommendation (most
  of the hobby, by design) leaves the active context untouched.
- **Venues** (`app/(app)/venues/venues-client.tsx`) — venues are never
  hidden by realm. Instead, a stable sort (`venueContextRelevance`)
  *prefers* venues that explicitly support the active realm, and a note
  explains what's happening ("Prioritizing venues that support Age of
  Sigmar" / "No Age of Sigmar venues have been mapped yet — showing all
  Warhammer venues instead").
- **Discord** (`components/discord-cta.tsx`,
  `app/(app)/venues/[id]/venue-detail.tsx`) — the CTA copy personalizes to
  "Join this venue's Warhammer 40,000 community" when a realm can be
  determined unambiguously (the active realm if the venue supports it,
  else the venue's one mapped realm); falls back to generic "Join Discord"
  when ambiguous or unmapped. The venue schema only has one Discord link
  per venue today, so "prioritize the matching community among multiple"
  isn't applicable yet — see Remaining work.
- **Profile** (`components/profile-form.tsx`, `lib/types.ts`,
  `supabase/migrations/20260705000000_add_active_context_to_profiles.sql`)
  — profile save now snapshots the active `universeKey`/`realmKey`/
  `gameKey` onto three new nullable `profiles` columns
  (`preferred_universe_key`/`preferred_realm_key`/`preferred_game_key`).
  localStorage stays the live source of truth (the columns aren't read back
  by the app yet) — this only prepares cross-device sync as a later,
  separate change. No check constraint against a fixed key list, since keys
  are meant to grow via registry entries, not schema edits.

### A hydration gotcha worth remembering

Wrapping the Hall of Banners grid in a naive `"use client"` component (to
read `ActiveUniverseState`) initially caused a real hydration mismatch: the
banner art (`components/chronicle/plates.tsx`) computes star-field
coordinates from `Math.sin`, which is deterministic *per engine* but not
bit-identical across Node's and Chromium's V8 builds — invisible before
because that markup was plain server output never diffed against a client
render, but exposed the moment it sat inside a client component's own
render output. The fix: `HallOfBannersFilter` receives the server-rendered
cards as opaque `children` and only decides which to keep — per Next.js's
"Server Components as children of Client Components" pattern, that content
is never re-rendered/hydrated client-side. Any future work that puts
`BannerArt` inside a new client boundary should follow the same pattern
(pass pre-rendered cards through, don't regenerate them in the client
component) rather than rounding every trig call in `plates.tsx`.

## Remaining work

- **Events** — still no dedicated feature (`app/(app)/battles/*` and
  `app/(app)/campaigns/*` are routes only). `eventMatchesActiveContext`
  exists and is ready; wiring it in is just giving battles/campaigns a
  `gameKey` field.
- **Campaigns** — same as Events.
- **Future Army imports** — `gameSystem` stays free text
  (`lib/army-lists/*`, the muster/import clients); resolving pasted text to
  a `GameKey` is best-effort at best since rosters cover the whole hobby,
  not just Warhammer. Defaulting the picker/hint from `ActiveUniverseState`
  is a small, isolated follow-up.
- **Community / nearby** (`app/(app)/community/*`) — no game/system
  coupling today; realm-awareness only makes sense once player-to-player
  matching considers what people play.
- **Discord — multiple communities per venue** — the schema
  (`discord_server_id`/`discord_invite_url`) is single-valued per venue.
  Supporting "this venue runs both a 40k and an AoS Discord" needs a real
  schema change (e.g. a `venue_discord_links` table keyed by `game_key`) —
  proposed but not built, since today's data never has more than one.
- **Venues — `supported_game_systems` typing** — still free text, resolved
  at display/matching time via `lib/active-context-matching.ts`'s
  name/alias lookup rather than stored as `GameKey[]`. Works well because
  the alias list is small and the fallback is graceful, but a future venue
  import/edit flow could write canonical `GameKey`s directly and skip the
  lookup for anything entered through the app (imported/legacy data would
  still need the free-text path).
- **Profile — cross-device hydration** — `preferred_realm_key` etc. are
  written but not read; a follow-up would have `ActiveUniverseProvider`
  seed its initial state from the signed-in profile when localStorage is
  empty, and decide what happens on conflict (last-write-wins? most-recent
  device?) before making it live.
- **Navigation terminology** (ticket item 7) — reviewed; no changes made.
  The existing "Game system" labels (`import-army-list-client.tsx`,
  `muster-army-client.tsx`, `profile-form.tsx`'s system chips) correctly
  refer to specific rulesets across every publisher, not Warhammer realms —
  renaming them to "Realm" would be wrong, since e.g. Infinity or BattleTech
  have no realm at all. The Realm Switcher and Hall of Banners heading are
  the only realm-labeled UI, and both already say "Realm"/name the realm
  directly.
- **Future tabletop universes** (D&D, Magic, Star Wars, BattleTech,
  Warmachine, …) — adding one is a registry change
  (`lib/universes.ts`/`lib/realms.ts`/`lib/games.ts`) plus backfilling
  `lib/game-systems.ts`/`lib/game-data.ts` the same way Warhammer's six
  systems were, per the architecture PR. No application logic should need
  to change; `lib/active-context-matching.ts`'s alias table would likely
  grow (e.g. shorthand for the new universe's systems).

## Recommended sequencing

1. **Profile cross-device hydration** — small, high-leverage: makes the
   realm follow a signed-in user across devices, which is the one piece of
   "changing inboxes" the MVP doesn't yet deliver.
2. **Events/Campaigns gain a `gameKey`** once either feature exists —
   trivial once built, since the matcher already exists.
3. **Venue `supported_game_systems` → canonical `GameKey[]`** at write time
   (new/edited venues only) — improves match quality without a backfill.
4. **Discord multi-community schema** — only worth it once a venue actually
   needs two Discords; low urgency today.
5. **Army import realm defaults** — nice-to-have UX polish, not blocking
   anything else.
6. **Second universe** (likely Dungeons & Dragons) — the real test of
   whether "adding a universe is a registry change" holds up; do this after
   the above so the pattern is proven on real cross-feature wiring first.
