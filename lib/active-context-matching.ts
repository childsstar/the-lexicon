import { GAMES, GAME_LIST, isGameKey, type GameKey } from "./games";
import { REALM_LIST, type RealmKey } from "./realms";

// The canonical "does this item belong to the active realm/game" layer.
// Venues, the Hall of Banners, and future Events/Campaigns should all
// route through this instead of comparing keys ad hoc, so realm-aware
// filtering stays consistent (and centralized) as new surfaces adopt it.
//
// Shared philosophy: the active context is a lens, not a hard gate.
// - "All Warhammer" (no realm/game selected) always matches everything.
// - An item with no hierarchy metadata at all is UNKNOWN, not excluded —
//   callers decide how to treat unknowns (see `onUnknown`), but the
//   default is to include them so incomplete data never produces a dead
//   end (see docs/universe-realm-game-audit.md).

/** The slice of ActiveUniverseState that matching needs. Duplicated as a
 * structural type (rather than imported from the client provider) so this
 * module has no dependency on React/components. */
export type ActiveContext = {
  realmKey: RealmKey | null;
  gameKey: GameKey | null;
};

export type HierarchyRef = {
  realmKey?: RealmKey | null;
  gameKey?: GameKey | null;
};

/** Resolves an item's realm, preferring an explicit realmKey but falling
 * back to the realm implied by its gameKey. */
export function realmKeyOf(ref: HierarchyRef): RealmKey | null {
  if (ref.realmKey) return ref.realmKey;
  if (ref.gameKey) return GAMES[ref.gameKey].realmKey;
  return null;
}

/** The generic core matcher every realm-aware feature builds on. */
export function matchesActiveUniverseContext(
  ref: HierarchyRef,
  active: ActiveContext,
  options: { onUnknown?: boolean } = {}
): boolean {
  const includeUnknown = options.onUnknown ?? true;

  if (active.gameKey) {
    if (!ref.gameKey) return includeUnknown;
    return ref.gameKey === active.gameKey;
  }
  if (!active.realmKey) return true; // "All Warhammer" — no filter
  const itemRealm = realmKeyOf(ref);
  if (!itemRealm) return includeUnknown;
  return itemRealm === active.realmKey;
}

// ---------------------------------------------------------------------------
// Venues — supported_game_systems is a free-text string[] (see lib/venues.ts),
// not a GameKey/RealmKey enum, so it needs resolving before it can be matched.
// ---------------------------------------------------------------------------

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const REALM_LABEL_LOOKUP = new Map<string, RealmKey>();
for (const game of GAME_LIST) {
  REALM_LABEL_LOOKUP.set(normalizeLabel(game.name), game.realmKey);
}
for (const realm of REALM_LIST) {
  REALM_LABEL_LOOKUP.set(normalizeLabel(realm.name), realm.key);
}
// Common shorthand seen in venue listings/imports that don't already match
// a canonical Game/Realm display name above.
const REALM_LABEL_ALIASES: Record<string, RealmKey> = {
  "40k": "warhammer-40k",
  wh40k: "warhammer-40k",
  aos: "age-of-sigmar",
  "old world": "the-old-world",
  twow: "the-old-world",
  heresy: "horus-heresy",
  hh: "horus-heresy",
};
for (const [alias, realmKey] of Object.entries(REALM_LABEL_ALIASES)) {
  REALM_LABEL_LOOKUP.set(alias, realmKey);
}

/** Best-effort resolution of a free-text tag (e.g. a venue's
 * supported_game_systems entry) to a canonical realm. Returns undefined for
 * anything unrecognized (board games, other publishers' systems, typos) —
 * callers should treat that as "unknown," never as "doesn't match." */
export function resolveRealmKeyFromLabel(label: string): RealmKey | undefined {
  return REALM_LABEL_LOOKUP.get(normalizeLabel(label));
}

/** Every realm a venue's free-text tags resolve to (deduplicated, order
 * matches lib/realms.ts's REALM_LIST). Empty when nothing resolves. */
export function venueRealmKeys(venue: {
  supported_game_systems?: string[] | null;
}): RealmKey[] {
  const found = new Set<RealmKey>();
  for (const label of venue.supported_game_systems ?? []) {
    const realmKey = resolveRealmKeyFromLabel(label);
    if (realmKey) found.add(realmKey);
  }
  return REALM_LIST.map((realm) => realm.key).filter((key) => found.has(key));
}

/** Whether a venue belongs in the active context. Venues with no resolvable
 * Warhammer tags (board game cafés, unmapped imports, …) always match —
 * hiding them outright would be an aggressive, data-quality-dependent gate
 * the audit explicitly warns against. */
export function venueMatchesActiveContext(
  venue: { supported_game_systems?: string[] | null },
  active: ActiveContext
): boolean {
  if (!active.realmKey && !active.gameKey) return true;
  const realms = venueRealmKeys(venue);
  if (realms.length === 0) return true; // unmapped — graceful fallback
  const wantedRealm = active.gameKey
    ? GAMES[active.gameKey].realmKey
    : active.realmKey;
  return wantedRealm ? realms.includes(wantedRealm) : true;
}

/** Relevance tier for sorting (not hiding) venues by the active context:
 * 2 = explicitly matches, 1 = unmapped/unknown, 0 = explicitly a different
 * realm. "Prefer" venues relevant to the active realm without excluding
 * anything — see the venues audit entry. */
export function venueContextRelevance(
  venue: { supported_game_systems?: string[] | null },
  active: ActiveContext
): 0 | 1 | 2 {
  if (!active.realmKey && !active.gameKey) return 1;
  const realms = venueRealmKeys(venue);
  if (realms.length === 0) return 1;
  const wantedRealm = active.gameKey
    ? GAMES[active.gameKey].realmKey
    : active.realmKey;
  if (!wantedRealm) return 1;
  return realms.includes(wantedRealm) ? 2 : 0;
}

/** A single realm name to personalize copy with (e.g. a Discord CTA),
 * preferring the active realm when the venue actually supports it, then
 * falling back to the venue's one unambiguous realm. Returns undefined
 * when there's nothing safe to commit to (unmapped, or multiple realms
 * with none matching the active one) — callers should fall back to
 * generic copy in that case. */
export function venuePreferredRealmKey(
  venue: { supported_game_systems?: string[] | null },
  active: ActiveContext
): RealmKey | undefined {
  const realms = venueRealmKeys(venue);
  if (realms.length === 0) return undefined;
  if (active.realmKey && realms.includes(active.realmKey)) {
    return active.realmKey;
  }
  return realms.length === 1 ? realms[0] : undefined;
}

// ---------------------------------------------------------------------------
// Events/Campaigns — no dedicated feature exists yet (see the audit doc),
// but battles/campaigns should carry a gameKey once built. This is the
// forward-compatible matcher for that shape so it's a drop-in, not a
// rewrite, when that lands.
// ---------------------------------------------------------------------------

export function eventMatchesActiveContext(
  event: HierarchyRef,
  active: ActiveContext,
  options?: { onUnknown?: boolean }
): boolean {
  return matchesActiveUniverseContext(event, active, options);
}

/** Re-exported for convenience — bannerHierarchy/Banner already live in
 * lib/chronicle/types.ts; isGameKey/GameKey are the pieces most callers
 * pull in alongside these helpers. */
export { isGameKey };
export type { GameKey, RealmKey };
