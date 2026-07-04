#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const output = execFileSync("node", ["scripts/import-venues.mjs", "scripts/fixtures/venues.sample.json"], { encoding: "utf8" });
const summary = JSON.parse(output);
assert.equal(summary.rowsParsed, 3);
assert.equal(summary.validRows, 3);
assert.equal(summary.invalidRows, 0);
assert.equal(summary.likelyInserts, 3);
console.log("venue import validation passed");
