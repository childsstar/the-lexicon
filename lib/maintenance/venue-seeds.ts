import nySeeds from "@/scripts/fixtures/venues_nyc_seed.json";
import type { VenueSeedRow } from "@/lib/venues/import";

/** Approved records assembled from the venues' official websites; see docs/venue_seed_format.md. */
export const approvedVenueSeeds = nySeeds as VenueSeedRow[];
