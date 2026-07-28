import { BANNERS, BANNER_BY_ID } from "./banners";
import type { Banner } from "./types";

// The Hall of Banners is the canonical visual identity for factions across
// The Lexicon. This registry resolves any faction string an army carries —
// imported roster headers, snapshot fields, picker labels — to the banner
// whose heraldry represents that faction, so every screen draws from the
// same source artwork. Unresolvable factions get no banner and callers
// render a neutral placeholder instead of a broken mark.

/** Lowercase, drop apostrophes/diacritics, collapse punctuation to spaces —
 * so "T'au Empire", "Orc & Goblin Tribes" and roster-style variants all
 * land on stable, space-separated tokens. */
function normalizeFaction(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Alternate names, umbrella terms, and subfactions that should resolve to
// an existing banner. Keys are matched after the banners' own primary
// faction names, longest key first, so specific entries ("dark eldar",
// "heretic astartes") always win over broader ones ("eldar", "astartes").
// A null value pins a faction to the placeholder — it's a distinct faction
// that must NOT inherit a lookalike's heraldry via a broader key.
const FACTION_ALIASES: Record<string, string | null> = {
  // Warhammer 40,000
  "adeptus astartes": "shield-unbroken",
  astartes: "shield-unbroken",
  "space marine": "shield-unbroken",
  "blood angels": "shield-unbroken",
  "dark angels": "shield-unbroken",
  ultramarines: "shield-unbroken",
  "space wolves": "shield-unbroken",
  "black templars": "shield-unbroken",
  deathwatch: "shield-unbroken",
  "imperial fists": "shield-unbroken",
  "iron hands": "shield-unbroken",
  "raven guard": "shield-unbroken",
  salamanders: "shield-unbroken",
  "white scars": "shield-unbroken",
  "sisters of battle": "burning-faith",
  sororitas: "burning-faith",
  "imperial guard": "lantern-line",
  militarum: "lantern-line",
  custodes: "auric-watch",
  admech: "machine-communion",
  skitarii: "machine-communion",
  "cult mechanicus": "machine-communion",
  votann: "iron-oath",
  squats: "iron-oath",
  tau: "patient-horizon",
  tyranid: "endless-hunger",
  gsc: "subterranean-star",
  necron: "deathless-crown",
  ork: "roaring-horde",
  "dark eldar": "glass-knife",
  craftworlds: "veiled-path",
  craftworld: "veiled-path",
  asuryani: "veiled-path",
  ynnari: "veiled-path",
  eldar: "veiled-path",
  "heretic astartes": "blackened-choir",
  "emperors children": "blackened-choir",
  csm: "blackened-choir",
  chaos: "blackened-choir",
  // The Horus Heresy
  "legiones astartes traitor": "blackened-choir",
  mechanicum: "machine-communion",
  // Age of Sigmar
  stormcast: "storms-herald",
  soulblight: "midnight-court",
  gitz: "cracked-moon",
  kharadron: "sky-ledger",
  lumineth: "dawn-prism",
  ossiarch: "bone-accounting",
  orruk: "green-avalanche",
  ogor: "winter-cauldron",
  maggotkin: "rain-of-spores",
  hedonites: "velvet-mirror",
  // Warhammer: The Old World
  bretonnia: "gilded-charge",
  "tomb kings": "sunless-dynasty",
  dwarfs: "mountain-ledger",
  dwarves: "mountain-ledger",
  "orcs and goblins": "crooked-muster",
  "the empire": "hundred-hearths",
  empire: "hundred-hearths",
  beastmen: "thorned-revel",
  "wood elves": "hidden-bough",
  "wood elf": "hidden-bough",
  "high elves": "ivory-astrolabe",
  "high elf": "ivory-astrolabe",
  cathay: "jade-compass",
  // Cross-edition lineages that share a visual family with an AoS banner.
  lizardmen: "star-coil",
  "vampire counts": "midnight-court",
  // Distinct factions with no banner yet — placeholder, not a lookalike's mark.
  "chaos dwarfs": null,
};

const BANNER_BY_FACTION_KEY = new Map<string, Banner>();
for (const banner of BANNERS) {
  const key = normalizeFaction(banner.primaryFaction);
  if (!BANNER_BY_FACTION_KEY.has(key)) BANNER_BY_FACTION_KEY.set(key, banner);
}

/** Primary faction names + aliases, longest first so the most specific
 * key matches before any umbrella term it contains. */
const MATCH_KEYS: Array<{ key: string; banner: Banner | null }> = [
  ...[...BANNER_BY_FACTION_KEY.entries()].map(([key, banner]) => ({ key, banner: banner as Banner | null })),
  ...Object.entries(FACTION_ALIASES).map(([alias, bannerId]) => ({
    key: alias,
    banner: bannerId === null ? null : BANNER_BY_ID.get(bannerId) ?? null,
  })),
].sort((a, b) => b.key.length - a.key.length);

/**
 * Resolve a faction string to its Hall of Banners entry, or null when the
 * faction has no heraldry yet. Exact (normalized) matches win; otherwise
 * the longest banner/alias key found on a token boundary in the input wins,
 * so "Xenos — Tyranids (Invasion Fleet)" still resolves to Tyranids.
 */
export function resolveFactionHeraldry(faction: string | null | undefined): Banner | null {
  if (!faction) return null;
  const normalized = normalizeFaction(faction);
  if (!normalized) return null;

  const exact = BANNER_BY_FACTION_KEY.get(normalized);
  if (exact) return exact;

  const padded = ` ${normalized} `;
  for (const { key, banner } of MATCH_KEYS) {
    if (padded.includes(` ${key} `)) return banner;
  }
  return null;
}
