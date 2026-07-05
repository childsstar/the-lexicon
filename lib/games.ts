import { type UniverseKey } from "./universes";
import { type RealmKey } from "./realms";

// Games — the actual tabletop rulesets beneath a realm. Warhammer 40,000
// the realm holds four games (Warhammer 40,000, Kill Team, Necromunda,
// Battlefleet Gothic), Horus Heresy holds three, and so on. Each game
// carries its realm and (redundantly, for convenient lookups) its universe.
// A future Faction registry would reference gameKey the same way games
// reference realmKey.

export const GAME_KEYS = [
  "warhammer-40k",
  "kill-team",
  "necromunda",
  "battlefleet-gothic",
  "horus-heresy",
  "legions-imperialis",
  "adeptus-titanicus",
  "age-of-sigmar",
  "warcry",
  "the-old-world",
] as const;

export type GameKey = (typeof GAME_KEYS)[number];

export type Game = {
  key: GameKey;
  universeKey: UniverseKey;
  realmKey: RealmKey;
  /** Display name, e.g. "Warhammer 40,000". */
  name: string;
};

export const GAMES: Record<GameKey, Game> = {
  "warhammer-40k": {
    key: "warhammer-40k",
    universeKey: "warhammer",
    realmKey: "warhammer-40k",
    name: "Warhammer 40,000",
  },
  "kill-team": {
    key: "kill-team",
    universeKey: "warhammer",
    realmKey: "warhammer-40k",
    name: "Kill Team",
  },
  necromunda: {
    key: "necromunda",
    universeKey: "warhammer",
    realmKey: "warhammer-40k",
    name: "Necromunda",
  },
  "battlefleet-gothic": {
    key: "battlefleet-gothic",
    universeKey: "warhammer",
    realmKey: "warhammer-40k",
    name: "Battlefleet Gothic",
  },
  "horus-heresy": {
    key: "horus-heresy",
    universeKey: "warhammer",
    realmKey: "horus-heresy",
    name: "The Horus Heresy",
  },
  "legions-imperialis": {
    key: "legions-imperialis",
    universeKey: "warhammer",
    realmKey: "horus-heresy",
    name: "Legions Imperialis",
  },
  "adeptus-titanicus": {
    key: "adeptus-titanicus",
    universeKey: "warhammer",
    realmKey: "horus-heresy",
    name: "Adeptus Titanicus",
  },
  "age-of-sigmar": {
    key: "age-of-sigmar",
    universeKey: "warhammer",
    realmKey: "age-of-sigmar",
    name: "Warhammer: Age of Sigmar",
  },
  warcry: {
    key: "warcry",
    universeKey: "warhammer",
    realmKey: "age-of-sigmar",
    name: "Warcry",
  },
  "the-old-world": {
    key: "the-old-world",
    universeKey: "warhammer",
    realmKey: "the-old-world",
    name: "Warhammer: The Old World",
  },
};

export const GAME_LIST: Game[] = GAME_KEYS.map((key) => GAMES[key]);

export function isGameKey(value: string): value is GameKey {
  return Object.prototype.hasOwnProperty.call(GAMES, value);
}

export function gamesForRealm(realmKey: RealmKey): Game[] {
  return GAME_LIST.filter((game) => game.realmKey === realmKey);
}

/** Matches the display names already used across game-systems.ts and
 * game-data.ts, so those can backfill hierarchy references without a
 * duplicated lookup table. */
export function findGameByName(name: string): Game | undefined {
  return GAME_LIST.find((game) => game.name === name);
}
