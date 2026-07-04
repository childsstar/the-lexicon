#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
const isCli = import.meta.url === `file://${process.argv[1]}`;
const args = isCli ? process.argv.slice(2) : ["scripts/fixtures/venues.sample.json"];
const apply = isCli && args.includes("--apply");
const reportPathIndex = args.indexOf("--report-path");
const reportPath = reportPathIndex >= 0 ? args[reportPathIndex + 1] : null;
const reportValueIndex = reportPathIndex >= 0 ? reportPathIndex + 1 : -1;
const file = args.find((arg, i) => !arg.startsWith("--") && i !== reportValueIndex);

if (isCli && (!file || (reportPathIndex >= 0 && !reportPath))) {
  console.error("Usage: node scripts/import-venues.mjs <venues.json> [--apply] [--report-path <report.json>]");
  process.exit(1);
}

export function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function assertApplyEnv() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Apply mode is guarded: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in a server/admin environment first.");
    process.exit(1);
  }
  const publicKeys = [process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.SUPABASE_ANON_KEY].filter(Boolean);
  const payload = decodeJwtPayload(serviceKey);
  if (publicKeys.includes(serviceKey) || payload?.role === "anon" || payload?.role === "public") {
    console.error("Refusing to write with a browser-exposed Supabase anon/public key.");
    process.exit(1);
  }
  return { supabaseUrl, serviceKey };
}

const applyEnv = apply ? assertApplyEnv() : null;

const rows = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
if (!Array.isArray(rows)) throw new Error("Venue seed file must contain a JSON array.");

const importBatchId = randomUUID();
const now = new Date().toISOString();
const norm = (s) => typeof s === "string" ? s.trim() : "";
const strOrNull = (s) => norm(s) || null;
const normName = (s) => norm(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").replace(/\b(the|llc|inc|ltd)\b/g, "").replace(/\s+/g, " ").trim();
const normPhone = (s) => {
  const d = norm(s).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return d.length >= 7 ? `+${d}` : null;
};
const normAddress = (s) => norm(s).toLowerCase().replace(/\b(street)\b/g, "st").replace(/\b(avenue)\b/g, "ave").replace(/\b(road)\b/g, "rd").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const normUrl = (url) => {
  const value = norm(url);
  if (!value) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    parsed.hash = ""; parsed.search = ""; parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, ""); parsed.pathname = parsed.pathname.replace(/\/$/, "");
    return parsed.toString();
  } catch { return null; }
};
const stringArray = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
const numOrNull = (value) => { const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN; return Number.isFinite(n) ? n : null; };
const meters = (a, b) => {
  const r = 6371000, rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude), dLng = rad(b.longitude - a.longitude);
  const x = Math.sin(dLat/2)**2 + Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLng/2)**2;
  return 2 * r * Math.asin(Math.sqrt(x));
};

export function normalizeRow(row) {
  const latitude = numOrNull(row.latitude);
  const longitude = numOrNull(row.longitude);
  return {
    name: norm(row.name), venue_type: norm(row.venue_type), city: strOrNull(row.city), region_code: strOrNull(row.region_code)?.toUpperCase() ?? null,
    country_code: strOrNull(row.country_code)?.toUpperCase() ?? null, formatted_address: strOrNull(row.formatted_address), latitude, longitude,
    website: normUrl(row.website), phone: normPhone(row.phone), email: strOrNull(row.email), discord_invite_url: normUrl(row.discord_invite_url),
    instagram_url: normUrl(row.instagram_url), facebook_url: normUrl(row.facebook_url), venue_categories: stringArray(row.venue_categories),
    supported_game_systems: stringArray(row.supported_game_systems), source: strOrNull(row.source), source_id: strOrNull(row.source_id), source_url: normUrl(row.source_url),
    confidence: numOrNull(row.confidence), external_payload: row.external_payload && typeof row.external_payload === "object" && !Array.isArray(row.external_payload) ? row.external_payload : null,
  };
}

const invalid = [];
const valid = [];
for (const [i, raw] of rows.entries()) {
  const row = normalizeRow(raw);
  const errors = [];
  if (!row.name) errors.push("name is required");
  if (!row.venue_type) errors.push("venue_type is required");
  if (!row.formatted_address && !(row.city && row.region_code && row.country_code)) errors.push("provide formatted_address or city, region_code, and country_code");
  if ((row.latitude === null) !== (row.longitude === null)) errors.push("latitude and longitude must be supplied together");
  if (row.confidence !== null && (row.confidence < 0 || row.confidence > 1)) errors.push("confidence must be between 0 and 1");
  if (errors.length) invalid.push({ row: i + 1, errors }); else valid.push({ rowNumber: i + 1, row });
}

export function venuePayload(row) {
  return { name: row.name, venue_type: row.venue_type, city: row.city, region_code: row.region_code, country_code: row.country_code, formatted_address: row.formatted_address, region: [row.city, row.region_code, row.country_code].filter(Boolean).join(", ") || row.formatted_address, latitude: row.latitude, longitude: row.longitude, website: row.website, phone: row.phone, email: row.email, discord_invite_url: row.discord_invite_url, instagram_url: row.instagram_url, facebook_url: row.facebook_url, venue_categories: row.venue_categories, supported_game_systems: row.supported_game_systems, canonical_source: "import", source_of_truth: "import", confidence: row.confidence, import_batch_id: importBatchId, source_payload: row.external_payload, last_seen_at: now };
}
export function externalPayload(row, venueId) {
  if (!row.source && !row.source_id && !row.source_url) return null;
  return { venue_id: venueId, source: row.source ?? "unknown", source_id: row.source_id, source_url: row.source_url, external_name: row.name, external_payload: row.external_payload, confidence: row.confidence, last_seen_at: now };
}
export function safeUpdate(row, venue) {
  const incoming = venuePayload(row);
  const update = { import_batch_id: importBatchId, last_seen_at: now };
  const safeFields = ["address_line1","address_line2","city","region_code","postal_code","country_code","formatted_address","latitude","longitude","website","phone","email","discord_invite_url","instagram_url","facebook_url","venue_categories","supported_game_systems","confidence","source_payload"];
  const importOwned = venue.canonical_source === "import" || venue.source_of_truth === "import";
  for (const field of safeFields) {
    const value = incoming[field];
    const existing = venue[field];
    const empty = existing == null || existing === "" || (Array.isArray(existing) && existing.length === 0);
    if (value != null && (!(Array.isArray(value) && value.length === 0)) && (empty || importOwned)) update[field] = value;
  }
  if (!venue.name) update.name = row.name;
  if (!venue.venue_type) update.venue_type = row.venue_type;
  if (!venue.region && incoming.region) update.region = incoming.region;
  return update;
}
export function score(row, venue, sources = []) {
  if (row.source && row.source_id && sources.some((s) => s.source === row.source && s.source_id === row.source_id)) return 1;
  let s = 0;
  if (row.phone && venue.phone && row.phone === normPhone(venue.phone)) s += 0.45;
  if (normName(row.name) === normName(venue.name ?? "")) s += 0.25;
  if (normAddress(row.formatted_address) && normAddress(row.formatted_address) === normAddress(venue.formatted_address)) s += 0.35;
  if (row.latitude !== null && row.longitude !== null && venue.latitude != null && venue.longitude != null && meters(row, venue) <= 100) s += 0.35;
  return Math.min(s, 1);
}

const report = { mode: apply ? "apply" : "dry-run", import_batch_id: importBatchId, rowsParsed: rows.length, validRows: valid.length, invalidRows: invalid.length, inserted: [], updated: [], skipped: [], invalid, ambiguous: [] };

async function main() {
  if (!apply) {
    report.likelyInserts = valid.length;
    report.likelyUpdates = 0;
    report.ambiguousMatches = 0;
    return report;
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(applyEnv.supabaseUrl, applyEnv.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: venues, error: venuesError } = await supabase.from("venues").select("*").limit(10000);
  if (venuesError) throw venuesError;
  const { data: sources, error: sourcesError } = await supabase.from("venue_external_sources").select("*").limit(10000);
  if (sourcesError) throw sourcesError;
  const sourcesByVenue = new Map();
  for (const source of sources ?? []) sourcesByVenue.set(source.venue_id, [...(sourcesByVenue.get(source.venue_id) ?? []), source]);

  for (const item of valid) {
    const matches = (venues ?? []).map((venue) => ({ venue, score: score(item.row, venue, sourcesByVenue.get(venue.id) ?? []) })).filter((m) => m.score >= 0.6).sort((a, b) => b.score - a.score);
    if (matches.length > 1 && matches[1].score >= 0.6 && matches[0].score - matches[1].score < 0.2) {
      report.ambiguous.push({ row: item.rowNumber, name: item.row.name, candidates: matches.map((m) => ({ id: m.venue.id, name: m.venue.name, formatted_address: m.venue.formatted_address, score: m.score })) });
      continue;
    }
    if (matches[0]) {
      const patch = safeUpdate(item.row, matches[0].venue);
      const { error } = await supabase.from("venues").update(patch).eq("id", matches[0].venue.id);
      if (error) throw error;
      const ext = externalPayload(item.row, matches[0].venue.id);
      if (ext) {
        const query = ext.source_id ? supabase.from("venue_external_sources").upsert(ext, { onConflict: "source,source_id" }) : supabase.from("venue_external_sources").insert(ext);
        const { error: extError } = await query;
        if (extError) throw extError;
      }
      report.updated.push({ row: item.rowNumber, venue_id: matches[0].venue.id, fields: Object.keys(patch) });
    } else {
      const { data, error } = await supabase.from("venues").insert(venuePayload(item.row)).select("id").single();
      if (error) throw error;
      const ext = externalPayload(item.row, data.id);
      if (ext) {
        const query = ext.source_id ? supabase.from("venue_external_sources").upsert(ext, { onConflict: "source,source_id" }) : supabase.from("venue_external_sources").insert(ext);
        const { error: extError } = await query;
        if (extError) throw extError;
      }
      report.inserted.push({ row: item.rowNumber, venue_id: data.id, name: item.row.name });
    }
  }
  return report;
}

if (isCli) {
  main().then((finalReport) => {
    finalReport.skippedRows = finalReport.skipped.length;
    finalReport.insertedRows = finalReport.inserted.length;
    finalReport.updatedRows = finalReport.updated.length;
    finalReport.ambiguousRows = finalReport.ambiguous.length;
    if (reportPath) fs.writeFileSync(path.resolve(reportPath), `${JSON.stringify(finalReport, null, 2)}\n`);
    console.log(JSON.stringify(finalReport, null, 2));
  }).catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  });
}
