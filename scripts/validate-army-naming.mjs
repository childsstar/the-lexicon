import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = readFileSync(new URL("../lib/army-lists/naming.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const dir = mkdtempSync(join(tmpdir(), "lexicon-naming-"));
const modulePath = join(dir, "naming.cjs");
writeFileSync(modulePath, js);
const { generateFallbackArmyName } = await import(modulePath);

assert.equal(
  generateFallbackArmyName({ faction: "Death Guard", gameSystem: "Warhammer 40,000" }),
  "Imported Death Guard Army",
  "a known faction should produce a neutral, faction-named fallback"
);
assert.equal(
  generateFallbackArmyName({ faction: null, gameSystem: "Warhammer Age of Sigmar" }),
  "Imported Warhammer Age of Sigmar Army",
  "an unknown faction should fall back to the game system"
);
assert.equal(
  generateFallbackArmyName({ faction: null, gameSystem: null }),
  "Imported Army List",
  "no faction or game system should still produce a usable name"
);
assert.equal(
  generateFallbackArmyName({ faction: "  ", gameSystem: "  " }),
  "Imported Army List",
  "blank/whitespace-only inputs should be treated as missing"
);

// The route must only ever call the fallback generator when the user left
// the name blank — never touch a user-entered name.
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
assert.match(
  route,
  /const name = userEnteredName \|\| parsed\?\.roster_name \|\| generateFallbackArmyName\(/,
  "the route should preserve a user-entered name, then use roster metadata, and only then fall back"
);
assert.doesNotMatch(
  route,
  /const name = parsed(\?\.|\.)/,
  "the route should never assign the saved name directly from parsed roster data"
);

console.log("Army fallback naming validation passed");
