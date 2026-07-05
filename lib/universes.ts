// Universes — the top of The Lexicon's product hierarchy.
//
// A universe is an entire tabletop setting/publisher line (Warhammer today;
// Dungeons & Dragons, Magic: The Gathering, Star Wars, Battletech, … in the
// future). Realms, games, and factions all nest underneath a universe.
// Adding a universe should be a registry change here (plus artwork and
// content) — no application logic should need to change.

export const UNIVERSE_KEYS = [
  "warhammer",
  // Anticipated future universes — intentionally not enabled for the MVP.
  // Uncomment and add a registry entry below when each is ready to ship:
  // "dungeons-and-dragons",
  // "magic",
  // "star-wars",
  // "battletech",
  // "warmachine",
] as const;

export type UniverseKey = (typeof UNIVERSE_KEYS)[number];

export type Universe = {
  key: UniverseKey;
  /** Display name, e.g. "Warhammer". */
  name: string;
  /** Used by the realm switcher and other compact UI. */
  emoji: string;
  /** One-line pitch, travel-guide voice. */
  tagline: string;
};

export const UNIVERSES: Record<UniverseKey, Universe> = {
  warhammer: {
    key: "warhammer",
    name: "Warhammer",
    emoji: "🌌",
    tagline: "Your guide to the worlds of Warhammer.",
  },
};

export const UNIVERSE_LIST: Universe[] = UNIVERSE_KEYS.map(
  (key) => UNIVERSES[key]
);

export function isUniverseKey(value: string): value is UniverseKey {
  return Object.prototype.hasOwnProperty.call(UNIVERSES, value);
}

/** The MVP ships a single universe, but the app should behave as though
 * more exist — the next one should be a registry entry, not a rewrite. */
export const DEFAULT_UNIVERSE_KEY: UniverseKey = "warhammer";
