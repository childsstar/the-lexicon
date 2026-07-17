import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileForRequire } from "./compile-ts.mjs";

const [{ parseArmyListDeterministically }, { buildTacticalOverview }] = compileForRequire([
  "lib/army-lists/fallback-parser.ts",
  "lib/army-lists/tactical-overview.ts",
]);

const rawText = readFileSync(new URL("./fixtures/army-lists/death-guard-40k-app-export.txt", import.meta.url), "utf8");
const parsed = parseArmyListDeterministically({ rawText, name: "Chorus of Contagions" });
const overview = buildTacticalOverview(parsed);

assert.ok(overview.broad_role.length > 0, "broad role should be a non-empty sentence");
assert.ok(overview.key_characters.some((unit) => unit.name === "Mortarion"), "Mortarion should read as a key character");
assert.ok(overview.durable_anchors.some((unit) => unit.name === "Blightlord Terminators"), "Terminators should read as a durable anchor");
assert.ok(overview.scoring_units.some((unit) => unit.name === "Plague Marines"), "battleline Plague Marines should read as scoring units");
assert.ok(overview.watch_out_for.length > 0, "watch-out-for notes should be generated from the roster");
assert.ok(
  overview.watch_out_for.some((note) => note.includes("Mortarion")),
  "the highest-points unit (Mortarion) should show up in watch-out-for notes"
);
for (const unit of [...overview.key_characters, ...overview.durable_anchors]) {
  assert.ok(unit.capability_summary.length > 0, `${unit.name} should have a plain-English capability summary`);
}

// An empty army shouldn't crash the classifier — it should just read as
// having nothing to report yet.
const empty = buildTacticalOverview({
  game_system: null,
  faction: null,
  subfaction: null,
  points_total: null,
  units: [],
  inferred_playstyle_tags: [],
  confidence: 0,
  warnings: [],
});
assert.equal(empty.fast_threats.length, 0);
assert.equal(empty.key_characters.length, 0);

// Old World summaries use rank-and-flank roles rather than relying solely on
// 40K concepts such as Battleline, vehicles, and deep strike.
const oldWorld = buildTacticalOverview(parseArmyListDeterministically({
  gameSystem: "Warhammer: The Old World",
  faction: "Empire of Man",
  rawText: `The Amber Road\nTotal: 2,000 pts\nCharacters\nWizard Lord - 210 pts\nCore\n20 State Troops - 180 pts\n5 Empire Knights - 135 pts\nSpecial\nGreat Cannon - 125 pts\nRare\nSteam Tank - 265 pts`,
}));
assert.ok(oldWorld.scoring_units.some((unit) => unit.name === "State Troops"), "Old World Core infantry should read as board presence");
assert.ok(oldWorld.cavalry_and_chariots.some((unit) => unit.name === "Empire Knights"), "Old World cavalry should be identified");
assert.ok(oldWorld.war_machines.some((unit) => unit.name === "Great Cannon"), "Old World war machines should be identified");
assert.ok(oldWorld.magic_users.some((unit) => unit.name === "Wizard Lord"), "Old World magic users should be identified");
assert.match(oldWorld.broad_role, /Old World/, "Old World summaries should use system-appropriate language");

console.log("Tactical overview validation passed");
