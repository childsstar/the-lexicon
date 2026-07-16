import assert from "node:assert/strict";
import { compileForRequire } from "./compile-ts.mjs";

const [games, data, parser] = compileForRequire([
  "lib/games.ts",
  "lib/game-data.ts",
  "lib/army-lists/fallback-parser.ts",
]);
assert.equal(games.GAMES["the-old-world"].universeKey, "warhammer");
assert.equal(games.GAMES["the-old-world"].realmKey, "the-old-world");
assert.equal(games.GAMES["the-old-world"].name, "Warhammer: The Old World");

assert.equal(data.OLD_WORLD_FACTIONS.length, 16);
assert.ok(data.OLD_WORLD_FACTIONS.some((faction) => faction.name === "Chaos Dwarfs" && faction.supportStatus === "legacy"));
assert.ok(data.OLD_WORLD_FACTIONS.every((faction) => faction.gameKey === "the-old-world"));

const source = `The Lantern Host\nFaction: Dwarfen Mountain Holds\nTotal: 2,000 pts\nCharacters\nRunesmith - 95 pts\nA handwritten oath of iron\nCore\n20 Dwarf Warriors - 210 pts\nSpecial\n2x Field Engines (240 pts)\nRare\nUnfamiliar Clockwork Ram`;
const parsed = parser.parseArmyListDeterministically({
  rawText: source,
  gameSystem: "Warhammer: The Old World",
});
assert.equal(parsed.game_system, "Warhammer: The Old World", "explicit selection must win over inference");
assert.equal(parsed.points_total, 2000);
assert.ok(parsed.units.some((unit) => unit.section === "Characters" && unit.name === "Runesmith"));
assert.ok(parsed.units.some((unit) => unit.name === "Dwarf Warriors" && unit.quantity === 20 && unit.points === 210));
assert.ok(parsed.units.some((unit) => unit.raw_text === "Unfamiliar Clockwork Ram" && unit.unverified));
assert.ok(parsed.warnings.some((warning) => /preserved/i.test(warning)));
assert.equal(source.includes("A handwritten oath of iron"), true, "source text remains available verbatim");

console.log("Old World registry, factions, conservative import, headings, quantities, warnings and source preservation passed");
