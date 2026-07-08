import type { UnitThreatTag } from "./tactical-overview";

/**
 * First-party, hand-maintained classification of tabletop units by
 * battlefield role. This is FACTUAL role data ("Zoanthropes are a ranged
 * psyker") — not Games Workshop's copyrighted stat lines or rules text. It
 * exists because a pasted roster rarely contains enough weapon detail to
 * classify a unit reliably from keywords alone (every datasheet carries a
 * melee weapon, so keyword-matching over-reports "melee"). When a unit is in
 * here we trust it; otherwise the parser falls back to heuristics.
 *
 * Keep entries terse and plain-English. No stat lines, no ability wording.
 * Seeded with Tyranids first (the most-tested faction here); extend other
 * factions over time, and prefer fewer/safer tags when unsure.
 */

export type UnitRoleEntry = {
  /** Authoritative threat tags for this unit. */
  tags: UnitThreatTag[];
  /** Short battlefield-role label, e.g. "Synapse psyker". */
  role: string;
  /** One plain-English sentence on what it does. No rules text. */
  summary: string;
};

/**
 * Names that show up in roster exports but are NOT datasheets — army
 * rules, detachment names, stratagems, enhancements, force-org headers.
 * Used to drop phantom "units" the line parser can pick up (e.g. the
 * "Synaptic ambush" that was being read as a ~2000pt model).
 */
const NON_DATASHEET = new Set<string>(
  [
    // --- generic roster scaffolding ---
    "detachment",
    "detachments",
    "battle size",
    "strike force",
    "incursion",
    "combat patrol",
    "onslaught",
    "force dispositions",
    "exported with",
    "data version",
    "app version",
    "enhancement",
    "enhancements",
    "stratagem",
    "stratagems",
    "warlord",
    "faction",
    "allegiance",
    "army roster",
    "total",
    // --- Tyranids army/detachment/stratagem rules seen in exports ---
    "synapse",
    "shadow in the warp",
    "synaptic ambush",
    "synaptic imperatives",
    "synaptic imperative",
    "invasion fleet",
    "assimilation swarm",
    "crusher stampede",
    "unending swarm",
    "vanguard onslaught",
    "warrior bioform onslaught",
    "adaptive biology",
  ].map(normalizeUnitName)
);

/**
 * Normalize a unit name for lookup: lowercase, drop leading quantity
 * ("3x Zoanthropes"), strip punctuation, collapse whitespace.
 */
export function normalizeUnitName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^\s*\d+\s*[x×]\s*/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TYRANIDS: Record<string, UnitRoleEntry> = {
  "hive tyrant": { tags: ["character", "durable", "melee", "ranged"], role: "Warlord monster", summary: "A monstrous synapse commander that both shoots and fights, and anchors the swarm's leadership." },
  "the swarmlord": { tags: ["character", "durable", "melee"], role: "Melee warlord monster", summary: "A top-tier melee monster and synapse commander built to lead the swarm and win combats." },
  "neurotyrant": { tags: ["character", "ranged"], role: "Psyker character", summary: "A synapse psyker character whose threat is ranged/psychic rather than melee." },
  "winged hive tyrant": { tags: ["character", "fast", "melee", "durable"], role: "Flying warlord monster", summary: "A fast flying monster character that dives into key combats." },
  "norn emissary": { tags: ["durable", "melee"], role: "Monster bruiser", summary: "A tough monster built to soak damage and hit hard in close combat." },
  "norn assimilator": { tags: ["durable", "ranged"], role: "Gun monster", summary: "A tough monster whose main threat is heavy ranged firepower." },
  "tyrannofex": { tags: ["durable", "ranged"], role: "Gun monster", summary: "A durable monster built around a single big gun — a ranged anchor, not a melee threat." },
  "exocrine": { tags: ["durable", "ranged"], role: "Gun monster", summary: "A durable monster that delivers heavy ranged firepower from midfield." },
  "maleceptor": { tags: ["durable", "ranged"], role: "Psyker monster", summary: "A tanky psychic monster whose damage is ranged/psychic; can grind in melee but leads with mind attacks." },
  "haruspex": { tags: ["durable", "melee"], role: "Melee monster", summary: "A durable melee monster that heals as it devours enemies in close combat." },
  "screamer killer": { tags: ["durable", "melee"], role: "Melee carnifex", summary: "A durable close-combat carnifex variant built to charge and kill." },
  "carnifex": { tags: ["durable", "melee"], role: "Melee monster", summary: "A tough monster that leads with a brutal charge into close combat." },
  "trygon": { tags: ["fast", "durable", "melee"], role: "Deep-strike monster", summary: "A fast, durable burrowing monster that arrives to threaten backfield and charge." },
  "mawloc": { tags: ["fast", "melee"], role: "Deep-strike disruptor", summary: "A burrowing monster that erupts into the enemy line to disrupt and pick off units." },
  "psychophage": { tags: ["durable", "melee"], role: "Melee monster", summary: "A durable melee monster that punishes enemy psykers and grinds in combat." },
  "zoanthropes": { tags: ["ranged"], role: "Synapse psyker", summary: "A synapse psyker unit whose threat is ranged/psychic (Warp Blast) — not a close-combat unit." },
  "neurolictor": { tags: ["fast"], role: "Infiltrating disruptor", summary: "A stealthy fast unit that debuffs enemies and screens the advance." },
  "lictor": { tags: ["fast", "melee"], role: "Infiltrating hunter", summary: "A fast infiltrating ambusher that picks off characters and light units in melee." },
  "deathleaper": { tags: ["fast", "character", "melee"], role: "Infiltrating character", summary: "A fast character assassin that infiltrates and harasses enemy characters." },
  "von ryans leapers": { tags: ["fast", "melee"], role: "Fast melee harasser", summary: "A fast melee unit that leaps across the board to threaten objectives and soft targets." },
  "genestealers": { tags: ["fast", "melee"], role: "Elite melee", summary: "A fast elite melee unit built to charge and shred infantry." },
  "termagants": { tags: ["scoring"], role: "Chaff battleline", summary: "Cheap expendable bodies for holding and screening objectives; light shooting at best." },
  "hormagaunts": { tags: ["fast", "scoring", "melee"], role: "Fast chaff", summary: "Fast expendable bodies that swarm objectives and tie up units in melee." },
  "gargoyles": { tags: ["fast", "scoring"], role: "Fast chaff flyers", summary: "Fast flying chaff for grabbing objectives and screening." },
  "ripper swarms": { tags: ["scoring"], role: "Objective grabbers", summary: "Small expendable swarms used to sit on and grab objectives." },
  "tyranid warriors with melee bio weapons": { tags: ["melee"], role: "Synapse melee", summary: "A mid-tier synapse unit kitted for close combat." },
  "tyranid warriors with ranged bio weapons": { tags: ["ranged"], role: "Synapse fire support", summary: "A mid-tier synapse unit kitted for ranged fire support." },
  "barbgaunts": { tags: ["ranged"], role: "Fire support", summary: "A light shooting unit that slows and pins advancing enemies." },
  "biovores": { tags: ["ranged"], role: "Indirect fire", summary: "A ranged support unit that lobs spore mines at range." },
  "pyrovores": { tags: ["ranged"], role: "Close-range guns", summary: "A short-ranged shooting unit best against clustered infantry." },
  "tyrant guard": { tags: ["durable", "melee"], role: "Bodyguard", summary: "Durable bodyguards that shield a monster character and fight in melee." },
  "venomthropes": { tags: ["durable"], role: "Defensive support", summary: "A support unit that makes nearby monsters harder to shoot; little offensive threat itself." },
};

// A small set of near-ubiquitous units from other factions, only where the
// role is unambiguous. Kept intentionally short — a wrong entry is worse than
// none, so unknown units simply fall through to the heuristic.
const COMMON: Record<string, UnitRoleEntry> = {
  "terminators": { tags: ["durable", "melee"], role: "Elite infantry", summary: "Durable elite infantry that deep-strike and hit hard up close." },
  "intercessors": { tags: ["scoring"], role: "Battleline", summary: "Reliable objective-holding battleline infantry with solid rifles." },
  "redemptor dreadnought": { tags: ["durable", "ranged"], role: "Gun walker", summary: "A durable walker built around heavy ranged firepower." },
};

const LEXICON: Record<string, UnitRoleEntry> = { ...TYRANIDS, ...COMMON };

/** Look up a unit's curated role, trying an exact match then a singularized one. */
export function lookupUnitRole(name: string): UnitRoleEntry | null {
  const key = normalizeUnitName(name);
  if (LEXICON[key]) return LEXICON[key];
  // "Zoanthropes" -> "zoanthrope" and vice versa.
  if (key.endsWith("s") && LEXICON[key.slice(0, -1)]) return LEXICON[key.slice(0, -1)];
  if (LEXICON[`${key}s`]) return LEXICON[`${key}s`];
  return null;
}

/** True if this name is an army rule / detachment / stratagem, not a datasheet. */
export function isNonDatasheet(name: string): boolean {
  const key = normalizeUnitName(name);
  if (!key) return true;
  return NON_DATASHEET.has(key);
}
