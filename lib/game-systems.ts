// Game systems — the worlds of the tabletop hobby.
//
// This is the single source of truth for every game system The Lexicon
// knows about. It exists independently of any one feature: Find Your World
// recommends from it, Find Your Banner filters by it, and future features
// (recommended factions, starter boxes, local clubs, painting guides…) can
// hang recommendations off the same keys. Adding a system is purely a
// configuration change: add its key below and an entry to GAME_SYSTEMS.
//
// Universe/Realm/Game hierarchy: this registry predates and covers more
// ground than lib/games.ts (every hobby system, not just Warhammer), so it
// stays the source of truth for Find Your World/Find Your Banner. Where a
// key also names a canonical Game, GAME_SYSTEMS is backfilled with its
// universeKey/realmKey below rather than duplicating that data.

import { type UniverseKey } from "./universes";
import { type RealmKey } from "./realms";
import { GAMES, isGameKey } from "./games";

export const GAME_SYSTEM_KEYS = [
  // Warhammer
  "warhammer-40k",
  "age-of-sigmar",
  "kill-team",
  "warcry",
  "the-old-world",
  "horus-heresy",
  // Other games
  "middle-earth-sbg",
  "star-wars-legion",
  "marvel-crisis-protocol",
  "infinity",
  "battletech",
  "bolt-action",
  "malifaux",
  "conquest",
  "kings-of-war",
  "frostgrave",
  "trench-crusade",
] as const;

export type GameSystemKey = (typeof GAME_SYSTEM_KEYS)[number];

export type GameSystem = {
  key: GameSystemKey;
  /** Display name, e.g. "Warhammer 40,000". */
  name: string;
  publisher: string;
  /** Grouping for browse/marketing surfaces. */
  family: "warhammer" | "other";
  /** One-line pitch, travel-guide voice. */
  tagline: string;
  /** Short blurb for the recommendation screen. */
  blurb: string;
  /** Set when this key also names a canonical Game (see lib/games.ts) —
   * undefined for hobby systems the Universe/Realm/Game hierarchy doesn't
   * model yet. */
  universeKey?: UniverseKey;
  realmKey?: RealmKey;
};

const RAW_GAME_SYSTEMS: Record<GameSystemKey, GameSystem> = {
  "warhammer-40k": {
    key: "warhammer-40k",
    name: "Warhammer 40,000",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "Grim darkness, gothic empires, and armies beyond counting.",
    blurb:
      "The far future at its most operatic: vast armies, doomed heroism, and a galaxy where everything costs everything. The deepest lore and the busiest tables in the hobby.",
  },
  "age-of-sigmar": {
    key: "age-of-sigmar",
    name: "Warhammer: Age of Sigmar",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "Myth-sized fantasy where magic is weather and gods keep score.",
    blurb:
      "High fantasy turned up to myth: storm-forged knights, haunted realms, and armies painted in every color of legend. Sweeping in scope and welcoming to newcomers.",
  },
  "kill-team": {
    key: "kill-team",
    name: "Kill Team",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "A dozen fighters, tight missions, and every model matters.",
    blurb:
      "Warhammer 40,000 at skirmish scale — small elite teams, fast tactical missions, and a low cost of entry into the far future.",
  },
  warcry: {
    key: "warcry",
    name: "Warcry",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "Fast, ferocious skirmish in the Mortal Realms.",
    blurb:
      "Age of Sigmar's skirmish cousin: small warbands, quick brutal rounds, and just enough chaos to keep every fight surprising.",
  },
  "the-old-world": {
    key: "the-old-world",
    name: "Warhammer: The Old World",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "Rank-and-file regiments in the classic world of fantasy battles.",
    blurb:
      "The return of Warhammer's original setting: massed regiments, ancient kingdoms, and battles that feel like moving history across the table.",
  },
  "horus-heresy": {
    key: "horus-heresy",
    name: "The Horus Heresy",
    publisher: "Games Workshop",
    family: "warhammer",
    tagline: "The civil war that broke the far future, fought at epic scale.",
    blurb:
      "A narrative-first game of massed legions and doomed brotherhood, set ten thousand years before Warhammer 40,000. For players who want their battles to feel like history.",
  },
  "middle-earth-sbg": {
    key: "middle-earth-sbg",
    name: "Middle-earth Strategy Battle Game",
    publisher: "Games Workshop",
    family: "other",
    tagline: "Heroes, fellowships, and the battles of Tolkien's legendarium.",
    blurb:
      "Narrative, cinematic, and heart-forward — modest forces led by named heroes through the most beloved fantasy world ever written.",
  },
  "star-wars-legion": {
    key: "star-wars-legion",
    name: "Star Wars: Legion",
    publisher: "Atomic Mass Games",
    family: "other",
    tagline: "Troopers, heroes, and armor across a galaxy far, far away.",
    blurb:
      "Squad-scale battles with iconic characters — approachable rules, cinematic missions, and a hopeful register rare in wargaming.",
  },
  "marvel-crisis-protocol": {
    key: "marvel-crisis-protocol",
    name: "Marvel: Crisis Protocol",
    publisher: "Atomic Mass Games",
    family: "other",
    tagline: "Super-powered skirmish where every model is a headliner.",
    blurb:
      "Small rosters, big personalities, and dynamic objective play — fast to learn, fiercely competitive at the top tables.",
  },
  infinity: {
    key: "infinity",
    name: "Infinity",
    publisher: "Corvus Belli",
    family: "other",
    tagline: "Sleek sci-fi skirmish where reactions matter as much as actions.",
    blurb:
      "A high-tech tactical puzzle that rewards angles, timing, and nerve — deep skirmish play with anime-inflected style.",
  },
  battletech: {
    key: "battletech",
    name: "BattleTech",
    publisher: "Catalyst Game Labs",
    family: "other",
    tagline: "Giant walking war machines and centuries of interstellar grudges.",
    blurb:
      "A classic of the genre: lances of customizable BattleMechs, deep campaign play, and a universe with decades of lore behind every shot.",
  },
  "bolt-action": {
    key: "bolt-action",
    name: "Bolt Action",
    publisher: "Warlord Games",
    family: "other",
    tagline: "World War II platoons with real history behind every order.",
    blurb:
      "Grounded, cinematic WWII gaming — order dice keep both players in every turn, and history supplies endless scenarios.",
  },
  malifaux: {
    key: "malifaux",
    name: "Malifaux",
    publisher: "Wyrd Miniatures",
    family: "other",
    tagline: "Gothic horror skirmish played with cards instead of dice.",
    blurb:
      "Weird, wicked, and wonderfully competitive — small crews, scheme-driven scoring, and a fate deck that puts luck in your own hands.",
  },
  conquest: {
    key: "conquest",
    name: "Conquest: The Last Argument of Kings",
    publisher: "Para Bellum Wargames",
    family: "other",
    tagline: "Mass fantasy battles where reinforcements march on mid-fight.",
    blurb:
      "Escalating ranked warfare in a grim sword-and-sorcery world of fallen empires — armies arrive in waves, and the battle builds like a storm.",
  },
  "kings-of-war": {
    key: "kings-of-war",
    name: "Kings of War",
    publisher: "Mantic Games",
    family: "other",
    tagline: "Grand fantasy armies with fast, elegant, tournament-proven rules.",
    blurb:
      "Huge armies that play quickly, clean rules beloved by competitive players, and a welcome mat for whatever miniatures you already own.",
  },
  frostgrave: {
    key: "frostgrave",
    name: "Frostgrave",
    publisher: "Osprey Games",
    family: "other",
    tagline: "Wizards and hired blades looting a frozen, ruined city.",
    blurb:
      "A warband, a spellbook, and a city full of treasure — narrative campaign skirmish where your wizard grows with every game.",
  },
  "trench-crusade": {
    key: "trench-crusade",
    name: "Trench Crusade",
    publisher: "Trench Crusade",
    family: "other",
    tagline: "An alternate history where the war for heaven is fought in the mud.",
    blurb:
      "Grim beyond grim: warband-scale skirmish in a world where the Crusades tore a hole into hell. Atmospheric, narrative, unforgettable.",
  },
};

export const GAME_SYSTEMS: Record<GameSystemKey, GameSystem> =
  Object.fromEntries(
    Object.entries(RAW_GAME_SYSTEMS).map(([key, system]) => [
      key,
      isGameKey(key)
        ? {
            ...system,
            universeKey: GAMES[key].universeKey,
            realmKey: GAMES[key].realmKey,
          }
        : system,
    ])
  ) as Record<GameSystemKey, GameSystem>;

export const GAME_SYSTEM_LIST: GameSystem[] = GAME_SYSTEM_KEYS.map(
  (key) => GAME_SYSTEMS[key]
);

export function isGameSystemKey(value: string): value is GameSystemKey {
  return Object.prototype.hasOwnProperty.call(GAME_SYSTEMS, value);
}

/** URL search param carrying preferred game systems between experiences
 * (e.g. /chronicles/find-your-banner?systems=age-of-sigmar,warcry). */
export const GAME_SYSTEMS_PARAM = "systems";

export function encodeGameSystemKeys(keys: GameSystemKey[]): string {
  return keys.join(",");
}

/** Parse a comma-separated key list, silently dropping anything unknown so
 * a stale or hand-edited URL can never break an experience. */
export function parseGameSystemKeys(
  raw: string | null | undefined
): GameSystemKey[] {
  if (!raw) return [];
  return [...new Set(raw.split(","))]
    .map((part) => part.trim())
    .filter(isGameSystemKey);
}

/** Narrow any keyed collection (banners today; articles, starter boxes,
 * events tomorrow) to the preferred systems. Falls back to the full list
 * when no filter is given or nothing matches, so a recommendation for a
 * system with no content yet degrades to today's behavior instead of an
 * empty experience. */
export function filterByGameSystems<T extends { gameSystemKey?: GameSystemKey }>(
  items: T[],
  keys: GameSystemKey[]
): T[] {
  if (keys.length === 0) return items;
  const wanted = new Set(keys);
  const filtered = items.filter(
    (item) => item.gameSystemKey && wanted.has(item.gameSystemKey)
  );
  return filtered.length > 0 ? filtered : items;
}
