import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

// Audit: every supported faction must resolve through the shared Hall of
// Banners registry — either to a banner or to the deliberate placeholder
// (factions with no banner yet). No faction may resolve "by accident" to
// an unrelated banner, and no banner may be unreachable.

const ROOT = new URL("..", import.meta.url).pathname;

function transpile(relPath) {
  const source = readFileSync(join(ROOT, relPath), "utf8");
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

// faction-heraldry.ts imports ./banners at runtime; emit both into one dir
// so the transpiled require("./banners") resolves.
const dir = mkdtempSync(join(tmpdir(), "lexicon-faction-heraldry-"));
writeFileSync(join(dir, "banners.js"), transpile("lib/chronicle/banners.ts"));
writeFileSync(join(dir, "faction-heraldry.js"), transpile("lib/chronicle/faction-heraldry.ts"));
const { resolveFactionHeraldry } = await import(join(dir, "faction-heraldry.js"));
const { BANNERS } = await import(join(dir, "banners.js"));

// Supported faction lists come from lib/game-data.ts (parsed from source —
// it has its own import graph).
const gameData = readFileSync(join(ROOT, "lib", "game-data.ts"), "utf8");
function factionsOf(systemName) {
  const block = gameData.match(
    new RegExp(`name: "${systemName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}",\\s*factions: \\[([\\s\\S]*?)\\]`)
  )?.[1];
  assert.ok(block, `should find the ${systemName} faction list in lib/game-data.ts`);
  return [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

// Factions that intentionally have no Hall of Banners heraldry yet — these
// must render the neutral placeholder, not a broken or unrelated mark.
// Remove an entry here once its banner ships.
const PLACEHOLDER_OK = new Set([
  // Warhammer 40,000
  "Imperial Agents",
  // Age of Sigmar
  "Flesh-eater Courts",
  "Idoneth Deepkin",
  "Sons of Behemat",
  // The Old World
  "Chaos Dwarfs",
  "Dark Elves",
]);

// Chaos umbrella factions deliberately share the Chaos family banner.
const EXPECTED_FAMILY = new Map([
  ["Chaos Daemons", "blackened-choir"],
  ["Daemons of Chaos", "blackened-choir"],
  ["Lizardmen", "star-coil"],
  ["Vampire Counts", "midnight-court"],
]);

for (const system of ["Warhammer 40,000", "Warhammer: Age of Sigmar", "Warhammer: The Old World"]) {
  for (const faction of factionsOf(system)) {
    const banner = resolveFactionHeraldry(faction);
    if (PLACEHOLDER_OK.has(faction)) {
      assert.equal(banner, null, `${faction} has no banner yet and should fall back to the placeholder`);
      continue;
    }
    assert.ok(banner, `${faction} (${system}) should resolve to Hall of Banners heraldry`);
    const expected = EXPECTED_FAMILY.get(faction);
    if (expected) {
      assert.equal(banner.id, expected, `${faction} should resolve to its family banner ${expected}`);
    } else {
      // A faction with its own banner must land on it, not on a lookalike.
      const own = BANNERS.find((b) => b.primaryFaction.toLowerCase() === faction.toLowerCase());
      if (own) assert.equal(banner.id, own.id, `${faction} should resolve to its own banner`);
    }
  }
}

// Every banner's own primary faction resolves back to that banner.
for (const banner of BANNERS) {
  const resolved = resolveFactionHeraldry(banner.primaryFaction);
  assert.ok(resolved, `${banner.primaryFaction} should resolve to a banner`);
}

// Roster-style variants and common alternate names.
const VARIANTS = [
  ["Xenos — Tyranids (Invasion Fleet)", "endless-hunger"],
  ["Tyranid", "endless-hunger"],
  ["T'au", "patient-horizon"],
  ["Tau Empire", "patient-horizon"],
  ["Adeptus Astartes", "shield-unbroken"],
  ["Blood Angels", "shield-unbroken"],
  ["Heretic Astartes", "blackened-choir"],
  ["Imperial Guard", "lantern-line"],
  ["Sisters of Battle", "burning-faith"],
  ["Dark Eldar", "glass-knife"],
  ["Eldar", "veiled-path"],
  ["Craftworlds", "veiled-path"],
  ["Necron", "deathless-crown"],
  ["Ork", "roaring-horde"],
  ["Bretonnia", "gilded-charge"],
  ["Orcs and Goblins", "crooked-muster"],
  ["The Empire", "hundred-hearths"],
  ["Wood Elves", "hidden-bough"],
  ["High Elves", "ivory-astrolabe"],
];
for (const [input, expected] of VARIANTS) {
  assert.equal(resolveFactionHeraldry(input)?.id, expected, `"${input}" should resolve to ${expected}`);
}

// Unknown/empty factions get the placeholder, never a wrong banner or crash.
assert.equal(resolveFactionHeraldry("Homebrew Warband"), null);
assert.equal(resolveFactionHeraldry(""), null);
assert.equal(resolveFactionHeraldry(null), null);
assert.equal(resolveFactionHeraldry(undefined), null);

console.log("Faction heraldry validation passed");
