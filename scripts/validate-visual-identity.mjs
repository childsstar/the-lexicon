import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = readFileSync(new URL("../lib/armies/visual-identity.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const dir = mkdtempSync(join(tmpdir(), "lexicon-visual-identity-"));
const modulePath = join(dir, "visual-identity.cjs");
writeFileSync(modulePath, js);
const { generateVisualIdentity } = await import(modulePath);

// Deterministic: identical inputs always produce an identical sigil.
const a = generateVisualIdentity({ faction: "Death Guard", name: "Chorus of Contagions", playstyleTags: ["melee pressure"] });
const b = generateVisualIdentity({ faction: "Death Guard", name: "Chorus of Contagions", playstyleTags: ["melee pressure"] });
assert.deepEqual(a, b, "identical inputs should produce an identical sigil");

// Different inputs should (almost always) diverge.
const c = generateVisualIdentity({ faction: "Death Guard", name: "The Last Muster", playstyleTags: [] });
assert.notDeepEqual(a, c, "a different army name should be able to change the sigil");

// The spec's example factions should read as thematically appropriate,
// not just "some deterministic value".
const deathGuard = generateVisualIdentity({ faction: "Death Guard", name: "Rot", playstyleTags: [] });
assert.ok(["bell", "skull", "halo"].includes(deathGuard.icon), "Death Guard should get a corrosion/plague-flavored icon");

const bloodAngels = generateVisualIdentity({ faction: "Blood Angels", name: "Crimson Vow", playstyleTags: [] });
assert.ok(["chalice", "drop", "aquila"].includes(bloodAngels.icon), "Blood Angels should get a chalice/blood/aquila-flavored icon");

const tyranids = generateVisualIdentity({ faction: "Tyranids", name: "Hunger", playstyleTags: [] });
assert.ok(["claw", "eye", "crest"].includes(tyranids.icon), "Tyranids should get a claw/eye/crest-flavored icon");

const aeldari = generateVisualIdentity({ faction: "Aeldari", name: "Starpath", playstyleTags: [] });
assert.ok(["rune", "crescent", "gem"].includes(aeldari.icon), "Aeldari should get a rune/crescent/gem-flavored icon");

// Unknown factions still get a complete, deterministic sigil rather than
// throwing or falling back to nothing.
const unknown = generateVisualIdentity({ faction: "Homebrew Warband", name: "Nameless", playstyleTags: [] });
assert.ok(unknown.icon && unknown.motif && unknown.accent && unknown.frame && unknown.texture, "unrecognized factions should still get a full sigil");

console.log("Visual identity validation passed");
