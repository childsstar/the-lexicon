import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { approvedVenueSeeds } from "@/lib/maintenance/venue-seeds";
import { isMaintenanceTokenValid, runVenueMaintenance, type MaintenanceStore, type RunResult, type StateCoverage } from "@/lib/maintenance/venue-refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server maintenance database configuration is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function createStore(db: SupabaseClient): MaintenanceStore {
  return {
    async begin(taskName) {
      const { data, error } = await db.rpc("begin_venue_maintenance", { requested_task_name: taskName });
      if (error) throw error;
      const row = data?.[0];
      return row ? { runId: row.run_id, selectedState: row.selected_state, mode: row.run_mode } : null;
    },
    async health() {
      const { data: venues, error, count } = await db.from("venues").select("id,region_code,country_code,last_seen_at,latitude,longitude,canonical_source,source_of_truth,venue_external_sources(source_id)", { count: "exact" }).limit(10000);
      if (error) throw error;
      const coverageByState = new Map<string, StateCoverage>();
      let missingCoordinates = 0;
      for (const venue of venues ?? []) {
        const seeded = venue.country_code === "US" && venue.region_code && venue.canonical_source === "import" && venue.source_of_truth === "import" && Array.isArray(venue.venue_external_sources) && venue.venue_external_sources.some((source: { source_id: string | null }) => source.source_id);
        if (seeded) {
          const current = coverageByState.get(venue.region_code) ?? { state: venue.region_code, venueCount: 0, lastSeenAt: null };
          current.venueCount++;
          if (!current.lastSeenAt || (venue.last_seen_at && venue.last_seen_at < current.lastSeenAt)) current.lastSeenAt = venue.last_seen_at;
          coverageByState.set(venue.region_code, current);
        }
        if (venue.latitude == null || venue.longitude == null) missingCoordinates++;
      }
      return { venueCount: count ?? venues?.length ?? 0, missingCoordinates, coverage: [...coverageByState.values()] };
    },
    async findBySource(source, sourceId) {
      const { data, error } = await db.from("venue_external_sources").select("venue_id,venues(*)").eq("source", source).eq("source_id", sourceId).maybeSingle();
      if (error) throw error;
      const venue = data?.venues;
      return venue && !Array.isArray(venue) ? venue as never : null;
    },
    async createVenue(venue, source) {
      const { data, error } = await db.rpc("upsert_maintenance_venue", { venue_data: venue, source_data: source });
      if (error) throw error;
      return data as string;
    },
    async updateVenue(id, patch, source) {
      const { error } = await db.rpc("upsert_maintenance_venue", { venue_data: { ...patch, id }, source_data: source });
      if (error) throw error;
    },
    async finish(runId, result: RunResult) {
      const { error } = await db.rpc("finish_venue_maintenance", {
        requested_run_id: runId, run_status: result.status, checked_count: result.recordsChecked,
        created_count: result.recordsCreated, updated_count: result.recordsUpdated, rejected_count: result.recordsRejected,
        failure_message: result.errorMessage ?? null,
      });
      if (error) throw error;
    },
  };
}

export async function POST(request: Request) {
  if (!isMaintenanceTokenValid(request.headers.get("authorization"), process.env.MAINTENANCE_TOKEN)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: { "cache-control": "no-store" } });
  }
  try {
    const result = await runVenueMaintenance(createStore(adminClient()), approvedVenueSeeds);
    return NextResponse.json({ ok: true, ...result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("already active") ? error.message : "Venue maintenance failed; inspect server logs.";
    console.error("[maintenance/venue-refresh]", error instanceof Error ? error.message : "unknown failure");
    return NextResponse.json({ ok: false, error: message }, { status: error instanceof Error && error.message.includes("already active") ? 409 : 503, headers: { "cache-control": "no-store" } });
  }
}
