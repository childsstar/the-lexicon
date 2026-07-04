#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const file = args.find((arg) => !arg.startsWith("--"));

if (!file) {
  console.error("Usage: node scripts/import-venues.mjs <venues.json> [--apply]");
  process.exit(1);
}

if (apply) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("Apply mode is guarded: set SUPABASE_SERVICE_ROLE_KEY in a server/admin environment first.");
    process.exit(1);
  }
  if (serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Refusing to write with a browser-exposed Supabase anon key.");
    process.exit(1);
  }
  console.error("Apply mode is intentionally not implemented yet. Review dry-run output before wiring writes.");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
if (!Array.isArray(rows)) throw new Error("Venue seed file must contain a JSON array.");

const norm = (s) => typeof s === "string" ? s.trim() : "";
const normName = (s) => norm(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").replace(/\b(the|llc|inc|ltd)\b/g, "").replace(/\s+/g, " ").trim();
const normPhone = (s) => {
  const d = norm(s).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return d.length >= 7 ? `+${d}` : "";
};
const normAddress = (s) => norm(s).toLowerCase().replace(/\b(street)\b/g, "st").replace(/\b(avenue)\b/g, "ave").replace(/\b(road)\b/g, "rd").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const meters = (a, b) => {
  const r = 6371000, rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude), dLng = rad(b.longitude - a.longitude);
  const x = Math.sin(dLat/2)**2 + Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLng/2)**2;
  return 2 * r * Math.asin(Math.sqrt(x));
};

const invalid = [];
const valid = [];
for (const [i, row] of rows.entries()) {
  const errors = [];
  if (!norm(row.name)) errors.push("name is required");
  if (!norm(row.venue_type)) errors.push("venue_type is required");
  if (!norm(row.formatted_address) && !(norm(row.city) && norm(row.region_code) && norm(row.country_code))) errors.push("provide formatted_address or city, region_code, and country_code");
  if ((row.latitude == null) !== (row.longitude == null)) errors.push("latitude and longitude must be supplied together");
  if (errors.length) invalid.push({ row: i + 1, errors }); else valid.push(row);
}

let likelyUpdates = 0;
let ambiguousMatches = 0;
const seen = new Map();
for (const row of valid) {
  const keys = [
    row.source && row.source_id ? `src:${row.source}:${row.source_id}` : "",
    normPhone(row.phone) ? `phone:${normPhone(row.phone)}` : "",
    norm(row.formatted_address) ? `nameaddr:${normName(row.name)}:${normAddress(row.formatted_address)}` : "",
  ].filter(Boolean);
  let matched = false;
  for (const key of keys) {
    if (seen.has(key)) matched = true;
    seen.set(key, row);
  }
  for (const other of valid) {
    if (other === row) continue;
    if (normName(other.name) === normName(row.name) && Number.isFinite(other.latitude) && Number.isFinite(row.latitude) && meters(other, row) <= 100) matched = true;
    if (normName(other.name) === normName(row.name) && !norm(row.formatted_address) && !Number.isFinite(row.latitude)) ambiguousMatches += 1;
  }
  if (matched) likelyUpdates += 1;
}

const summary = {
  mode: "dry-run",
  rowsParsed: rows.length,
  validRows: valid.length,
  invalidRows: invalid.length,
  likelyInserts: Math.max(valid.length - likelyUpdates, 0),
  likelyUpdates,
  ambiguousMatches,
};
console.log(JSON.stringify(summary, null, 2));
if (invalid.length) console.log(JSON.stringify({ invalid }, null, 2));
