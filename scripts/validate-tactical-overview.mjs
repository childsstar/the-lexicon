import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = readFileSync(new URL("../lib/army-lists/tactical-overview.ts", import.meta.url), "utf8")
  .replace(/^import type .*\n/gm, "");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const dir = mkdtempSync(join(tmpdir(), "lexicon-tactical-"));
const modulePath = join(dir, "tactical-overview.cjs");
writeFileSync(modulePath, js);
const { buildTacticalOverview } = await import(modulePath);

const fallbackSource = readFileSync(new URL("../lib/army-lists/fallback-parser.ts", import.meta.url), "utf8")
  .replace(/^import type .*\n/gm, "");
const fallbackJs = ts.transpileModule(fallbackSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const fallbackPath = join(dir, "fallback-parser.cjs");
writeFileSync(fallbackPath, fallbackJs);
const { parseArmyListDeterministically } = await import(fallbackPath);

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

console.log("Tactical overview validation passed");
