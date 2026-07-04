import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parser = readFileSync(new URL("../lib/army-lists/parser.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260704010000_create_army_lists.sql", import.meta.url), "utf8");

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

assert.match(route, /Paste an army list before importing\./, "route should validate empty input");
assert.match(route, /parserStatus = "failed"/, "route should persist failed parser state");
assert.match(route, /userData\.user\.id/, "route should scope imports to the authenticated user");
assert.match(migration, /enable row level security/i, "army_lists should enforce RLS");
assert.match(migration, /Users can read their own army lists/, "army_lists should be owner scoped");

console.log("Army list parser/import validation passed");
