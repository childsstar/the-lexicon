import { type UniverseKey } from "./universes";

// Realms — the setting-eras/sub-brands beneath a universe. Warhammer's four
// realms today are Warhammer 40,000, Horus Heresy, Age of Sigmar, and The
// Old World; a future universe (Star Wars, say) would define its own realm
// keys here. Every realm belongs to exactly one universe and groups one or
// more games (see games.ts).

export const REALM_KEYS = [
  "warhammer-40k",
  "horus-heresy",
  "age-of-sigmar",
  "the-old-world",
] as const;

export type RealmKey = (typeof REALM_KEYS)[number];

export type Realm = {
  key: RealmKey;
  universeKey: UniverseKey;
  /** Display name, e.g. "Horus Heresy". */
  name: string;
  /** Used by the realm switcher and other compact UI. */
  emoji: string;
  /** One-line pitch, travel-guide voice. */
  tagline: string;
};

export const REALMS: Record<RealmKey, Realm> = {
  "warhammer-40k": {
    key: "warhammer-40k",
    universeKey: "warhammer",
    name: "Warhammer 40,000",
    emoji: "⚔️",
    tagline: "The grim darkness of the far future.",
  },
  "horus-heresy": {
    key: "horus-heresy",
    universeKey: "warhammer",
    name: "Horus Heresy",
    emoji: "🦅",
    tagline: "The war that broke the Imperium, ten thousand years ago.",
  },
  "age-of-sigmar": {
    key: "age-of-sigmar",
    universeKey: "warhammer",
    name: "Age of Sigmar",
    emoji: "🛡",
    tagline: "Myth-sized fantasy across the Mortal Realms.",
  },
  "the-old-world": {
    key: "the-old-world",
    universeKey: "warhammer",
    name: "The Old World",
    emoji: "🏰",
    tagline: "Rank-and-file battles in the classic world of Warhammer.",
  },
};

export const REALM_LIST: Realm[] = REALM_KEYS.map((key) => REALMS[key]);

export function isRealmKey(value: string): value is RealmKey {
  return Object.prototype.hasOwnProperty.call(REALMS, value);
}

export function realmsForUniverse(universeKey: UniverseKey): Realm[] {
  return REALM_LIST.filter((realm) => realm.universeKey === universeKey);
}
