import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parser = readFileSync(new URL("../lib/army-lists/parser.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260704010000_create_army_lists.sql", import.meta.url), "utf8");
const identityMigration = readFileSync(new URL("../supabase/migrations/20260706020000_army_identity_and_matchups.sql", import.meta.url), "utf8");
const types = readFileSync(new URL("../lib/army-lists/types.ts", import.meta.url), "utf8");
const fallback = readFileSync(new URL("../lib/army-lists/fallback-parser.ts", import.meta.url), "utf8");
const muster = readFileSync(new URL("../app/(app)/armies/muster/muster-army-client.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../app/(app)/armies/[id]/army-detail-client.tsx", import.meta.url), "utf8");
const tacticalPanel = readFileSync(new URL("../components/tactical-overview-panel.tsx", import.meta.url), "utf8");

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
assert.match(route, /Paste a roster before mustering this army\./, "route should validate empty input");
assert.match(route, /parserStatus = "failed"/, "route should persist failed parser state");
assert.match(route, /user_id: user\.id/, "route should scope imports to the authenticated user");
assert.match(route, /profile_id/, "route should support profile ownership scoping");
assert.match(migration, /enable row level security/i, "army_lists should enforce RLS");
assert.match(migration, /Users can read their own army lists/, "army_lists should be owner scoped");

// Part 3 — army identity fields must exist as real columns, not just
// buried inside parsed_json, so the army index/cards can query them.
for (const column of [
  "subfaction",
  "datasheet_count",
  "model_count",
  "detachment_names",
  "detachment_points",
  "playstyle_tags",
  "tactical_summary",
  "visibility",
  "locked_at",
  "visual_identity_json",
]) {
  assert.match(identityMigration, new RegExp(column), `army_lists should gain a ${column} column`);
}
assert.match(identityMigration, /create table if not exists public\.army_matchups/, "sealed matchup foundation table should exist");
assert.match(identityMigration, /enable row level security/i, "army_matchups should enforce RLS");

for (const label of ["Army name", "Game system", "Faction", "Roster text", "Muster this army"]) {
  assert.match(muster, new RegExp(label), `muster client should render ${label}`);
}
assert.match(muster, /Paste a plain-text roster before mustering this army\./, "muster client should validate empty roster text");
assert.match(muster, /fetch\("\/api\/army-lists"/, "muster client should save signed-in imports through the API");
assert.match(muster, /router\.push\(`\/armies\/\$\{payload\.armyList\.id\}`\)/, "a successful muster should route to the new army's detail page");

// The post-import overview now lives on the army detail page.
assert.match(detail, /TacticalOverviewPanel/, "army detail page should render the shared tactical overview panel");
assert.match(tacticalPanel, /What this army can field/, "tactical overview panel should explain what the army can field");
assert.match(detail, /Raw pasted text/, "army detail page should expose collapsible raw text");
assert.match(detail, /ArmySigil/, "army detail page should render the army's visual identity");

console.log("Army list parser/import validation passed");
