/**
 * Deterministic army "sigil" — a small visual identity derived from
 * faction + army name + playstyle tags. No image generation: this picks
 * from curated motif/accent/frame/texture sets using existing UI
 * primitives (icons, gradients, borders), so the same inputs always
 * produce the same sigil and every army gets a mark without an AI call.
 */

export type SigilIconKey =
  | "bell"
  | "skull"
  | "halo"
  | "chalice"
  | "drop"
  | "aquila"
  | "claw"
  | "eye"
  | "crest"
  | "rune"
  | "crescent"
  | "gem"
  | "scarab"
  | "gear"
  | "tusk"
  | "star"
  | "shield"
  | "flag";

export type SigilAccent = "gold" | "ember" | "parchment" | "bone";
export type SigilFrame = "engraved" | "aquila" | "crystal" | "corroded";
export type SigilTexture =
  | "gilded-grain"
  | "corroded-metal"
  | "chitin-plate"
  | "crystalline-facet"
  | "parchment-weave";

export type VisualIdentity = {
  seed: string;
  motif: string;
  icon: SigilIconKey;
  accent: SigilAccent;
  frame: SigilFrame;
  texture: SigilTexture;
};

type MotifOption = { motif: string; icon: SigilIconKey; frame: SigilFrame; texture: SigilTexture; accent: SigilAccent };

// Keyed by lowercase substring matched against the faction/subfaction
// text. Order matters — first match wins, so more specific factions
// should be listed before broader umbrella terms.
const FACTION_MOTIFS: Array<{ match: string; options: MotifOption[] }> = [
  {
    match: "death guard",
    options: [
      { motif: "Corroded bell", icon: "bell", frame: "corroded", texture: "corroded-metal", accent: "bone" },
      { motif: "Plague skull", icon: "skull", frame: "corroded", texture: "corroded-metal", accent: "bone" },
      { motif: "Rusted halo", icon: "halo", frame: "corroded", texture: "corroded-metal", accent: "ember" },
    ],
  },
  {
    match: "blood angels",
    options: [
      { motif: "Winged chalice", icon: "chalice", frame: "aquila", texture: "gilded-grain", accent: "ember" },
      { motif: "Blood drop", icon: "drop", frame: "aquila", texture: "gilded-grain", accent: "ember" },
      { motif: "Gold aquila", icon: "aquila", frame: "aquila", texture: "gilded-grain", accent: "gold" },
    ],
  },
  {
    match: "tyranid",
    options: [
      { motif: "Chitin claw", icon: "claw", frame: "crystal", texture: "chitin-plate", accent: "bone" },
      { motif: "Hive eye", icon: "eye", frame: "crystal", texture: "chitin-plate", accent: "ember" },
      { motif: "Serrated crest", icon: "crest", frame: "crystal", texture: "chitin-plate", accent: "bone" },
    ],
  },
  {
    match: "aeldari",
    options: [
      { motif: "Rune", icon: "rune", frame: "crystal", texture: "crystalline-facet", accent: "parchment" },
      { motif: "Crescent blade", icon: "crescent", frame: "crystal", texture: "crystalline-facet", accent: "gold" },
      { motif: "Spirit gem", icon: "gem", frame: "crystal", texture: "crystalline-facet", accent: "parchment" },
    ],
  },
  {
    match: "eldar",
    options: [
      { motif: "Rune", icon: "rune", frame: "crystal", texture: "crystalline-facet", accent: "parchment" },
      { motif: "Crescent blade", icon: "crescent", frame: "crystal", texture: "crystalline-facet", accent: "gold" },
      { motif: "Spirit gem", icon: "gem", frame: "crystal", texture: "crystalline-facet", accent: "parchment" },
    ],
  },
  {
    match: "necron",
    options: [
      { motif: "Tomb scarab", icon: "scarab", frame: "engraved", texture: "crystalline-facet", accent: "gold" },
      { motif: "Gauss glyph", icon: "gear", frame: "engraved", texture: "crystalline-facet", accent: "ember" },
    ],
  },
  {
    match: "ork",
    options: [
      { motif: "Boar tusk", icon: "tusk", frame: "corroded", texture: "corroded-metal", accent: "ember" },
      { motif: "Scrap gear", icon: "gear", frame: "corroded", texture: "corroded-metal", accent: "bone" },
    ],
  },
  {
    match: "space marine",
    options: [
      { motif: "Chapter aquila", icon: "aquila", frame: "aquila", texture: "gilded-grain", accent: "gold" },
      { motif: "Warded shield", icon: "shield", frame: "engraved", texture: "gilded-grain", accent: "gold" },
    ],
  },
  {
    match: "chaos",
    options: [
      { motif: "Corroded bell", icon: "bell", frame: "corroded", texture: "corroded-metal", accent: "ember" },
      { motif: "Warp rune", icon: "rune", frame: "corroded", texture: "corroded-metal", accent: "ember" },
    ],
  },
];

const GENERIC_MOTIFS: MotifOption[] = [
  { motif: "Lexicon sigil", icon: "star", frame: "engraved", texture: "parchment-weave", accent: "gold" },
  { motif: "Banner crest", icon: "flag", frame: "engraved", texture: "parchment-weave", accent: "parchment" },
  { motif: "Warded shield", icon: "shield", frame: "engraved", texture: "parchment-weave", accent: "bone" },
];

const ACCENT_OVERRIDES: Array<{ tag: string; accent: SigilAccent }> = [
  { tag: "melee pressure", accent: "ember" },
  { tag: "ranged firepower", accent: "gold" },
  { tag: "psychic/magic support", accent: "parchment" },
];

/** Small, fast, deterministic string hash (FNV-1a, 32-bit). */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pickMotifOptions(faction: string | null | undefined): MotifOption[] {
  const normalized = (faction ?? "").toLowerCase();
  const match = FACTION_MOTIFS.find((entry) => normalized.includes(entry.match));
  return match?.options ?? GENERIC_MOTIFS;
}

export function generateVisualIdentity(input: {
  faction?: string | null;
  name?: string | null;
  playstyleTags?: string[];
}): VisualIdentity {
  const tags = input.playstyleTags ?? [];
  const seed = `${input.faction ?? ""}|${input.name ?? ""}|${tags.join(",")}`;
  const h = hash(seed);

  const options = pickMotifOptions(input.faction);
  const chosen = options[h % options.length];

  const accentOverride = ACCENT_OVERRIDES.find((entry) => tags.includes(entry.tag));
  const accent = accentOverride?.accent ?? chosen.accent;

  return {
    seed: h.toString(36),
    motif: chosen.motif,
    icon: chosen.icon,
    accent,
    frame: chosen.frame,
    texture: chosen.texture,
  };
}
