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
