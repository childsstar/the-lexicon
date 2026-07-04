export type Venue = {
  id: string;
  created_by: string | null;
  name: string;
  venue_type: string;
  website: string | null;
  region: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const VENUE_TYPES = [
  { value: "game_store", label: "Game store" },
  { value: "club", label: "Club" },
  { value: "event_space", label: "Event space" },
  { value: "private", label: "Private table" },
] as const;

export function venueTypeLabel(value: string): string {
  return VENUE_TYPES.find((t) => t.value === value)?.label ?? value;
}

/**
 * v1 locality matching: token overlap between a profile's home_locations
 * and a venue's region — "Brooklyn, NY 11201" matches a venue in
 * "Brooklyn, NY". Place names (3+ chars) and 5-digit ZIPs count; 2-letter
 * state codes are ignored as too broad.
 *
 * TODO(geo): replace with real geocoding + radius search (venues need
 * lat/lng; home_locations geocoded on save) once a geocoding key exists.
 */
export function locationTokens(locations: string[] | null | undefined): string[] {
  return (locations ?? [])
    .flatMap((loc) => loc.toLowerCase().split(/[^a-z0-9]+/))
    .filter((t) => t.length >= 3 || /^\d{5}$/.test(t));
}

export function venueIsNearby(venue: Venue, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const hay = (venue.region ?? "").toLowerCase();
  return tokens.some((t) => hay.includes(t));
}

/** Friendly errors for the venues table, mirroring lib/profiles.ts. */
export function friendlyVenueError(error: {
  code?: string;
  message: string;
}): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "The venues table doesn't exist yet. Run supabase/schema_v0_1.sql in the Supabase SQL editor, then try again.";
    default:
      return error.message;
  }
}
