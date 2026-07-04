import type { Venue, VenueExternalSource } from "@/lib/venues";

export type VenueSeedRow = {
  name?: unknown;
  venue_type?: unknown;
  city?: unknown;
  region_code?: unknown;
  country_code?: unknown;
  formatted_address?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  website?: unknown;
  phone?: unknown;
  email?: unknown;
  discord_invite_url?: unknown;
  instagram_url?: unknown;
  facebook_url?: unknown;
  venue_categories?: unknown;
  supported_game_systems?: unknown;
  source?: unknown;
  source_id?: unknown;
  source_url?: unknown;
  confidence?: unknown;
  external_payload?: unknown;
};

export type VenueInsert = Partial<Venue> & Pick<Venue, "name" | "venue_type">;
export type ExternalSourceInsert = Partial<VenueExternalSource> & Pick<VenueExternalSource, "source">;

export type ValidationResult =
  | { ok: true; row: NormalizedVenueSeedRow; warnings: string[] }
  | { ok: false; errors: string[]; warnings: string[] };

export type NormalizedVenueSeedRow = {
  name: string;
  venue_type: string;
  city: string | null;
  region_code: string | null;
  country_code: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  discord_invite_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  venue_categories: string[];
  supported_game_systems: string[];
  source: string | null;
  source_id: string | null;
  source_url: string | null;
  confidence: number | null;
  external_payload: Record<string, unknown> | null;
};

const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

export function normalizeVenueName(name: string): string {
  return name.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").replace(/\b(the|llc|inc|ltd)\b/g, "").replace(/\s+/g, " ").trim();
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return digits.length >= 7 ? `+${digits}` : null;
}

export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.match(/^https?:\/\//i) ? url : `https://${url}`);
    parsed.hash = "";
    parsed.search = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    parsed.pathname = parsed.pathname.replace(/\/$/, "");
    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  return address.trim().toLowerCase().replace(/\b(street)\b/g, "st").replace(/\b(avenue)\b/g, "ave").replace(/\b(road)\b/g, "rd").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim() || null;
}

function numberOrNull(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function validateVenueSeedRow(input: VenueSeedRow): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const name = stringOrNull(input.name);
  const venue_type = stringOrNull(input.venue_type);
  const city = stringOrNull(input.city);
  const region_code = stringOrNull(input.region_code)?.toUpperCase() ?? null;
  const country_code = stringOrNull(input.country_code)?.toUpperCase() ?? null;
  const formatted_address = stringOrNull(input.formatted_address);
  const latitude = numberOrNull(input.latitude);
  const longitude = numberOrNull(input.longitude);
  const confidence = numberOrNull(input.confidence);

  if (!name) errors.push("name is required");
  if (!venue_type) errors.push("venue_type is required");
  if (!formatted_address && !(city && region_code && country_code)) errors.push("provide formatted_address or city, region_code, and country_code");
  if ((latitude === null) !== (longitude === null)) errors.push("latitude and longitude must be supplied together");
  if (latitude === null || longitude === null) warnings.push("latitude/longitude are strongly preferred");
  if (confidence !== null && (confidence < 0 || confidence > 1)) errors.push("confidence must be between 0 and 1");
  if (errors.length || !name || !venue_type) return { ok: false, errors, warnings };

  return { ok: true, warnings, row: { name, venue_type, city, region_code, country_code, formatted_address, latitude, longitude, website: normalizeUrl(stringOrNull(input.website)), phone: normalizePhone(stringOrNull(input.phone)), email: stringOrNull(input.email), discord_invite_url: normalizeUrl(stringOrNull(input.discord_invite_url)), instagram_url: normalizeUrl(stringOrNull(input.instagram_url)), facebook_url: normalizeUrl(stringOrNull(input.facebook_url)), venue_categories: stringArray(input.venue_categories), supported_game_systems: stringArray(input.supported_game_systems), source: stringOrNull(input.source), source_id: stringOrNull(input.source_id), source_url: normalizeUrl(stringOrNull(input.source_url)), confidence, external_payload: input.external_payload && typeof input.external_payload === "object" && !Array.isArray(input.external_payload) ? input.external_payload as Record<string, unknown> : null } };
}

export function mapSeedRowToVenueInsert(row: NormalizedVenueSeedRow): VenueInsert {
  return { name: row.name, venue_type: row.venue_type, city: row.city, region_code: row.region_code, country_code: row.country_code, formatted_address: row.formatted_address, region: [row.city, row.region_code, row.country_code].filter(Boolean).join(", ") || row.formatted_address, latitude: row.latitude, longitude: row.longitude, website: row.website, phone: row.phone, email: row.email, discord_invite_url: row.discord_invite_url, instagram_url: row.instagram_url, facebook_url: row.facebook_url, venue_categories: row.venue_categories, supported_game_systems: row.supported_game_systems, canonical_source: "import", source_of_truth: "import", confidence: row.confidence, source_payload: row.external_payload };
}

export function mapSeedRowToExternalSourceInsert(row: NormalizedVenueSeedRow): ExternalSourceInsert | null {
  if (!row.source && !row.source_id && !row.source_url) return null;
  return { source: row.source ?? "unknown", source_id: row.source_id, source_url: row.source_url, external_name: row.name, external_payload: row.external_payload, confidence: row.confidence };
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const r = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(x));
}

export function scoreVenueMatch(row: NormalizedVenueSeedRow, venue: Partial<Venue>, sources: Partial<VenueExternalSource>[] = []): number {
  if (row.source && row.source_id && sources.some((s) => s.source === row.source && s.source_id === row.source_id)) return 1;
  let score = 0;
  if (row.phone && venue.phone && row.phone === normalizePhone(venue.phone)) score += 0.45;
  if (normalizeVenueName(row.name) === normalizeVenueName(venue.name ?? "")) score += 0.25;
  if (normalizeAddress(row.formatted_address) && normalizeAddress(row.formatted_address) === normalizeAddress(venue.formatted_address)) score += 0.35;
  if (row.latitude !== null && row.longitude !== null && venue.latitude != null && venue.longitude != null && distanceMeters(row.latitude, row.longitude, venue.latitude, venue.longitude) <= 100) score += 0.35;
  return Math.min(score, 1);
}
