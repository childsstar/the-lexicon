import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parser = readFileSync(new URL("../lib/army-lists/parser.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260704010000_create_army_lists.sql", import.meta.url), "utf8");
const types = readFileSync(new URL("../lib/army-lists/types.ts", import.meta.url), "utf8");
const fallback = readFileSync(new URL("../lib/army-lists/fallback-parser.ts", import.meta.url), "utf8");
const muster = readFileSync(new URL("../app/(app)/armies/muster/muster-army-client.tsx", import.meta.url), "utf8");

for (const field of [
  "game_system",
  "faction",
  "subfaction",
  "points_total",
  "units",
  "inferred_playstyle_tags",
  "confidence",
  "warnings",
]) {
  assert.match(parser, new RegExp(field), `parser schema should include ${field}`);
}

assert.match(types, /export type ArmyListParser =/, "parser should expose a clean service abstraction");
assert.match(fallback, /parseArmyListDeterministically/, "parser should include deterministic fallback parsing");
assert.match(parser, /AI parser unavailable or failed/, "fallback should warn when AI parsing is unavailable");
assert.match(route, /Paste an army list before importing\./, "route should validate empty input");
assert.match(route, /parserStatus = "failed"/, "route should persist failed parser state");
assert.match(route, /userData\.user\.id/, "route should scope imports to the authenticated user");
assert.match(route, /profile_id/, "route should support profile ownership scoping");
assert.match(migration, /enable row level security/i, "army_lists should enforce RLS");
assert.match(migration, /Users can read their own army lists/, "army_lists should be owner scoped");

for (const label of ["Army name", "Game system", "Faction", "Roster text", "Import army list"]) {
  assert.match(muster, new RegExp(label), `muster importer should render ${label}`);
}
assert.match(muster, /Paste a plain-text roster before importing\./, "muster importer should validate empty roster text");
assert.match(muster, /fetch\("\/api\/army-lists"/, "muster importer should save signed-in imports through the API");
assert.match(muster, /parseArmyListDeterministically/, "muster importer should fall back to prototype parsing");
assert.match(muster, /Parsed summary/, "muster importer should render parsed summary state");
assert.match(muster, /Raw pasted text/, "muster importer should expose collapsible raw text");

console.log("Army list parser/import validation passed");
