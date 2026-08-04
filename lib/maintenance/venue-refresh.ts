import { timingSafeEqual } from "node:crypto";

import { mapSeedRowToVenueInsert, validateVenueSeedRow, type NormalizedVenueSeedRow, type VenueSeedRow } from "../venues/import";
import type { Venue } from "../venues";

export const SUPPORTED_US_REGIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC",
  "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

// NY is first because it is the only state with an approved, checked-in source
// batch today. The remaining geography is deterministic and alphabetical.
export const VENUE_STATE_PRIORITY = ["NY", ...SUPPORTED_US_REGIONS.filter((state) => state !== "NY")];
export const MAINTENANCE_TASK = "venue_state_seed";
export const MAX_VENUES_PER_RUN = 8;

export type RunMode = "initial_seed" | "refresh";
export type StateCoverage = { state: string; venueCount: number; lastSeenAt: string | null };

export function isMaintenanceTokenValid(header: string | null, expected: string | undefined): boolean {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match || !expected || expected.length < 16) return false;
  const supplied = Buffer.from(match[1], "utf8");
  const configured = Buffer.from(expected, "utf8");
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

export function selectMaintenanceState(coverage: StateCoverage[]): { state: string; mode: RunMode } {
  const byState = new Map(coverage.map((item) => [item.state, item]));
  const unseeded = VENUE_STATE_PRIORITY.find((state) => !byState.has(state) || byState.get(state)!.venueCount < 1);
  if (unseeded) return { state: unseeded, mode: "initial_seed" };
  const selected = [...coverage]
    .filter((item) => SUPPORTED_US_REGIONS.includes(item.state as (typeof SUPPORTED_US_REGIONS)[number]))
    .sort((a, b) => a.venueCount - b.venueCount || (a.lastSeenAt ?? "").localeCompare(b.lastSeenAt ?? "") || a.state.localeCompare(b.state))[0];
  return { state: selected?.state ?? VENUE_STATE_PRIORITY[0], mode: "refresh" };
}

export function safeVenuePatch(row: NormalizedVenueSeedRow, venue: Partial<Venue>, now: string): Partial<Venue> {
  const incoming = mapSeedRowToVenueInsert(row);
  const patch: Partial<Venue> = { last_seen_at: now };
  const importOwned = venue.canonical_source === "import" && venue.source_of_truth === "import";
  const atLeastAsTrustworthy = row.confidence !== null && row.confidence >= (venue.confidence ?? 0);
  const fields: (keyof Venue)[] = ["city", "region_code", "country_code", "formatted_address", "latitude", "longitude", "website", "phone", "email", "discord_invite_url", "instagram_url", "facebook_url", "venue_categories", "supported_game_systems", "confidence", "source_payload"];
  for (const field of fields) {
    const value = incoming[field];
    const existing = venue[field];
    const hasIncoming = value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
    const isEmpty = existing === null || existing === undefined || existing === "" || (Array.isArray(existing) && existing.length === 0);
    const doesNotReduceArray = !Array.isArray(value) || !Array.isArray(existing) || value.length >= existing.length;
    if (hasIncoming && (isEmpty || (importOwned && atLeastAsTrustworthy && doesNotReduceArray))) Object.assign(patch, { [field]: value });
  }
  if (!venue.region && incoming.region) patch.region = incoming.region;
  return patch;
}

export type MaintenanceStore = {
  begin(taskName: string): Promise<{ runId: string; selectedState: string; mode: RunMode } | null>;
  health(): Promise<{ venueCount: number; missingCoordinates: number; coverage: StateCoverage[] }>;
  findBySource(source: string, sourceId: string): Promise<(Partial<Venue> & { id: string }) | null>;
  createVenue(venue: Record<string, unknown>, source: Record<string, unknown>): Promise<string>;
  updateVenue(id: string, patch: Partial<Venue>, source: Record<string, unknown>): Promise<void>;
  finish(runId: string, result: RunResult): Promise<void>;
};

export type RunResult = { status: "completed" | "failed"; selectedState: string; mode: RunMode; source: string; recordsChecked: number; recordsCreated: number; recordsUpdated: number; recordsRejected: number; errorMessage?: string };

export async function runVenueMaintenance(store: MaintenanceStore, seeds: VenueSeedRow[], now = new Date().toISOString()) {
  const claim = await store.begin(MAINTENANCE_TASK);
  if (!claim) throw new Error("A venue maintenance run is already active.");
  let result: RunResult = { status: "failed", selectedState: claim.selectedState, mode: claim.mode, source: "checked_in_official_websites", recordsChecked: 0, recordsCreated: 0, recordsUpdated: 0, recordsRejected: 0 };
  try {
    const health = await store.health();
    const selected = selectMaintenanceState(health.coverage);
    if (selected.state !== claim.selectedState || selected.mode !== claim.mode) throw new Error("Maintenance state claim is stale; retry the run.");
    const candidates = seeds.filter((seed) => String(seed.region_code).toUpperCase() === claim.selectedState).slice(0, MAX_VENUES_PER_RUN);
    for (const candidate of candidates) {
      result.recordsChecked++;
      const validation = validateVenueSeedRow(candidate);
      if (!validation.ok || validation.row.region_code !== claim.selectedState || validation.row.country_code !== "US" || validation.row.latitude === null || validation.row.longitude === null || Math.abs(validation.row.latitude) > 90 || Math.abs(validation.row.longitude) > 180 || !validation.row.source || !validation.row.source_id) {
        result.recordsRejected++;
        continue;
      }
      const row = validation.row;
      const existing = await store.findBySource(row.source!, row.source_id!);
      const source = { source: row.source, source_id: row.source_id, source_url: row.source_url, external_name: row.name, external_payload: row.external_payload, confidence: row.confidence, last_seen_at: now };
      if (existing) {
        await store.updateVenue(existing.id, safeVenuePatch(row, existing, now), source);
        result.recordsUpdated++;
      } else {
        await store.createVenue({ ...mapSeedRowToVenueInsert(row), last_seen_at: now }, source);
        result.recordsCreated++;
      }
    }
    result.status = "completed";
    await store.finish(claim.runId, result);
    return { ...result, venueCount: health.venueCount, missingCoordinates: health.missingCoordinates };
  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message.slice(0, 500) : "Unknown maintenance failure";
    await store.finish(claim.runId, result).catch(() => undefined);
    throw error;
  }
}
