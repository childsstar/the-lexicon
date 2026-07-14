import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";

const source = readFileSync(new URL("../lib/matchups/reveal.ts", import.meta.url), "utf8")
  .replace(/^import type .*\n/gm, "");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const dir = mkdtempSync(join(tmpdir(), "lexicon-matchup-"));
const modulePath = join(dir, "reveal.cjs");
writeFileSync(modulePath, js);
const { computeMatchupStatus, buildMatchupView, buildArmyOverviewSnapshot } = await import(modulePath);

// --- computeMatchupStatus ------------------------------------------------
assert.equal(computeMatchupStatus({ creator_locked_at: null, opponent_locked_at: null, status: "pending" }), "pending");
assert.equal(computeMatchupStatus({ creator_locked_at: "2026-01-01T00:00:00Z", opponent_locked_at: null, status: "pending" }), "one_locked");
assert.equal(computeMatchupStatus({ creator_locked_at: "2026-01-01T00:00:00Z", opponent_locked_at: "2026-01-02T00:00:00Z", status: "one_locked" }), "revealed");
assert.equal(computeMatchupStatus({ creator_locked_at: null, opponent_locked_at: null, status: "cancelled" }), "cancelled");

// --- buildMatchupView: the core fairness guarantee -----------------------
const creatorSnapshot = { army_id: "army-creator", name: "The Gilded Crusade", units: [] };
const opponentSnapshot = { army_id: "army-opponent", name: "Brood of the Deep", units: [] };

const oneLockedRow = {
  id: "matchup-1",
  creator_user_id: "user-a",
  opponent_user_id: "user-b",
  creator_army_id: "army-creator",
  opponent_army_id: "army-opponent",
  creator_locked_at: "2026-01-01T00:00:00Z",
  opponent_locked_at: null,
  // Both snapshot columns already hold data (as they would once each side
  // has ever locked+relocked, or simply been written by the DB layer) —
  // buildMatchupView must still hide the opponent's until *both* lock.
  creator_snapshot: creatorSnapshot,
  opponent_snapshot: opponentSnapshot,
  revealed_at: null,
  status: "one_locked",
  invite_code: "abc123",
};

const viewAsCreatorBeforeReveal = buildMatchupView(oneLockedRow, "user-a", null);
assert.equal(viewAsCreatorBeforeReveal.status, "one_locked");
assert.equal(viewAsCreatorBeforeReveal.selfLocked, true);
assert.equal(viewAsCreatorBeforeReveal.opponentLocked, false);
assert.equal(viewAsCreatorBeforeReveal.revealed, false);
assert.deepEqual(viewAsCreatorBeforeReveal.self, creatorSnapshot, "a locked user should see their own locked snapshot");
assert.equal(viewAsCreatorBeforeReveal.opponent, null, "opponent overview must be hidden before both sides lock");

const viewAsOpponentBeforeReveal = buildMatchupView(oneLockedRow, "user-b", { army_id: "army-opponent", name: "live preview" });
assert.equal(viewAsOpponentBeforeReveal.selfLocked, false);
assert.equal(viewAsOpponentBeforeReveal.opponentLocked, true);
assert.deepEqual(viewAsOpponentBeforeReveal.self, { army_id: "army-opponent", name: "live preview" }, "an unlocked user should see their own live army, not a stale snapshot");
assert.equal(viewAsOpponentBeforeReveal.opponent, null, "the not-yet-locked side must not see the opponent overview either");

const bothLockedRow = { ...oneLockedRow, opponent_locked_at: "2026-01-02T00:00:00Z", status: "revealed", revealed_at: "2026-01-02T00:00:00Z" };
const viewAsCreatorRevealed = buildMatchupView(bothLockedRow, "user-a", null);
assert.equal(viewAsCreatorRevealed.revealed, true);
assert.deepEqual(viewAsCreatorRevealed.self, creatorSnapshot);
assert.deepEqual(viewAsCreatorRevealed.opponent, opponentSnapshot, "once both lock, each side should see the other's overview");

const viewAsOpponentRevealed = buildMatchupView(bothLockedRow, "user-b", null);
assert.deepEqual(viewAsOpponentRevealed.self, opponentSnapshot);
assert.deepEqual(viewAsOpponentRevealed.opponent, creatorSnapshot);

// --- buildArmyOverviewSnapshot: what actually gets frozen into a lock ----
const snapshot = buildArmyOverviewSnapshot({
  id: "army-1",
  name: null,
  game_system: "Warhammer 40,000",
  faction: "Death Guard",
  subfaction: "Contagion Engines",
  points_total: 2000,
  datasheet_count: 13,
  detachment_names: ["Contagion Engines"],
  playstyle_tags: ["melee pressure"],
  tactical_summary: { broad_role: "test" },
  visual_identity_json: { motif: "Plague skull" },
  parsed_json: { units: [{ name: "Mortarion", points: 400, quantity: 1, role: "Character" }] },
});
assert.equal(snapshot.name, "Untitled army", "a snapshot should still have a readable name even if the source army has none");
assert.equal(snapshot.units.length, 1);
assert.equal(snapshot.units[0].name, "Mortarion");
assert.ok(snapshot.snapshotted_at, "snapshots should record when they were taken");

// --- Immutability / RLS guardrails, checked at the source level ---------
const lockRoute = readFileSync(new URL("../app/api/matchups/[id]/lock/route.ts", import.meta.url), "utf8");
assert.match(lockRoute, /already locked/i, "locking an already-locked side should be rejected");
assert.match(lockRoute, /buildArmyOverviewSnapshot/, "locking should snapshot the army rather than reference it live");
assert.match(lockRoute, /status: 409/, "re-locking should fail with a conflict, not silently overwrite the snapshot");

const migration = readFileSync(new URL("../supabase/migrations/20260706020000_army_identity_and_matchups.sql", import.meta.url), "utf8");
for (const column of ["creator_locked_at", "opponent_locked_at", "creator_snapshot", "opponent_snapshot", "revealed_at", "invite_code"]) {
  assert.match(migration, new RegExp(column), `army_matchups should have a ${column} column`);
}
assert.match(migration, /check \(status in \('pending', 'one_locked', 'revealed', 'cancelled'\)\)/, "matchup status should be constrained to the documented lifecycle");
assert.match(migration, /Participants can read their own matchups/, "matchups should be readable only by their participants");

// --- Join + cancel live behind SECURITY DEFINER functions -----------------
const joinMigration = readFileSync(new URL("../supabase/migrations/20260714010000_matchup_join_rpc_and_cancel.sql", import.meta.url), "utf8");
assert.match(joinMigration, /drop policy if exists "An invited opponent can join by user id"/, "the open join-by-update policy must be dropped — it let any authenticated user claim open matchups without knowing a code");
assert.match(joinMigration, /create or replace function public\.join_matchup_by_code/, "joining should be owned by a join_matchup_by_code function");
assert.match(joinMigration, /create or replace function public\.cancel_matchup/, "cancellation should be owned by a cancel_matchup function");
assert.match(joinMigration, /security definer/, "both functions must be SECURITY DEFINER so the code lookup and cross-user army unlock work under RLS");
assert.match(joinMigration, /grant execute on function public\.join_matchup_by_code\(text\) to authenticated/, "join must be callable by authenticated users");

const joinRoute = readFileSync(new URL("../app/api/matchups/join/route.ts", import.meta.url), "utf8");
assert.match(joinRoute, /rpc\("join_matchup_by_code"/, "the join route must go through the code-scoped RPC, not a raw table update");
assert.ok(!joinRoute.includes(".update("), "the join route should no longer update army_matchups directly");

// --- The matchup list must not leak the opponent's army name pre-reveal ---
const listRoute = readFileSync(new URL("../app/api/matchups/route.ts", import.meta.url), "utf8");
assert.match(listRoute, /opponentArmyName: status === "revealed"/, "the opponent's army name must stay sealed until the matchup is revealed");

console.log("Matchup lock/reveal validation passed");
