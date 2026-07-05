import type { GameSystemKey } from "../game-systems";
import { GAMES, isGameKey } from "../games";
import type { RealmKey } from "../realms";
import type { UniverseKey } from "../universes";
import {
  matchesActiveUniverseContext,
  type ActiveContext,
} from "../active-context-matching";

// The Chronicle engine — shared types.
//
// A "chronicle" is an interactive experience (Find Your Banner is the first
// of a planned family: What Kind of Commander Are You?, Which Campaign
// Should You Lead?, …). Everything here is plain data + pure functions so a
// chronicle can run entirely client-side today and move server-side when
// real AI generation plugs in.

/** Personality axes accumulated while answering. Deliberately un-gamey —
 * questions score these without ever mentioning the tabletop. */
export type TraitId =
  | "valor" // courage, glory, acting first
  | "discipline" // order, duty, the well-drawn plan
  | "cunning" // wit, patience, the sideways path
  | "wonder" // mystery, faith, the pull of the unknown
  | "endurance" // grit, stone, outlasting everything
  | "wildness"; // instinct, hunger, the untamed

export type TraitScores = Record<TraitId, number>;

export const TRAITS: Record<TraitId, { name: string; epithet: string }> = {
  valor: { name: "Valor", epithet: "you move first and apologize never" },
  discipline: { name: "Discipline", epithet: "you build the plan others follow" },
  cunning: { name: "Cunning", epithet: "you find the door nobody else sees" },
  wonder: { name: "Wonder", epithet: "you listen for what the world is hiding" },
  endurance: { name: "Endurance", epithet: "you outlast what you cannot outfight" },
  wildness: { name: "Wildness", epithet: "you trust the instinct under your skin" },
};

export type ChronicleOption = {
  label: string;
  /** Trait weights this answer contributes (typically 1–2 per trait). */
  traits: Partial<TraitScores>;
};

export type ChronicleQuestion = {
  /** Scene-setting line, e.g. "A road splits before you." */
  prompt: string;
  /** Optional second line, e.g. "Which path do you choose?" */
  followUp?: string;
  options: ChronicleOption[];
};

export type ChronicleQuiz = {
  slug: string;
  title: string;
  tagline: string;
  /** Shown on the intro screen before the first question. */
  invocation: string;
  questions: ChronicleQuestion[];
  /** Lines shown during the ceremonial reveal, in order. */
  ceremony: string[];
};

/** A possible outcome: an archetype mapped to a real game system + faction. */
export type Banner = {
  id: string;
  /** Evocative archetype name, e.g. "The Shield Unbroken". */
  name: string;
  /** Structured reference into GAME_SYSTEMS — used for filtering and
   * future recommendations. `gameSystem` remains the display label. */
  gameSystemKey: GameSystemKey;
  /** Optional game system label, e.g. "Warhammer 40,000". */
  gameSystem?: string;
  primaryFaction: string;
  /** Optional official external destination for the faction/game page. */
  officialUrl?: string;
  /** Optional machine-friendly source identifier for the official URL. */
  officialSource?: string;
  /** Optional publisher label for the faction/game page. */
  publisher?: string;
  /** How strongly each trait pulls toward this banner. */
  profile: Partial<TraitScores>;
  /** Second-person, "unexpectedly accurate" — the emotional core. */
  personalitySummary: string;
  /** Why this system + faction fit the reader. */
  reasoning: string;
  /** Opening lines of their Chronicle — narrative, not analysis. */
  chronicleIntro: string;
  /** Environment/mood-only art direction. No characters, no IP. */
  imagePrompt: string;
  /** Short quote for the future shareable Chronicle Card. */
  cardQuote: string;
  /** Gradient palette for the placeholder artwork [deep, mid, glow]. */
  palette: [string, string, string];
};

/** A banner's place in the Universe/Realm/Game hierarchy, when its
 * gameSystemKey also names a canonical Game (lib/games.ts) — undefined for
 * banners outside Warhammer, which the hierarchy doesn't model yet. Kept as
 * a lookup rather than fields on every Banner literal so realm-aware
 * filtering (e.g. "only banners in the active realm") is a config-free
 * addition. */
export function bannerHierarchy(
  banner: Pick<Banner, "gameSystemKey">
): { universeKey: UniverseKey; realmKey: RealmKey } | undefined {
  if (!isGameKey(banner.gameSystemKey)) return undefined;
  const game = GAMES[banner.gameSystemKey];
  return { universeKey: game.universeKey, realmKey: game.realmKey };
}

export type BannerContextFilterResult = {
  banners: Banner[];
  /** True when no banner matched the active realm/game and the full list
   * was returned instead — the Hall of Banners and Find Your Banner should
   * surface this (see docs/universe-realm-game-audit.md) rather than
   * silently showing an unfiltered list with no explanation. */
  fellBack: boolean;
};

/** The canonical Hall of Banners / Find Your Banner filter: scopes banners
 * to the active realm/game via the shared matching layer
 * (lib/active-context-matching.ts), gracefully falling back to the full
 * list — never an empty page — when nothing has been mapped there yet. */
export function filterBannersForActiveContext(
  banners: Banner[],
  active: ActiveContext
): BannerContextFilterResult {
  if (!active.realmKey && !active.gameKey) {
    return { banners, fellBack: false }; // "All Warhammer" — no filter
  }
  const matched = banners.filter((banner) =>
    matchesActiveUniverseContext(
      {
        gameKey: isGameKey(banner.gameSystemKey)
          ? banner.gameSystemKey
          : null,
      },
      active,
      { onUnknown: false }
    )
  );
  return matched.length > 0
    ? { banners: matched, fellBack: false }
    : { banners, fellBack: true };
}

/** The generated result — the shape a future LLM call must also return. */
export type ChronicleResult = {
  gameSystem: string;
  primaryFaction: string;
  alternateFactions: {
    bannerName: string;
    gameSystem: string;
    faction: string;
    whisper: string;
  }[];
  personalitySummary: string;
  reasoning: string;
  chronicleIntro: string;
  imagePrompt: string;
};

/** Pluggable result generation. The default implementation is
 * deterministic/templated; an LLM-backed implementation slots in later
 * without touching the UI. */
export interface ResultGenerator {
  generate(input: {
    quiz: ChronicleQuiz;
    answers: number[];
    scores: TraitScores;
    ranked: Banner[];
  }): Promise<ChronicleResult>;
}
