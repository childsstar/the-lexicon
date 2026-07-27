import assert from "node:assert/strict";
import { compileForRequire } from "./compile-ts.mjs";
import { readFileSync } from "node:fs";

const [games, data, parser, importUtils] = compileForRequire([
  "lib/games.ts",
  "lib/game-data.ts",
  "lib/army-lists/fallback-parser.ts",
  "lib/army-lists/import-utils.ts",
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

const crossroadsBrewers = `===
The crossroads brewers [749 pts]
Warhammer: The Old World, Dwarfen Mountain Holds, Expeditionary Force, Battle March
===

++ Characters [249 pts] ++

Runesmith [65 pts]
- Hand weapon
- Heavy armour

Daemon Slayer [134 pts]
- Hand weapon
- Great weapon

Engineer [50 pts]
- Hand weapon
- Heavy armour
- General

++ Core Units [405 pts] ++

15 Dwarf Warriors [165 pts]
- Hand weapons
- Heavy armour
- Great weapons
- Drilled
- Veteran (champion)
- Standard bearer
- Musician

10 Thunderers [100 pts]
- Hand weapons
- Handguns
- Heavy armour

15 Dwarf Warriors [140 pts]
- Hand weapons
- Heavy armour
- Shields
- Veteran (champion)

++ Special Units [95 pts] ++

Cannon [95 pts]
- Cannon
- Hand weapons
- Light armour

---
Created with "Old World Builder"`;
const crossroads = parser.parseArmyListDeterministically({ rawText: crossroadsBrewers });
assert.equal(crossroads.roster_name, "The crossroads brewers");
assert.equal(crossroads.game_system, "Warhammer: The Old World");
assert.equal(games.findGameByName(crossroads.game_system)?.key, "the-old-world");
assert.equal(crossroads.faction, "Dwarfen Mountain Holds");
assert.equal(crossroads.points_total, 749);
assert.equal(crossroads.units.length, 7);
assert.deepEqual([...new Set(crossroads.units.map((unit) => unit.section))], ["Characters", "Core Units", "Special Units"]);
assert.equal(crossroads.units.find((unit) => unit.name === "Dwarf Warriors")?.quantity, 15);
assert.ok(crossroads.units.find((unit) => unit.name === "Engineer")?.wargear.includes("General"));

const manual = parser.parseArmyListDeterministically({ rawText: crossroadsBrewers, gameSystem: "Warhammer 40,000" });
assert.equal(manual.game_system, "Warhammer 40,000", "manual selection has precedence over roster inference");
assert.equal(importUtils.detectRosterGame(crossroadsBrewers)?.key, "the-old-world");
assert.equal(importUtils.detectRosterGame("Warhammer 40,000\nDeath Guard")?.key, "warhammer-40k");
assert.equal(importUtils.detectRosterGame("Warhammer: Age of Sigmar\nStormcast Eternals")?.key, "age-of-sigmar");
assert.equal(importUtils.isArmyListSchemaError({ code: "PGRST204", message: "Could not find game_key in schema cache" }), true);
assert.doesNotMatch(importUtils.ARMY_IMPORT_ERROR, /schema cache|game_key|Supabase/i, "database details must not reach users");

const repairMigration = readFileSync(new URL("../supabase/migrations/20260727000000_ensure_army_lists_game_key.sql", import.meta.url), "utf8");
const databaseTypes = readFileSync(new URL("../supabase/database.types.ts", import.meta.url), "utf8");
assert.match(repairMigration, /add column if not exists game_key text/i);
assert.match(repairMigration, /where game_key is null/i, "backfill must preserve existing values");
assert.match(repairMigration, /parsed_json->>'game_system'.*raw_text/s, "backfill should inspect parser metadata and source text");
assert.match(repairMigration, /army_lists_game_key_check/);
assert.match(repairMigration, /army_lists_user_game_idx/);
assert.match(repairMigration, /notify pgrst, 'reload schema'/i);
assert.match(databaseTypes, /game_key: string \| null/, "generated Supabase snapshot must expose game_key");

console.log("Old World exact import, game precedence, legacy systems, safe errors, headings, quantities and source preservation passed");
