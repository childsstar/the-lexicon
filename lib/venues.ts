import type { SupabaseClient } from "@supabase/supabase-js";

export type Venue = {
  id: string;
  created_by: string | null;
  name: string;
  venue_type: string;
  website: string | null;
  region: string | null;
  description: string | null;
  slug: string | null;
  status: VenueStatus;
  visibility: VenueVisibility;
  canonical_source: VenueCanonicalSource;
  source_of_truth: VenueCanonicalSource;
  confidence: number | null;
  verified_at: string | null;
  last_seen_at: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region_code: string | null;
  postal_code: string | null;
  country_code: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  geocoded_at: string | null;
  geocoding_source: string | null;
  geocoding_confidence: number | null;
  phone: string | null;
  email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  discord_server_id: string | null;
  discord_invite_url: string | null;
  claimed_at: string | null;
  claimed_by: string | null;
  owner_notes: string | null;
  venue_categories: string[];
  supported_game_systems: string[];
  has_tables: boolean | null;
  has_retail: boolean | null;
  has_events: boolean | null;
  import_batch_id: string | null;
  source_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type VenueExternalSource = {
  id: string;
  venue_id: string;
  source: string;
  source_id: string | null;
  source_url: string | null;
  external_name: string | null;
  external_payload: Record<string, unknown> | null;
  confidence: number | null;
  verified_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export const VENUE_STATUSES = ["active", "inactive", "closed", "pending"] as const;
export type VenueStatus = (typeof VENUE_STATUSES)[number] | (string & {});

export const VENUE_VISIBILITIES = ["public", "unlisted", "private"] as const;
export type VenueVisibility = (typeof VENUE_VISIBILITIES)[number] | (string & {});

export const VENUE_CANONICAL_SOURCES = ["lexicon", "import", "community", "claimed"] as const;
export type VenueCanonicalSource =
  | (typeof VENUE_CANONICAL_SOURCES)[number]
  | (string & {});

export const VENUE_TYPES = [
  { value: "game_store", label: "Game Shop" },
  { value: "warhammer_store", label: "Warhammer Store" },
  { value: "board_game_cafe", label: "Board Game Café" },
  { value: "community_gathering_space", label: "Community Gathering Space" },
  { value: "library", label: "Library" },
  { value: "cafe_restaurant", label: "Café / Restaurant" },
  { value: "brewery_pub", label: "Brewery / Pub" },
  { value: "event_space", label: "Event Space" },
  { value: "convention_center", label: "Convention Center" },
  { value: "community_center", label: "Community Center" },
  { value: "club", label: "Club / Private Venue" },
  { value: "private", label: "Private Table" },
  { value: "hobby_maker_space", label: "Hobby / Maker Space" },
  { value: "other", label: "Other" },
] as const;

export const VENUE_CATEGORIES = [
  { value: "retail", label: "Retail" },
  { value: "gaming_club", label: "Gaming club" },
  { value: "tournament_venue", label: "Tournament venue" },
  { value: "community_space", label: "Community space" },
] as const;

export function venueTypeLabel(value: string | null | undefined): string {
  if (!value) return "Uncharted Venue";
  return VENUE_TYPES.find((t) => t.value === value)?.label ?? value.replaceAll("_", " ");
}

/**
 * The Venues page shows only these six primary filters (instead of every
 * raw venue_type). Each one is a presentation-layer view over the richer
 * venue_type / venue_categories / supported_game_systems metadata below.
 */
export const PRIMARY_VENUE_FILTERS = [
  { value: "game_shops", label: "Game Shops" },
  { value: "warhammer", label: "Warhammer" },
  { value: "board_game_cafes", label: "Board Game Cafés" },
  { value: "community_spaces", label: "Community Spaces" },
  { value: "private_tables", label: "Private Tables" },
] as const;

export type PrimaryVenueFilterValue = (typeof PRIMARY_VENUE_FILTERS)[number]["value"];

const GAME_SHOP_VENUE_TYPES: readonly string[] = ["game_store"];
const GAME_SHOP_CATEGORIES: readonly string[] = ["game_shop", "hobby_shop", "retail", "flgs", "warhammer_store"];

const WARHAMMER_VENUE_TYPES: readonly string[] = ["warhammer_store"];
const WARHAMMER_CATEGORIES: readonly string[] = ["warhammer_store"];
const WARHAMMER_GAME_SYSTEMS: readonly string[] = [
  "warhammer",
  "warhammer_40000",
  "age_of_sigmar",
  "horus_heresy",
  "the_old_world",
];

const BOARD_GAME_CAFE_VENUE_TYPES: readonly string[] = ["board_game_cafe", "cafe_restaurant"];
const BOARD_GAME_CAFE_CATEGORIES: readonly string[] = ["board_game_cafe", "cafe", "restaurant"];

const COMMUNITY_SPACE_VENUE_TYPES: readonly string[] = [
  "library",
  "community_gathering_space",
  "community_center",
  "event_space",
  "convention_center",
  "brewery_pub",
  "hobby_maker_space",
];
// "community_space" is included alongside the named categories below so
// venues tagged generically (e.g. via backfill) still surface here.
const COMMUNITY_SPACE_CATEGORIES: readonly string[] = [
  "library",
  "community_center",
  "event_space",
  "convention_center",
  "brewery_pub",
  "hobby_maker_space",
  "community_space",
];

const PRIVATE_TABLE_VENUE_TYPES: readonly string[] = ["club", "private"];
const PRIVATE_TABLE_CATEGORIES: readonly string[] = ["club_private_venue", "private_table", "club"];

function includesAny(values: string[] | null | undefined, candidates: readonly string[]): boolean {
  if (!values || values.length === 0) return false;
  return values.some((value) => candidates.includes(value));
}

export function venueMatchesPrimaryFilter(venue: Venue, filter: PrimaryVenueFilterValue): boolean {
  switch (filter) {
    case "game_shops":
      return GAME_SHOP_VENUE_TYPES.includes(venue.venue_type) || includesAny(venue.venue_categories, GAME_SHOP_CATEGORIES);
    case "warhammer":
      return (
        WARHAMMER_VENUE_TYPES.includes(venue.venue_type) ||
        includesAny(venue.venue_categories, WARHAMMER_CATEGORIES) ||
        includesAny(venue.supported_game_systems, WARHAMMER_GAME_SYSTEMS)
      );
    case "board_game_cafes":
      return (
        BOARD_GAME_CAFE_VENUE_TYPES.includes(venue.venue_type) ||
        includesAny(venue.venue_categories, BOARD_GAME_CAFE_CATEGORIES)
      );
    case "community_spaces":
      return (
        COMMUNITY_SPACE_VENUE_TYPES.includes(venue.venue_type) ||
        includesAny(venue.venue_categories, COMMUNITY_SPACE_CATEGORIES)
      );
    case "private_tables":
      return (
        PRIVATE_TABLE_VENUE_TYPES.includes(venue.venue_type) ||
        includesAny(venue.venue_categories, PRIVATE_TABLE_CATEGORIES)
      );
    default:
      return false;
  }
}

export type Coordinates = { latitude: number; longitude: number };

export function distanceInMiles(a: Coordinates, b: Coordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 0.1) return "<0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

const DISCORD_INVITE_HOSTS = new Set(["discord.gg", "discord.com", "discordapp.com"]);

/**
 * Accepts discord.gg/<code>, discord.com/invite/<code>, and
 * discordapp.com/invite/<code> (protocol optional, defaults to https).
 */
export function isDiscordInviteUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!DISCORD_INVITE_HOSTS.has(host)) return false;
  if (host === "discord.gg") return parsed.pathname.replace(/\/+$/, "").length > 1;
  return /^\/invite\/[^/]+/i.test(parsed.pathname);
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

/**
 * City/state and ZIP suggestions drawn from existing venues, so the home
 * locations autocomplete points at real communities rather than requiring a
 * geocoding API (see the TODO on locationTokens above).
 */
export async function fetchLocationSuggestions(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("city, region_code, postal_code")
    .not("city", "is", null)
    .limit(2000);
  if (error || !data) return [];

  const suggestions = new Set<string>();
  for (const row of data as Pick<Venue, "city" | "region_code" | "postal_code">[]) {
    if (row.city) {
      suggestions.add(
        row.region_code ? `${row.city}, ${row.region_code}` : row.city
      );
    }
    if (row.postal_code) suggestions.add(row.postal_code);
  }
  return Array.from(suggestions).sort();
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
