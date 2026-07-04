#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { normalizeRow, safeUpdate, venuePayload } from "./import-venues.mjs";

const output = execFileSync("node", ["scripts/import-venues.mjs", "scripts/fixtures/venues.sample.json"], { encoding: "utf8" });
const summary = JSON.parse(output);
assert.equal(summary.mode, "dry-run");
assert.equal(summary.rowsParsed, 3);
assert.equal(summary.validRows, 3);
assert.equal(summary.invalidRows, 0);
assert.equal(summary.likelyInserts, 3);
assert.match(summary.import_batch_id, /^[0-9a-f-]{36}$/);

const reportPath = path.join(os.tmpdir(), `venue-import-${process.pid}.json`);
const reportOutput = execFileSync("node", ["scripts/import-venues.mjs", "scripts/fixtures/venues.sample.json", "--report-path", reportPath], { encoding: "utf8" });
assert.deepEqual(JSON.parse(fs.readFileSync(reportPath, "utf8")), JSON.parse(reportOutput));
fs.rmSync(reportPath, { force: true });

const missingEnv = spawnSync("node", ["scripts/import-venues.mjs", "scripts/fixtures/venues.sample.json", "--apply"], { encoding: "utf8", env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" } });
assert.notEqual(missingEnv.status, 0);
assert.match(missingEnv.stderr, /SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/);

const anonPayload = Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url");
const anonKey = `x.${anonPayload}.x`;
const anonEnv = spawnSync("node", ["scripts/import-venues.mjs", "scripts/fixtures/venues.sample.json", "--apply"], { encoding: "utf8", env: { ...process.env, SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: anonKey } });
assert.notEqual(anonEnv.status, 0);
assert.match(anonEnv.stderr, /anon\/public key/);

const row = normalizeRow({ name: " Test & Games ", venue_type: "game_store", city: "brooklyn", region_code: "ny", country_code: "us", phone: "(555) 123-4567", website: "www.example.com/path?x=1", venue_categories: ["retail", ""] });
assert.equal(row.region_code, "NY");
assert.equal(row.country_code, "US");
assert.equal(row.phone, "+15551234567");
assert.equal(row.website, "https://example.com/path");
assert.deepEqual(row.venue_categories, ["retail"]);
const insert = venuePayload(row);
assert.equal(insert.canonical_source, "import");
assert.equal(insert.source_of_truth, "import");
assert.equal(insert.region, "brooklyn, NY, US");
const protectedPatch = safeUpdate(row, { id: "1", name: "Community Name", venue_type: "club", description: "Keep", created_by: "user", canonical_source: "community", source_of_truth: "community", phone: "+15550000000", city: null });
assert.equal(protectedPatch.phone, undefined);
assert.equal(protectedPatch.name, undefined);
assert.equal(protectedPatch.city, "brooklyn");
const importOwnedPatch = safeUpdate(row, { id: "2", name: "Import Name", venue_type: "game_store", canonical_source: "import", source_of_truth: "import", phone: "+15550000000" });
assert.equal(importOwnedPatch.phone, "+15551234567");

console.log("venue import validation passed");
