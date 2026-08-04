import assert from "node:assert/strict";
import { compileForRequire } from "./compile-ts.mjs";

const [maintenance] = compileForRequire(["lib/maintenance/venue-refresh.ts"]);
const token = "a-production-sized-maintenance-token";
assert.equal(maintenance.isMaintenanceTokenValid(`Bearer ${token}`, token), true);
assert.equal(maintenance.isMaintenanceTokenValid(null, token), false);
assert.equal(maintenance.isMaintenanceTokenValid("Bearer wrong", token), false);

const onlyNy = [{ state: "NY", venueCount: 1, lastSeenAt: "2026-01-01" }];
assert.deepEqual(maintenance.selectMaintenanceState([]), { state: "NY", mode: "initial_seed" });
assert.deepEqual(maintenance.selectMaintenanceState(onlyNy), { state: "AL", mode: "initial_seed" });
const fullCoverage = maintenance.SUPPORTED_US_REGIONS.map((state) => ({ state, venueCount: state === "AK" ? 1 : 2, lastSeenAt: state === "AK" ? "2025-01-01" : "2026-01-01" }));
assert.deepEqual(maintenance.selectMaintenanceState(fullCoverage), { state: "AK", mode: "refresh" });

const seed = { name: "Real Games", venue_type: "game_store", city: "Albany", region_code: "NY", country_code: "US", latitude: 42.65, longitude: -73.75, website: "https://real.example", source: "official_website", source_id: "real-games" };
function fakeStore({ existing = null, failHealth = false, active = false } = {}) {
  const calls = { creates: [], updates: [], finishes: [] };
  return { calls, store: {
    async begin() { return active ? null : { runId: "run-1", selectedState: "NY", mode: "initial_seed" }; },
    async health() { if (failHealth) throw new Error("database offline"); return { venueCount: existing ? 1 : 0, missingCoordinates: 0, coverage: [] }; },
    async findBySource() { return existing; },
    async createVenue(venue, source) { calls.creates.push({ venue, source }); return "venue-1"; },
    async updateVenue(id, patch, source) { calls.updates.push({ id, patch, source }); },
    async finish(id, result) { calls.finishes.push({ id, result }); },
  }};
}

const first = fakeStore();
const success = await maintenance.runVenueMaintenance(first.store, [seed]);
assert.equal(success.recordsCreated, 1, "successful DB health check proceeds to import");
assert.equal(first.calls.finishes[0].result.status, "completed", "run is logged");

const curated = { id: "venue-1", name: "Curated Name", website: "https://curated.example", canonical_source: "claimed", source_of_truth: "claimed" };
const rerun = fakeStore({ existing: curated });
await maintenance.runVenueMaintenance(rerun.store, [{ ...seed, website: "" }]);
assert.equal(rerun.calls.creates.length, 0, "stable source rerun creates no duplicate");
assert.equal(rerun.calls.updates.length, 1);
assert.equal(rerun.calls.updates[0].patch.website, undefined, "blank source does not erase curated fields");
assert.equal(rerun.calls.updates[0].patch.name, undefined, "manual name remains untouched");
const lowerQuality = maintenance.safeVenuePatch({ ...maintenanceInput(seed), confidence: 0.5, website: "https://lower.example" }, { canonical_source: "import", source_of_truth: "import", confidence: 0.9, website: "https://better.example" }, new Date().toISOString());
assert.equal(lowerQuality.website, undefined, "lower-confidence source cannot replace better imported data");

const capped = fakeStore();
await maintenance.runVenueMaintenance(capped.store, Array.from({ length: 12 }, (_, index) => ({ ...seed, source_id: `venue-${index}` })));
assert.equal(capped.calls.creates.length, 8, "one run is capped at eight records in one state");

const empty = fakeStore();
await maintenance.runVenueMaintenance(empty.store, []);
assert.equal(empty.calls.creates.length, 0);
assert.equal(empty.calls.finishes[0].result.recordsCreated, 0, "empty import does not manufacture state coverage");

const failed = fakeStore({ failHealth: true });
await assert.rejects(() => maintenance.runVenueMaintenance(failed.store, [seed]), /database offline/);
assert.equal(failed.calls.finishes[0].result.status, "failed", "failure is logged and rethrown for non-2xx response");
const overlap = fakeStore({ active: true });
await assert.rejects(() => maintenance.runVenueMaintenance(overlap.store, [seed]), /already active/, "concurrent claim is rejected");

console.log("Venue maintenance validation passed.");

function maintenanceInput(value) {
  return {
    ...value, city: value.city ?? null, region_code: value.region_code ?? null, country_code: value.country_code ?? null,
    formatted_address: value.formatted_address ?? null, latitude: value.latitude ?? null, longitude: value.longitude ?? null,
    website: value.website ?? null, phone: null, email: null, discord_invite_url: null, instagram_url: null, facebook_url: null,
    venue_categories: [], supported_game_systems: [], source: value.source ?? null, source_id: value.source_id ?? null,
    source_url: null, confidence: value.confidence ?? null, external_payload: null,
  };
}
