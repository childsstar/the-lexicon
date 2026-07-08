import assert from "node:assert/strict";
import { compileForRequire } from "./compile-ts.mjs";

const [{ parseArmyListDeterministically }, { buildTacticalOverview }, { lookupUnitRole, isNonDatasheet }] =
  compileForRequire([
    "lib/army-lists/fallback-parser.ts",
    "lib/army-lists/tactical-overview.ts",
    "lib/army-lists/unit-lexicon.ts",
  ]);

// A synthetic Tyranids export (not GW rules text — just unit names + points,
// like a builder export) including a "Synaptic ambush" line that a naive
// parser would read as a ~2000pt datasheet.
const rawText = `2 detachments (2,000 Points)

Tyranids
Invasion Fleet
Strike Force (2,000 Points)

CHARACTERS

Hive Tyrant (195 Points)
• Warlord

Neurotyrant (105 Points)

BATTLELINE

Termagants (60 Points)
• 10x Termagant

OTHER DATASHEETS

Zoanthropes (105 Points)
• 3x Zoanthrope
• Claws and teeth
Norn Emissary (250 Points)
Tyrannofex (200 Points)
Synaptic ambush (1,995 Points)

Exported with App Version: v1.27.0`;

const parsed = parseArmyListDeterministically({ rawText, faction: "Tyranids", name: "Test Swarm" });
const overview = buildTacticalOverview(parsed);

const names = (notes) => notes.map((n) => n.name);

// --- phantom / non-datasheet handling ------------------------------------
assert.ok(isNonDatasheet("Synaptic ambush"), "known army rule is flagged as a non-datasheet");
assert.ok(!parsed.units.some((u) => /synaptic ambush/i.test(u.name)), "the parser must not turn 'Synaptic ambush' into a unit");
assert.ok(
  ![...overview.durable_anchors, ...overview.ranged_threats, ...overview.melee_threats].some((n) => /synaptic ambush/i.test(n.name)),
  "the phantom must not appear anywhere in the tactical overview"
);

// --- Zoanthropes: ranged psyker, NOT a melee threat (the reported bug) ----
assert.ok(names(overview.ranged_threats).includes("Zoanthropes"), "Zoanthropes read as a ranged threat");
assert.ok(!names(overview.melee_threats).includes("Zoanthropes"), "Zoanthropes must NOT read as a melee threat, even with a default 'claws and teeth' weapon");
const zoanNote = [...overview.ranged_threats].find((n) => n.name === "Zoanthropes");
assert.ok(zoanNote && !/close combat/i.test(zoanNote.capability_summary), "Zoanthropes summary reflects ranged/psychic role");
assert.ok(zoanNote && !zoanNote.capability_summary.includes("hits hard in close combat"), "Zoanthropes summary must not claim close-combat prowess");

// --- Tyrannofex: gun monster — durable + ranged, not melee ----------------
assert.ok(names(overview.durable_anchors).includes("Tyrannofex"), "Tyrannofex reads as a durable anchor");
assert.ok(names(overview.ranged_threats).includes("Tyrannofex"), "Tyrannofex reads as a ranged threat");
assert.ok(!names(overview.melee_threats).includes("Tyrannofex"), "Tyrannofex must NOT read as a melee threat");

// --- Norn Emissary: genuine melee bruiser — durable + melee ---------------
assert.ok(names(overview.durable_anchors).includes("Norn Emissary"), "Norn Emissary reads as durable");
assert.ok(names(overview.melee_threats).includes("Norn Emissary"), "Norn Emissary reads as a melee threat");

// --- characters / scoring still derive from the list ----------------------
assert.ok(names(overview.key_characters).includes("Hive Tyrant"), "Hive Tyrant reads as a key character");
assert.ok(names(overview.scoring_units).includes("Termagants"), "a 10-strong Termagant unit reads as scoring");

// --- heuristic fallback: melee only counts beyond a default weapon --------
function overviewOf(unit) {
  return buildTacticalOverview({
    game_system: "Warhammer 40,000", faction: null, subfaction: null, points_total: null,
    units: [unit], inferred_playstyle_tags: [], confidence: 1, warnings: [],
  });
}
const shooter = overviewOf({ name: "Unlisted Gun Team", quantity: 3, points: 90, role: null, section: "OTHER DATASHEETS", enhancements: [], upgrades: [], wargear: ["Heavy gun", "Close combat weapon"] });
assert.ok(names(shooter.ranged_threats).includes("Unlisted Gun Team"), "an unknown unit with a real gun reads as ranged");
assert.ok(!names(shooter.melee_threats).includes("Unlisted Gun Team"), "an unknown unit whose only melee is a default weapon is NOT a melee threat");

const brawler = overviewOf({ name: "Unlisted Brawlers", quantity: 5, points: 100, role: null, section: "OTHER DATASHEETS", enhancements: [], upgrades: [], wargear: ["Power sword"] });
assert.ok(names(brawler.melee_threats).includes("Unlisted Brawlers"), "an unknown unit with a real melee weapon still reads as a melee threat");

// --- lexicon lookup is plural/singular tolerant ---------------------------
assert.ok(lookupUnitRole("Zoanthrope"), "singular lookup resolves");
assert.ok(lookupUnitRole("3x Zoanthropes"), "quantity-prefixed lookup resolves");

console.log("Unit lexicon classification validation passed");
