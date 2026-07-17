import type { ParsedArmyList, ParsedArmyUnit } from "./types";
import { lookupUnitRole, isNonDatasheet } from "./unit-lexicon";

export type UnitThreatTag =
  | "fast"
  | "durable"
  | "ranged"
  | "melee"
  | "scoring"
  | "character"
  | "cavalry"
  | "war_machine"
  | "monster"
  | "magic";

export type UnitTacticalNote = {
  name: string;
  points: number | null;
  quantity: number | null;
  role: string;
  capability_summary: string;
  threat_tags: UnitThreatTag[];
};

export type TacticalSummary = {
  broad_role: string;
  strengths: string[];
  weaknesses: string[];
  fast_threats: UnitTacticalNote[];
  durable_anchors: UnitTacticalNote[];
  ranged_threats: UnitTacticalNote[];
  melee_threats: UnitTacticalNote[];
  scoring_units: UnitTacticalNote[];
  key_characters: UnitTacticalNote[];
  /** Old World-specific battlefield roles. Optional for saved pre-feature summaries. */
  cavalry_and_chariots?: UnitTacticalNote[];
  war_machines?: UnitTacticalNote[];
  monsters?: UnitTacticalNote[];
  magic_users?: UnitTacticalNote[];
  watch_out_for: string[];
};

const RANGED_PATTERN = /rifle|cannon|plasma|melta|gun|missile|blast|shoot|bolt|flamer|carbine|borer|las-?/i;
const MELEE_PATTERN = /blade|claw|fist|sword|charge|assault|melee|talon|axe|maul|spear|fang|hammer|glaive|halberd/i;
const FAST_PATTERN = /jump|jetbike|bike|cavalry|scout|infiltrat|deep strike|fast|outrider|raider|skimmer/i;
const DURABLE_PATTERN = /terminator|dreadnought|monster|walker|tank|vehicle|hauler|drone|wraith/i;
const SCORING_PATTERN = /battleline|troop/i;
const OLD_WORLD = "Warhammer: The Old World";
const CAVALRY_PATTERN = /cavalry|mounted|horsemen|knights?|demigryph|boar boy|wolf rider|squig hopper|wild rider|dragon prince|chariot/i;
const WAR_MACHINE_PATTERN = /war machine|cannon|catapult|trebuchet|bolt thrower|stone thrower|mortar|organ gun|hellblaster|doom diver|warplightning cannon|field engine/i;
const MONSTER_PATTERN = /monster|dragon|giant|hydra|griffon|wyvern|manticore|shaggoth|treeman|carnosaur|stegadon|necrosphinx|warsphinx/i;
const MAGIC_PATTERN = /wizard|mage|sorcer|shaman|prophetess|damsel|necromancer|runelord|runesmith|spellweaver|priest/i;

// Default "you always have one" melee weapons. Every 40K datasheet carries a
// melee profile, so their mere presence must NOT read as a melee threat —
// otherwise dedicated shooters/psykers (e.g. Zoanthropes, whose only melee is
// "claws and teeth") get mislabelled as melee. We strip these before testing.
const DEFAULT_MELEE_PATTERN = /close combat weapon|claws and teeth|chitinous claws|\bteeth\b|bayonet|combat blade|\bfists?\b(?!\s*of)/gi;

function textFor(unit: ParsedArmyUnit): string {
  return [unit.name, unit.section ?? "", unit.category ?? "", unit.role ?? "", ...unit.wargear, ...unit.upgrades, ...unit.enhancements].join(" ");
}

/** Melee is only a *threat* if there's a real melee weapon beyond the default one. */
function hasMeleeThreat(text: string): boolean {
  const withoutDefaults = text.replace(DEFAULT_MELEE_PATTERN, " ");
  return MELEE_PATTERN.test(withoutDefaults);
}

function isCharacterUnit(unit: ParsedArmyUnit): boolean {
  return /character/i.test(unit.role ?? "") || /characters/i.test(unit.section ?? "");
}

function isScoringUnit(unit: ParsedArmyUnit, text: string, isOldWorld: boolean): boolean {
  if (isOldWorld) return /core/i.test(unit.section ?? "") || (unit.quantity ?? 0) >= 10;
  return SCORING_PATTERN.test(text) || (unit.quantity ?? 0) >= 5;
}

function classify(unit: ParsedArmyUnit, isOldWorld: boolean): UnitThreatTag[] {
  const text = textFor(unit);
  const tags = new Set<UnitThreatTag>();

  // 1. Curated lexicon wins for known units — it carries the authoritative
  //    role that a keyword scan can't reliably infer from a pasted list.
  const entry = lookupUnitRole(unit.name);
  if (entry) {
    entry.tags.forEach((tag) => tags.add(tag));
    // Character/scoring also depend on this specific list's context, so layer
    // the structural reads on top of the lexicon's inherent role.
    if (isCharacterUnit(unit)) tags.add("character");
    if (isScoringUnit(unit, text, isOldWorld)) tags.add("scoring");
    return [...tags];
  }

  // 2. Heuristic fallback for unknown units, with melee tightened.
  if (isCharacterUnit(unit)) tags.add("character");
  if (FAST_PATTERN.test(text)) tags.add("fast");
  const pointsPerModel = unit.points && unit.quantity ? unit.points / unit.quantity : unit.points ?? 0;
  if (DURABLE_PATTERN.test(text) || pointsPerModel >= 150) tags.add("durable");
  if (RANGED_PATTERN.test(text)) tags.add("ranged");
  if (hasMeleeThreat(text)) tags.add("melee");
  if (isScoringUnit(unit, text, isOldWorld)) tags.add("scoring");
  if (isOldWorld) {
    if (CAVALRY_PATTERN.test(text)) { tags.add("cavalry"); tags.add("fast"); }
    if (WAR_MACHINE_PATTERN.test(text)) tags.add("war_machine");
    if (MONSTER_PATTERN.test(text)) { tags.add("monster"); tags.add("durable"); }
    if (MAGIC_PATTERN.test(text)) tags.add("magic");
  }
  // Every unit does *something* on the table — if nothing else matched,
  // read it as a flexible ranged/scoring piece rather than leaving it
  // out of every bucket.
  if (tags.size === 0 || (tags.size === 1 && tags.has("character"))) {
    tags.add(pointsPerModel >= 100 ? "durable" : "scoring");
  }
  return [...tags];
}

function capabilitySummary(unit: ParsedArmyUnit, tags: UnitThreatTag[]): string {
  const parts: string[] = [];
  if (tags.includes("character")) parts.push("a character who leads or buffs nearby units");
  if (tags.includes("durable")) parts.push("built to soak damage and hold ground");
  if (tags.includes("fast")) parts.push("mobile enough to threaten flanks or grab objectives early");
  if (tags.includes("ranged")) parts.push("brings meaningful ranged firepower");
  if (tags.includes("melee")) parts.push("hits hard in close combat");
  if (tags.includes("scoring") && !tags.includes("character")) parts.push("useful for holding or contesting objectives");
  if (tags.includes("cavalry")) parts.push("a mobile cavalry or chariot threat");
  if (tags.includes("war_machine")) parts.push("a war machine that projects threat from the back line");
  if (tags.includes("monster")) parts.push("a large battlefield threat that can anchor a combat");
  if (tags.includes("magic")) parts.push("a source of magical support or pressure");

  const lead = parts.length ? parts.slice(0, 2).join(" and ") : "a flexible piece with no strongly inferred role";
  const sizing = unit.quantity && unit.quantity > 1 ? `A unit of ${unit.quantity} — ${lead}.` : `A single model — ${lead}.`;
  return sizing.charAt(0).toUpperCase() + sizing.slice(1);
}

function toNote(unit: ParsedArmyUnit, isOldWorld: boolean): UnitTacticalNote {
  const tags = classify(unit, isOldWorld);
  const entry = lookupUnitRole(unit.name);
  // Prefer the curated plain-English summary/role when we have one; the unit
  // count is prepended so the note still reflects this list's quantity.
  const summary = entry
    ? `${unit.quantity && unit.quantity > 1 ? `A unit of ${unit.quantity} — ` : ""}${entry.summary}`
    : capabilitySummary(unit, tags);
  return {
    name: unit.name,
    points: unit.points,
    quantity: unit.quantity,
    role: entry?.role || unit.role || unit.section || "Unspecified",
    capability_summary: summary,
    threat_tags: tags,
  };
}

function byTag(notes: UnitTacticalNote[], tag: UnitThreatTag): UnitTacticalNote[] {
  return notes.filter((note) => note.threat_tags.includes(tag));
}

function broadRole(playstyleTags: string[], notes: UnitTacticalNote[], isOldWorld: boolean): string {
  if (isOldWorld) {
    if (byTag(notes, "cavalry").length >= 2) return "Mobile Old World host built to pressure flanks with cavalry and chariots";
    if (byTag(notes, "war_machine").length >= 2) return "Old World gunline built around war machines and ranged pressure";
    if (byTag(notes, "monster").length >= 2) return "Monster-led Old World host built around large, durable combat threats";
    if (byTag(notes, "scoring").length >= 3) return "Ranked Old World battle line with plenty of Core bodies and board presence";
  }
  const meleeHeavy = byTag(notes, "melee").length >= byTag(notes, "ranged").length + 2;
  const rangedHeavy = byTag(notes, "ranged").length >= byTag(notes, "melee").length + 2;
  if (playstyleTags.includes("melee pressure") && meleeHeavy) return "Aggressive melee force built to close the distance and win combats";
  if (playstyleTags.includes("ranged firepower") && rangedHeavy) return "Ranged gunline built to win the firefight before the charge";
  if (playstyleTags.includes("mobility")) return "Fast, mobile force built to control objectives and pick fights on its terms";
  if (meleeHeavy) return "Melee-leaning force that wants to close the distance quickly";
  if (rangedHeavy) return "Firepower-leaning force that wants to win at range";
  if (isOldWorld) return "Balanced Old World host combining a ranked battle line with supporting threats";
  return "Balanced, combined-arms force with both shooting and melee options";
}

function strengthsAndWeaknesses(notes: UnitTacticalNote[], isOldWorld: boolean): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const ranged = byTag(notes, "ranged").length;
  const melee = byTag(notes, "melee").length;
  const fast = byTag(notes, "fast").length;
  const durable = byTag(notes, "durable").length;
  const scoring = byTag(notes, "scoring").length;
  const characters = byTag(notes, "character").length;
  const cavalry = byTag(notes, "cavalry").length;
  const warMachines = byTag(notes, "war_machine").length;
  const monsters = byTag(notes, "monster").length;
  const magic = byTag(notes, "magic").length;

  if (ranged > melee) strengths.push("Strong ranged output — can threaten targets before they close the distance");
  if (melee > ranged) strengths.push("Strong melee output — can win fights once combat is joined");
  if (fast >= 2) strengths.push("Good mobility — can contest objectives early and threaten flanks");
  if (durable >= 2) strengths.push("Durable anchors that are hard to shift off objectives");
  if (scoring >= 3) strengths.push("Plenty of bodies for holding and contesting objectives");
  if (characters >= 2) strengths.push("Multiple characters to lead units and stack buffs");
  if (isOldWorld && cavalry >= 2) strengths.push("Strong cavalry and chariot presence for flank pressure and decisive charges");
  if (isOldWorld && warMachines >= 2) strengths.push("Several war machines can pressure the enemy before battle lines meet");
  if (isOldWorld && monsters >= 2) strengths.push("Multiple large threats can overwhelm an opponent's limited answers");
  if (isOldWorld && magic >= 2) strengths.push("Deep magical support can influence several parts of the battle line");

  if (ranged === 0) weaknesses.push("Little dedicated ranged output — may struggle against a pure gunline");
  if (melee === 0) weaknesses.push("Little dedicated melee output — may struggle once combat is forced");
  if (fast === 0) weaknesses.push("Limited mobility — could be slow to contest far objectives");
  if (durable === 0) weaknesses.push("No obvious durable anchor — vulnerable to focused firepower");
  if (scoring <= 1) weaknesses.push("Thin on scoring bodies — objectives may be hard to hold long-term");
  if (isOldWorld && magic === 0) weaknesses.push("No obvious magical support — enemy wizards may act with less opposition");
  if (isOldWorld && fast === 0 && cavalry === 0) weaknesses.push("Few obvious flankers — the army may be forced into a predictable advance");

  if (!strengths.length) strengths.push("A balanced spread of roles with no single standout strength yet");
  if (!weaknesses.length) weaknesses.push("No glaring gap — opponents will need a plan across every phase");

  return { strengths: strengths.slice(0, 4), weaknesses: weaknesses.slice(0, 4) };
}

function watchOutFor(notes: UnitTacticalNote[]): string[] {
  const byPoints = [...notes].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  const highlights = byPoints.slice(0, 3).filter((note) => (note.points ?? 0) > 0);
  return highlights.map((note) => {
    const tagLabel = note.threat_tags.includes("character")
      ? "a key character"
      : note.threat_tags.includes("durable")
        ? "a durable anchor"
        : note.threat_tags.includes("melee")
          ? "a melee threat"
          : note.threat_tags.includes("ranged")
            ? "a ranged threat"
            : "a flexible threat";
    return `${note.name} — ${tagLabel}${note.points ? ` (${note.points} pts)` : ""}. ${note.capability_summary}`;
  });
}

export function buildTacticalOverview(parsed: ParsedArmyList): TacticalSummary {
  // Drop anything that isn't actually a datasheet (army rules, detachment
  // names, stratagems) so a phantom line can't masquerade as, say, a
  // ~2000pt "durable anchor" in the overview.
  const isOldWorld = parsed.game_system === OLD_WORLD;
  const notes = parsed.units.filter((unit) => !isNonDatasheet(unit.name)).map((unit) => toNote(unit, isOldWorld));
  const { strengths, weaknesses } = strengthsAndWeaknesses(notes, isOldWorld);

  return {
    broad_role: broadRole(parsed.inferred_playstyle_tags, notes, isOldWorld),
    strengths,
    weaknesses,
    fast_threats: byTag(notes, "fast"),
    durable_anchors: byTag(notes, "durable"),
    ranged_threats: byTag(notes, "ranged"),
    melee_threats: byTag(notes, "melee"),
    scoring_units: byTag(notes, "scoring"),
    key_characters: byTag(notes, "character"),
    cavalry_and_chariots: byTag(notes, "cavalry"),
    war_machines: byTag(notes, "war_machine"),
    monsters: byTag(notes, "monster"),
    magic_users: byTag(notes, "magic"),
    watch_out_for: watchOutFor(notes),
  };
}

export const EMPTY_TACTICAL_SUMMARY: TacticalSummary = {
  broad_role: "Not enough parsed units to read a tabletop role yet.",
  strengths: [],
  weaknesses: [],
  fast_threats: [],
  durable_anchors: [],
  ranged_threats: [],
  melee_threats: [],
  scoring_units: [],
  key_characters: [],
  cavalry_and_chariots: [],
  war_machines: [],
  monsters: [],
  magic_users: [],
  watch_out_for: [],
};
