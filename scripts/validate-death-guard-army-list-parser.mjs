import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileForRequire } from "./compile-ts.mjs";

const [{ parseArmyListDeterministically }] = compileForRequire(["lib/army-lists/fallback-parser.ts"]);

const rawText = readFileSync(new URL("./fixtures/army-lists/death-guard-40k-app-export.txt", import.meta.url), "utf8");
const parsed = parseArmyListDeterministically({ rawText, name: "Chorus of Contagions" });

assert.equal(parsed.game_system, "Warhammer 40,000");
assert.equal(parsed.faction, "Death Guard");
assert.equal(parsed.points_total, 2000);
assert.equal(parsed.unit_count, 13);
assert.notEqual(parsed.game_system, "Unknown");
assert.notEqual(parsed.faction, "Unknown");
assert.ok(parsed.detachment_names.includes("Contagion Engines"));
assert.ok(parsed.detachment_names.includes("Paragons of Putrescence"));
assert.equal(parsed.detachment_points, 2);
assert.equal(parsed.units.find((unit) => unit.name === "Mortarion")?.points, 400);
const haulers = parsed.units.find((unit) => unit.name === "Myphitic Blight-haulers");
assert.equal(haulers?.points, 215);
assert.equal(haulers?.quantity, 2);
assert.ok(parsed.units.every((unit) => unit.section || unit.category));
const parser_status = parsed.units.length ? "succeeded" : "failed";
assert.equal(parser_status, "succeeded");

console.log("Death Guard Warhammer 40,000 app export parser validation passed");
